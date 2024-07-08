#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
if [ -z "$1" ]; then
    CMD="sh"
else
    CMD="python3 $1"
fi

set -x
docker run -it \
    --network webgis_net \
    -v $SCRIPT_DIR/:/data \
    --workdir /data \
    python:3.12.4-alpine3.20 sh -c "pip3 install -r /data/requirements.txt; ${CMD}"
