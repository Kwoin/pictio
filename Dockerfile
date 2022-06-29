FROM node:18

RUN mkdir /opt/pictio
WORKDIR /opt/pictio
RUN mkdir server
COPY server/package*.json server/
RUN cd server && npm ci
RUN mkdir front
COPY front/package*.json front/
RUN cd front && npm ci && npm run build

EXPOSE 5200

ENV NODE_ENV production
ENV PGDATABASE pictio
ENV PGHOST pictiodb
ENV NODE_TLS_REJECT_UNAUTHORIZED 0

WORKDIR /opt/pictio/server
USER node
CMD ["node","index.js"]


