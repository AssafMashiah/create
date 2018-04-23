#!/bin/sh

chmod 777 ./gradle/bin/gradle

#extract installation dir from t2k properties
INSTALLATION_DIR=`cat t2k.properties | grep installDir | sed 's/^\s*installDir\s*=\s*//' | head -1 | tr -d '\n' | tr -d '\r'`

#define diffrent java home for child processes
export JAVA_HOME=$INSTALLATION_DIR/jdk

if [ "$1" == "" ]
then
	echo "Usage: "
	echo "	Please define relative path to player installation tar file"
	echo "	Example: ./deployPlayer.sh player/dl-7.0.15.tar.gz"
	exit
fi

#run gradle as sub process
gradle/bin/gradle --no-daemon -b deployPlayer.gradle deployPlayer -Pplayer=$1 -Ptype=db &

#wait for the child gradle process to finish before exiting
wait $!
