FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Force install ALL dependencies (including devDependencies like typescript) 
# checks if NODE_ENV is preventing it.
RUN npm install --include=dev

COPY . .

# Run the build script (tsc)
RUN npm run build

# (Optional) Remove dev dependencies to slim down the image
# RUN npm prune --production

EXPOSE 3000

CMD [ "npm", "start" ]
