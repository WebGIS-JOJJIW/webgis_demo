#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
DIST_DIR=${SCRIPT_DIR}/../../infra/artifact_serve/data
cd $SCRIPT_DIR
export NG_CLI_ANALYTICS="false"
npm install
npx ng build
mv $SCRIPT_DIR/dist/web-gis-ui/browser/* $DIST_DIR
