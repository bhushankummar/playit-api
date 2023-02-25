FROM node:10.24.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .
# COPY .eslintrc .
# COPY .eslintignore .

# If you are building your code for production
# RUN npm install
RUN npm ci --only=production
# RUN ls -la
RUN npm run build:direct
RUN ls -la
# Bundle app source
# COPY . .

CMD [ "npm","run","serve-build" ]