#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
DIST_DIR=${SCRIPT_DIR}/../../infra/artifact_serve/data/apps/
cd $SCRIPT_DIR
export NG_CLI_ANALYTICS="false"
npm install
npx ng build --output-path $DIST_DIR
