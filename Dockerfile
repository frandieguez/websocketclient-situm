FROM node:12.16.2-alpine3.11
WORKDIR /usr/src/wstest
COPY package*.json ./
RUN apk --update add gcc make g++ zlib-dev autoconf automake libtool nasm
RUN npm install
COPY . .
EXPOSE 8000
CMD [ "npm", "run", "start"]