#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))

set -e
set -x
docker run -it \
    --network webgis_net \
    -v $SCRIPT_DIR/container:/data \
    --workdir /data \
    python:3.12.4-alpine3.20 sh /data/run.sh