ARG DATA_DIR="/data"

FROM node:22.3.0-alpine3.20
RUN mkdir -p /artifact_serve && mkdir -p /data
WORKDIR artifact_serve
COPY package.json .
COPY package-lock.json .
COPY server.js .
RUN npm install
CMD ["node", "server.js"]