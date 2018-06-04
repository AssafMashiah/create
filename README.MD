# Create

## Setup Environment

### Maven Dependencies

In order to access the Visual Studio Maven repository, authentication is required. 
The build.gradle file accesses it by using the following credentials:
- t2kMavenUsername
- t2kMavenPassword

These are taken from gradle.properties file. Since we cannot commit credentials into
the git repo, the best approach is to add them to the gradle.properties file inside 
your .gradle home directory (e.g.: `~/.gradle/gradle.properties` on Linux OS)

Example:

    t2kMavenUsername=VSTS
    t2kMavenPassword=your_authorization_token

### MongoDB

The Docker Image for MongoDB can be built by following the instructions 
[projects/backend/src/main/docker/README.md](projects/backend/src/main/docker/README.md)

Afterwards, the database can be easily started by running

    docker-compose -f projects/backend/src/main/docker/mongo/mongo.yml up -d

To stop it run

    docker-compose -f projects/backend/src/main/docker/mongo/mongo.yml down


#### Development

For development there is a customized docker-compose yml fille . To start the MongoDB Docker 
container, run the following:

    docker-compose -f projects/backend/src/main/docker/mongo/mongo-dev.yml up -d

To stop it:

    docker-compose -f projects/backend/src/main/docker/mongo/mongo-dev.yml down