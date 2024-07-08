#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))

${SCRIPT_DIR}/../../py3.sh /data/src/device/recv_pic.py
