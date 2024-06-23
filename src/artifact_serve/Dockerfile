ARG DATA_DIR="/data"

FROM node:22.3.0-alpine3.20
RUN mkdir -p /artifact_serve && mkdir -p /data
WORKDIR artifact_serve
COPY package.json .
COPY package-lock.json .
RUN npm install
CMD [\
    "npx",\
    "http-server",\
    "-a", "0.0.0.0",\
    "-p", "8080",\
    "-d",\
    "--cors",\
    "--gzip",\
    "--utc",\
    "--log-ip",\
    "--no-dot-files",\
    "/data"\
]