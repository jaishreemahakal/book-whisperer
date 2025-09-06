FROM node:18-alpine

WORKDIR /app

# Copy backend package.json first
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy scraper package.json and install scraper dependencies
COPY scraper/package*.json ./scraper/
WORKDIR /app/scraper
RUN npm ci --only=production

# Go back to app directory
WORKDIR /app

# Copy all source code
COPY backend/ .
COPY scraper/ ./scraper

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]