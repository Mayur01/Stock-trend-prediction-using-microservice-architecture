FROM node:13

WORKDIR /usr/src/stock

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "node", "index.mjs" ]