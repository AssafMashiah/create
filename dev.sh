#!/bin/sh
# Linux script file that builds and deploys the app (no tests run) for dev purposes
./gradlew -x test --stacktrace
versionPrefix=`cat cgs-common.gradle | grep 'version = ' | sed "s/'//g" | sed 's/version = //g' | sed 's/-SNAPSHOT//g' | sed 's/\r//g'`
versionSufix=`cat projects/backend/cgs-web/src/main/resources/config/version.properties | grep 'versionBuild=' | sed 's/versionBuild=//g' | sed 's/\r//g'`

#echo ${versionPrefix}
#echo ${versionSufix}

version=${versionPrefix}.${versionSufix}

#echo $version

cd install/build/cgs-install-$version
echo "############################
Deploying version $version
############################"
sh install.sh upgrade.db
