#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
ROOT_DIR=$SCRIPT_DIR/..

set -e
set -x
#$SCRIPT_DIR/py3.sh /data/images/container/s3_sync.sh

sudo docker run -it --rm \
    --network webgis_net \
    -v $ROOT_DIR/:/data \
    --workdir /data \
    python:3.12.4-alpine3.20 sh -c "/data/images/container/s3_sync.sh"
