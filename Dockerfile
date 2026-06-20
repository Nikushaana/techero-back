# Use a slim image to keep things fast
FROM node:20-slim

# Set non-interactive mode so it doesn't wait for user input
ENV DEBIAN_FRONTEND=noninteractive

# Combine all updates and installs into ONE layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    wget \
    # Add these specifically if you use Puppeteer
    libxss1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/main.js"]