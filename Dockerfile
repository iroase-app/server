FROM node:16-alpine as ts-compiler
WORKDIR /usr/app
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig*.json ./
RUN yarn install
COPY . ./
RUN yarn build:js
