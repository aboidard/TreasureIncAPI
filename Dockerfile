FROM node:16-alpine as builder

# Global npm dependencies
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

WORKDIR /app
COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build-prod

FROM node:16-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production 

COPY --from=builder --chown=node:node /app/dist .

USER node

EXPOSE 8081

CMD [ "node", "./server.js" ]