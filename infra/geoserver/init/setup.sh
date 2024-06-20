#!/usr/bin/bash

docker run -it \
    --network webgis_net \
    -v $(realpath ./container):/data \
    --workdir /data \
    python:3.12.4-alpine3.20 sh /data/run.sh