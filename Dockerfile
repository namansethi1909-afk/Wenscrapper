FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy source code and config
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Use npm start (which now runs node dist/api/server.js)
CMD ["npm", "start"]
