const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const pLimit = require("p-limit").default;
require("dotenv").config();
const connectDB = require("../backend/config/connectDB");

const Book = require("../backend/models/Book");

class BookScraper {
  constructor() {
    this.baseUrl = "https://books.toscrape.com";
    this.browser = null;
    this.page = null;
    this.scrapedBooks = [];
    this.limit = pLimit(5);
  }

  async initialize() {
    console.log("Initializing scraper...");

    await connectDB();

    this.browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();

    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    console.log("Browser initialized");
  }

  async scrapeAllPages() {
    console.log("Starting to scrape all pages...");
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= 2) {
      console.log(`Scraping page ${currentPage}...`);

      const pageUrl =
        currentPage === 1
          ? this.baseUrl
          : `${this.baseUrl}/catalogue/page-${currentPage}.html`;

      try {
        await this.page.goto(pageUrl, { waitUntil: "networkidle2" });

        const pageTitle = await this.page.title();
        if (pageTitle.includes("404")) {
          console.log(`Page ${currentPage} not found. Stopping.`);
          hasNextPage = false;
          break;
        }

        const books = await this.scrapeBooksFromPage();
        this.scrapedBooks.push(...books);

        console.log(`Found ${books.length} books on page ${currentPage}`);

        hasNextPage = await this.page.evaluate(() => {
          const nextButton = document.querySelector(".next > a");
          return nextButton !== null;
        });

        currentPage++;

        await this.delay(1000);
      } catch (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        hasNextPage = false;
      }
    }

    console.log(
      `Scraping completed. Total books found: ${this.scrapedBooks.length}`
    );
    return this.scrapedBooks;
  }

  async scrapeBooksFromPage() {
    return await this.page.evaluate((baseUrl) => {
      const bookElements = document.querySelectorAll(".product_pod");
      const books = [];

      bookElements.forEach((bookElement) => {
        try {
          const titleElement = bookElement.querySelector("h3 > a");
          const priceElement = bookElement.querySelector(".price_color");
          const stockElement = bookElement.querySelector(".availability");
          const ratingElement = bookElement.querySelector(".star-rating");
          const imageElement = bookElement.querySelector(
            ".image_container img"
          );

          if (!titleElement || !priceElement) return;

          const title =
            titleElement.getAttribute("title") ||
            titleElement.textContent.trim();
          const relativeUrl = titleElement.getAttribute("href");
          const bookDetailPageUrl = baseUrl + "/catalogue/" + relativeUrl;

          const priceText = priceElement.textContent.trim();
          const price = parseFloat(priceText.replace("£", ""));

          const stockText = stockElement.textContent.trim();
          const stockAvailability = stockText.includes("In stock")
            ? "In stock"
            : "Out of stock";

          let rating = 0;
          if (ratingElement) {
            const ratingClass = ratingElement.className;
            if (ratingClass.includes("One")) rating = 1;
            else if (ratingClass.includes("Two")) rating = 2;
            else if (ratingClass.includes("Three")) rating = 3;
            else if (ratingClass.includes("Four")) rating = 4;
            else if (ratingClass.includes("Five")) rating = 5;
          }

          let thumbnailImageUrl = "";
          if (imageElement) {
            const imgSrc = imageElement.getAttribute("src");
            thumbnailImageUrl = baseUrl + "/" + imgSrc.replace("../", "");
          }

          books.push({
            title,
            price,
            stockAvailability,
            rating,
            bookDetailPageUrl,
            thumbnailImageUrl,
          });
        } catch (error) {
          console.error("Error parsing book element:", error);
        }
      });

      return books;
    }, this.baseUrl);
  }

  async enhanceBookDetails() {
    console.log("Enhancing book details...");

    const enhancedBooks = await Promise.all(
      this.scrapedBooks.map((book) =>
        this.limit(() => this.getBookDetails(book))
      )
    );

    return enhancedBooks;
  }

  async getBookDetails(book) {
    try {
      const detailPage = await this.browser.newPage();
      await detailPage.goto(book.bookDetailPageUrl, {
        waitUntil: "networkidle2",
      });

      const enhancedBook = await detailPage.evaluate((bookData) => {
        const descriptionElement = document.querySelector(
          "#product_description + p"
        );
        const categoryElement = document.querySelector(
          ".breadcrumb li:nth-child(3) a"
        );
        const tableRows = document.querySelectorAll(".table-striped tr");

        let description = "";
        let category = "";
        let author = "";

        if (descriptionElement) {
          description = descriptionElement.textContent.trim();
        }

        if (categoryElement) {
          category = categoryElement.textContent.trim();
        }

        tableRows.forEach((row) => {
          const header = row.querySelector("th");
          const value = row.querySelector("td");
          if (header && value && header.textContent.includes("Author")) {
            author = value.textContent.trim();
          }
        });

        return {
          ...bookData,
          description,
          category,
          author,
        };
      }, book);

      await detailPage.close();
      await this.delay(500);

      return enhancedBook;
    } catch (error) {
      console.error(`Error getting details for ${book.title}:`, error);
      return book;
    }
  }

  async saveToDatabase(books) {
    console.log("Saving books to database...");

    try {
      await Book.deleteMany({});
      console.log("Cleared existing books from database");

      const savedBooks = await Book.insertMany(books);
      console.log(`Saved ${savedBooks.length} books to database`);

      return savedBooks;
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    await mongoose.connection.close();
    console.log("Cleanup completed");
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async run() {
    try {
      await this.initialize();

      await this.scrapeAllPages();

      const enhancedBooks = await this.enhanceBookDetails();

      await this.saveToDatabase(enhancedBooks);

      console.log("Scraping completed successfully!");
      console.log(`Total books scraped: ${enhancedBooks.length}`);
    } catch (error) {
      console.error("Scraping failed:", error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

if (require.main === module) {
  const scraper = new BookScraper();
  scraper.run();
}

module.exports = BookScraper;
