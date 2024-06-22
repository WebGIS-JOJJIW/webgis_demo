#!/usr/bin/bash

SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
SQL_SCRIPT_DIR=$SCRIPT_DIR/scripts

PSQL="psql"
USER="-U admin"
POSTGRES_DATABASE="-d postgres"
GEOSERVER_DATABASE="-d gis_db"
IMAGE_DATABASE="-d image_db"

SQL_CREATE_IMAGE_TABLE="
CREATE TABLE still_images (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(64) NOT NULL,
    image_url VARCHAR(256) NOT NULL,
    captured_ts TIMESTAMP NOT NULL,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"

set -x
# set -e
docker exec -it gis-db $PSQL $USER $POSTGRES_DATABASE -c "CREATE DATABASE image_db"
docker exec -it gis-db $PSQL $USER $IMAGE_DATABASE -c "$SQL_CREATE_IMAGE_TABLE"
