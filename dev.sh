#!/bin/sh
# Linux script file that builds and deploys the app (no tests run) for dev purposes
./gradlew clean build assemble install:createInstall --stacktrace
version=`cat cgs-common.gradle | grep 'version = ' | sed "s/'//g" | sed "s/\"//g" | sed 's/version = //g' | sed 's/-SNAPSHOT//g' | sed 's/\r//g'`
build=`cat projects/backend/src/main/resources/config/version.properties | grep 'versionBuild=' | sed 's/versionBuild=//g' | sed 's/\r//g'`

#echo ${versionPrefix}
#echo ${versionSufix}

version=${version}.${build}

#echo $version

cd install/build/cgs-install-$version
echo "############################
Deploying version $version
############################"
sh install.sh upgrade.db
