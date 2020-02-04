FROM node:latest
MAINTAINER Lucas Parsy (lucas.parsy@laposte.net)

WORKDIR /usr/src/app


# Install app dependencies
RUN apt-get update && apt-get install sqlite3

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "mkdir", "-p", "db" ]
CMD [ "tsc" ]
CMD [ "node", "src/main.js" ]
