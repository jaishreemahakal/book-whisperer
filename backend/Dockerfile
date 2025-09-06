FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --only=production

COPY scraper/package*.json ./scraper/
WORKDIR /app/scraper
RUN npm ci --only=production

WORKDIR /app

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