FROM node:16-alpine as ts-compiler
WORKDIR /usr/app
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig*.json ./
RUN yarn install
COPY . ./
RUN yarn build

FROM node:16-alpine as ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package*.json ./
COPY --from=ts-compiler /usr/app/yarn.lock ./
COPY --from=ts-compiler /usr/app/dist ./
RUN yarn install --prod

FROM node:16-alpine
WORKDIR /usr/app
COPY --from=ts-remover /usr/app ./
CMD ["node", "server.js"]
