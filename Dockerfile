FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Install ALL dependencies (including dev) to ensure tsc and rimraf are available for the build step
RUN npm ci --include=dev

# Copy source code and config
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
