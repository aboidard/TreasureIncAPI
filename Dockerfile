FROM node:16-alpine

# Global npm dependencies
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

WORKDIR /app
COPY --chown=node:node . ./

RUN yarn install --frozen-lockfile --production

USER node


EXPOSE 8081

CMD [ "node", "server.js" ]
