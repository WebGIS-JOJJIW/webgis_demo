#!/usr/bin/bash
set -e
SCRIPT_DIR=$(dirname $(realpath ${BASH_SOURCE[0]}))
X86_DIR=$SCRIPT_DIR/x86
X86_ZIP=protoc-27.0-linux-x86_64.zip
AARCH_DIR=$SCRIPT_DIR/aarch
AARCH_ZIP=protoc-27.0-linux-aarch_64.zip

function x86 {
    set -x
    mkdir -p $X86_DIR
    wget https://github.com/protocolbuffers/protobuf/releases/download/v27.0/$X86_ZIP -P $X86_DIR
    unzip $X86_DIR/$X86_ZIP -d $X86_DIR
    ln -sf $X86_DIR/bin/protoc $SCRIPT_DIR/protoc
    set +x
}

function aarch {
    set -x
    mkdir -p $AARCH_DIR
    wget https://github.com/protocolbuffers/protobuf/releases/download/v27.0/$AARCH_ZIP -P $AARCH_DIR
    unzip $AARCH_DIR/$AARCH_ZIP -d $AARCH_DIR
    ln -sf $AARCH_DIR/bin/protoc $SCRIPT_DIR/protoc
    set +x
}

if [ -z "$1" ]; then
    echo "Usage: $0 {x86|aarch}"
    exit 1
fi

case $1 in
    x86)
        x86
        ;;
    aarch)
        aarch
        ;;
    *)
        echo "Invalid argument. Usage: $0 {x86|aarch}"
        exit 1
        ;;
esac
