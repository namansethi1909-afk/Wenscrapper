FROM ghcr.io/puppeteer/puppeteer:23.10.1

USER root

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for tsc)
# We need to ensure all deps are installed
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD [ "npm", "start" ]
