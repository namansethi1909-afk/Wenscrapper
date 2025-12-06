FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy source code and config
COPY . .

EXPOSE 3000

# Use start:api to run server.ts via ts-node
CMD ["npm", "run", "start:api"]
