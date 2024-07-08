#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
if [ -z "$1" ]; then
    CMD="sh"
else
    REL_PREFIX=$(dirname $(realpath --relative-to ${SCRIPT_DIR} $(realpath ${1})))
    CMD="cd /data/${REL_PREFIX}; python3 $@"
fi

set -x
sudo docker run -it \
    --network webgis_net \
    -v $SCRIPT_DIR/:/data \
    --workdir /data \
    python:3.12.4-alpine3.20 sh -c "pip3 install -r /data/requirements.txt; ${CMD}"
