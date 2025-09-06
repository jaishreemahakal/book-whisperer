# Book Explorer 📚

A full-stack web application that scrapes book data from [Books to Scrape](https://books.toscrape.com/), stores it in a database, and presents it through a beautiful, searchable interface.

## 🌟 Features

### 📊 Data Scraper
- **Automated scraping** of all pages from Books to Scrape
- **Comprehensive data extraction**: Title, Price, Stock, Rating, Images, Descriptions
- **Respectful scraping** with delays and rate limiting
- **Database persistence** with MongoDB
- **Scheduled refresh** capability

### 🚀 Backend API
- **RESTful API** built with Node.js and Express
- **Paginated book listings** with advanced filtering
- **Search functionality** by title, author, and description
- **Filter options**: Rating, price range, stock status, category
- **Individual book details** endpoint
- **Refresh trigger** for re-scraping data
- **Rate limiting** and security middleware

### 🎨 Frontend Interface
- **Beautiful, responsive design** with literary theme
- **Advanced search and filtering** interface
- **Card-based book display** with hover effects
- **Detailed book modals** with comprehensive information
- **Pagination** for large collections
- **Real-time statistics** dashboard
- **Mobile-optimized** experience

## 🏗️ Architecture

```
book-explorer/
├── backend/          # Node.js/Express API server
├── scraper/          # Puppeteer-based web scraper
├── frontend/         # React application
├── package.json      # Root package management
└── README.md         # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Express Validator** for input validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

### Scraper
- **Puppeteer** for headless browser automation
- **Cheerio** for HTML parsing
- **P-limit** for concurrency control
- **Axios** for HTTP requests

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **React Router** for navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or connection string
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd book-explorer
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Backend (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/book-explorer
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Scraper (`scraper/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/book-explorer
SCRAPER_DELAY_MS=1000
SCRAPER_CONCURRENT_REQUESTS=5
```

Frontend (`frontend/.env.local`):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the scraper** (first time setup)
```bash
npm run scrape
```

6. **Start the development servers**
```bash
npm run dev
```

This will start:
- Backend API at `http://localhost:3001`
- Frontend at `http://localhost:3000`

## 📖 Usage

### Running the Scraper

```bash
npm run scrape

cd scraper && npm run dev
```

### API Endpoints

```bash
GET /api/books?page=1&limit=20&search=python&category=Technology

GET /api/books/:id

GET /api/books/stats

POST /api/refresh

GET /health
```

### Example API Usage

```javascript
const response = await fetch('/api/books?search=python&minRating=4&page=1');
const data = await response.json();

const refresh = await fetch('/api/refresh', { method: 'POST' });
```

## 🔧 Development

### Project Structure

#### Backend (`/backend`)
```
backend/
├── models/           # MongoDB schemas
├── routes/           # Express route handlers  
├── server.js         # Main server file
└── package.json      # Backend dependencies
```

#### Scraper (`/scraper`)
```
scraper/
├── scraper.js        # Main scraping logic
└── package.json      # Scraper dependencies
```

#### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/   # React components
│   ├── services/     # API integration
│   ├── types/        # TypeScript definitions
│   └── pages/        # Page components
└── package.json      # Frontend dependencies
```

### Available Scripts

```bash
npm run install:all

npm run dev

npm run dev:backend
npm run dev:frontend
npm run dev:scraper

npm run build

npm run test

npm run scrape
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (MongoDB Atlas recommended)
2. Deploy to your preferred platform (Heroku, Railway, etc.)
3. Set environment variables
4. Run scraper to populate initial data

### Frontend Deployment
1. Update API URL in environment variables
2. Build the project: `npm run build`
3. Deploy `dist` folder to static hosting (Vercel, Netlify, etc.)

### Database Schema

Books are stored with the following schema:
```javascript
{
  title: String,
  price: Number,
  stockAvailability: String, 
  rating: Number, 
  bookDetailPageUrl: String,
  thumbnailImageUrl: String,
  description: String,
  category: String,
  author: String,
  scrapedAt: Date,
  lastUpdated: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �� Acknowledgments

- [Books to Scrape](https://books.toscrape.com/) for providing a scraping-friendly demo site
- The open-source community for the amazing tools and libraries used in this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/book-explorer/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about your environment and the issue

---

**Happy Reading! 📚✨**