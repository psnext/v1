FROM node:16-alpine
RUN apk add dumb-init
USER node
COPY --chown=node:node dist/apps/pspserver /usr/apps/pspserver
COPY --chown=node:node node_modules /usr/apps/pspserver/node_modules
WORKDIR /usr/apps/pspserver

ENV NODE_ENV production
ENV PORT=8080
CMD ["dumb-init", "node", "main.js" ]
