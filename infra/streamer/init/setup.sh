#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
SETUP_IMAGE=streamer_api:0.1

set -e
set -x

docker build -t $SETUP_IMAGE $SCRIPT_DIR/../streamer-api
docker run -it --network webgis_net $SETUP_IMAGE rake db:create
docker run -it --network webgis_net $SETUP_IMAGE rake db:migrate