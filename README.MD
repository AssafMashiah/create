# Create


## Maven Dependencies

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

## Development

To start MongoDB Docker container, run the following:

    docker-compose -f projects/backend/src/main/docker/mongo-dev.yml up -d

To stop it:

    docker-compose -f projects/backend/src/main/docker/mongo-dev.yml down