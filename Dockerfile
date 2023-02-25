FROM node:10.24.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm ci --only=production

RUN npm run build

# Bundle app source
COPY . .

CMD [ "npm","run","serve-build" ]