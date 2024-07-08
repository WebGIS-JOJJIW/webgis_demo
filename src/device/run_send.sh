#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))

if [ "$#" -eq 0 ]; then
    echo "Error: No arguments provided."
    echo "Usage: $0 <path_to_image> [optional_broker_address]"
    exit 1
fi

BROKER_ARG=""
if [ ! -z "$2" ]; then
    BROKER_ARG="-b $2"
fi

${SCRIPT_DIR}/../../py3.sh send_pic.py -i /data/src/device/$1 ${BROKER_ARG}
