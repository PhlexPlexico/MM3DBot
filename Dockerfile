FROM node:lts-alpine3.18

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app

RUN ls -la /app

CMD node launchCommands.js && \
    node index.js

