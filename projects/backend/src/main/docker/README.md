# Create MongoDB Dockerfile

A Dockerfile that produces a Docker Image for Create MongoDB.

The image runs the scripts that create the detault users needed by Create

# Usage

## Build the image

Build it using docker-compose so that we can tag it

    docker-compose build

## Run the image

Once the image is created, it can be run using using docker-compose

    docker-compose -f mongo.yml up

To stop it run

    docker-compose -f mongo.yml down