# Core container — PWA Audit CLI tool
FROM node:20-alpine

# Install Chromium for Lighthouse audits
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

# Tell chrome-launcher to use the installed Chromium
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# Remove devDependencies to reduce image size
RUN npm prune --production

# Config files are mounted via docker-compose volumes at /config

# Default command: show help
CMD ["node", "dist/index.js", "--help"]
