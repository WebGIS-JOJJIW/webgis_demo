#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
ROOT_DIR=$SCRIPT_DIR/../../

set -x
sudo docker run -it --rm -v $ROOT_DIR:/data --entrypoint="/data/src/webapp/build.sh" node:20.15.1-bookworm-slim