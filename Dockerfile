FROM node:11

WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .

CMD ["sh", "-c", "yarn build && yarn start"]
