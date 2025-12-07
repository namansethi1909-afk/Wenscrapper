FROM ghcr.io/puppeteer/puppeteer:23.10.1

USER root
WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build the app
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
