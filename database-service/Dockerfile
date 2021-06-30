FROM node:13

WORKDIR /usr/src/db

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "index.mjs" ]