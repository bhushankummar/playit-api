FROM node:10.24.1

# Create app directory
WORKDIR /usr/src/app

COPY . .
# If you are building your code for production
RUN npm install -g typescript@3.9.10
RUN npm install
RUN npm run build:direct
RUN ls -la

CMD [ "npm","run","start" ]
#CMD [ "npm","run","serve-build" ]