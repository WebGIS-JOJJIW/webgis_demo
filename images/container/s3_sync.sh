#!/bin/sh

pip3 install awscli
aws configure
aws s3 sync s3://webgis-images/ /data/images
