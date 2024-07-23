#!/bin/sh

pip3 install -r /data/requirements.txt
python3 /data/setup.py
python3 /data/sensor_layer.py