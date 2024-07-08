#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))

if [ "$#" -eq 0 ]; then
    echo "Error: No arguments provided."
    echo "Usage: $0 <path_to_image>"
    exit 1
fi

${SCRIPT_DIR}/../../py3.sh send_pic.py -i /data/src/device/$@
