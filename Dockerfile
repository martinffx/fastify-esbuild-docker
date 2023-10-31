FROM node:20-alpine as base

# install any shared runtime / buildtime deps

FROM base as builder

WORKDIR /app
COPY . .
RUN npm install && npm run build


FROM base

RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY --from=builder /app/dist /usr/src

ENV NODE_ENV production
EXPOSE 3000

CMD [ "node", "./dist/index.js" ]
