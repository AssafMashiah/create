#!/bin/bash

# Initialize first run
if [[ -e /scripts/first-run.sh ]]; then
    /scripts/first-run.sh
fi

# Start MongoDB
#echo "Starting MongoDB..."
#/usr/bin/mongod --dbpath /data --auth $@

exec "$@"