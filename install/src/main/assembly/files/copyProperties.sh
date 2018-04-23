#!/bin/sh

chmod 777 ./gradle/bin/gradle

#extract installation dir from conf properties
INSTALLATION_DIR=`cat t2k.properties | grep installDir | sed 's/^\s*installDir\s*=\s*//' | head -1 | tr -d '\n' | tr -d '\r'`

#define diffrent java home for child processes
export JAVA_HOME=$INSTALLATION_DIR/jdk

if ["$1" == ""]
then
	echo "Usage: "
	echo "	Please define path to source t2k.properties"
	echo "	Example: ./copyProperties /tmp/t2k.properties"
	exit
fi

#run gradle as sub process
gradle/bin/gradle --no-daemon -b copyProperties.gradle -P fromProperties=$1 &

#wait for the child gradle process to finish before exiting
wait $!
