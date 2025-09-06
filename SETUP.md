# Book Explorer Setup Guide

Complete setup instructions for running the Book Explorer application locally.

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## Quick Setup (Recommended)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd book-explorer

npm run install:all
```

### 2. Environment Configuration

Create environment files for each service:

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/book-explorer
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Scraper** (`scraper/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/book-explorer
SCRAPER_DELAY_MS=1000
SCRAPER_CONCURRENT_REQUESTS=5
```

**Frontend** (`frontend/.env.local`):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: Docker**
```bash
# Start MongoDB in Docker
docker run -d --name mongodb -p 27017:27017 mongo:6.0
```

**Option C: MongoDB Atlas**
Update the `MONGODB_URI` in your `.env` files with your Atlas connection string.

### 4. Initial Data Setup

Run the scraper to populate your database:
```bash
npm run scrape
```

This will:
- Scrape all books from Books to Scrape website
- Extract book details, ratings, prices, stock status
- Store everything in your MongoDB database
- Take 5-10 minutes depending on your connection

### 5. Start the Application

```bash
npm run dev
```

This starts:
- **Backend API** at `http://localhost:3001`
- **Frontend** at `http://localhost:3000`

## Manual Setup (Step by Step)

If you prefer to set up each service individually:

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Scraper Setup

```bash
cd scraper
npm install
cp .env.example .env
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Docker Setup

For containerized deployment:

```bash
docker-compose up -d

docker-compose logs -f

docker-compose down
```

## Verification

### Check if everything is working:

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Database Connection**:
   ```bash
   curl http://localhost:3001/api/books/stats
   ```

3. **Frontend**: Open `http://localhost:3000` in your browser

4. **Books Data**: You should see books loaded in the frontend interface

## Troubleshooting

### Common Issues

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running
- Check your connection string in `.env` files
- For Atlas: Check network access and credentials

**"Module not found" errors**
- Run `npm run install:all` from the root directory
- Delete `node_modules` and run `npm install` in each folder

**"CORS errors" in browser**
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Ensure backend is running on the expected port

**"No books found"**
- Run the scraper: `npm run scrape`
- Check scraper logs for any errors
- Verify database connection

**Scraper fails**
- Check your internet connection
- The target website might be temporarily unavailable
- Try running with `npm run dev:scraper` for detailed logs

### Performance Tips

**For faster scraping:**
- Increase `SCRAPER_CONCURRENT_REQUESTS` (but be respectful)
- Decrease `SCRAPER_DELAY_MS` (but be respectful)

**For development:**
- Use nodemon for auto-restart: `npm run dev:backend`
- Enable React Fast Refresh in your browser dev tools

## Environment Variables Reference

### Backend Variables
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

### Scraper Variables
- `MONGODB_URI` - MongoDB connection string (same as backend)
- `SCRAPER_DELAY_MS` - Delay between requests (ms)
- `SCRAPER_CONCURRENT_REQUESTS` - Max concurrent requests
- `SCRAPER_HEADLESS` - Run browser in headless mode
- `TARGET_URL` - Website to scrape (default: books.toscrape.com)

### Frontend Variables
- `REACT_APP_API_URL` - Backend API base URL

## Production Deployment

For production deployment, see the main README.md file for detailed instructions on deploying to various platforms.

## Support

If you encounter issues:
1. Check the logs in each service
2. Verify all environment variables are set correctly
3. Ensure all services can communicate with each other
4. Check the GitHub Issues page for common problems