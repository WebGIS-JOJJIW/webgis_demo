#!/usr/bin/bash
set -e

function up {
    set -x
    docker compose -f infra/docker-compose.yml build
    docker compose -f infra/docker-compose.yml up -d
    set +x
}

function setup {
    up
}

function down {
    set -x
    docker compose -f infra/docker-compose.yml down
    set +x
}

if [ -z "$1" ]; then
    echo "Usage: $0 {up|down|setup}"
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
    *)
        echo "Invalid argument. Usage: $0 {up|down|setup}"
        exit 1
        ;;
esac
