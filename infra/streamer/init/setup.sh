#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
SETUP_IMAGE=streamer_api:0.1

set -e
set -x

sudo docker build -t $SETUP_IMAGE $SCRIPT_DIR/../streamer-api
sudo docker run -it --rm --network webgis_net $SETUP_IMAGE rake db:create
sudo docker run -it --rm --network webgis_net $SETUP_IMAGE rake db:migrate
sudo docker run -it --rm --network webgis_net $SETUP_IMAGE rake db:seed