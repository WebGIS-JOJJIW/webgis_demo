#!/usr/bin/bash
set -e

function up {
    set -x
    sudo docker compose -f infra/docker-compose.yml build
    sudo docker compose -f infra/docker-compose.yml up -d
    set +x
}

function setup {
    # Compile protobuf definition
    # This has to be done before starting Ingester container
    make -C src/device/pb/ x86

    up
    set -x

    # Wait for the services to finish initialization
    echo Wait 90 seconds to wait for services to finish initialization
    sleep 90

    # Setup PostgreSQL
    # infra/postgresql/init/setup.sh # Previous used
    infra/streamer/init/setup.sh


    # Setup GeoServer
    infra/geoserver/init/setup.sh
    set +x
}

function reset {
    down
    set -x
    sudo git clean -Xfd
    sudo docker rmi artifact_serve:latest
    set +x
}

function down {
    set -x
    sudo docker compose -f infra/docker-compose.yml down
    set +x
}

if [ -z "$1" ]; then
    echo "Usage: $0 {up|down|setup|reset}"
    exit 1
fi

case $1 in
    up)
        up
        ;;
    down)
        down
        ;;
    setup)
        setup
        ;;
    reset)
        reset
        ;;
    *)
        echo "Invalid argument. Usage: $0 {up|down|setup|reset}"
        exit 1
        ;;
esac
