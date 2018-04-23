#!/bin/sh

if id -u readonlylog  >/dev/null 2>&1; then
     echo "readonlylog user exists"
else
     echo "user does not exist"
     useradd -m -d /opt/t2k/tomcat/logs -s /bin/bash -c "the read only t2k user" -G users readonlylog
     chmod 644 -R /opt/t2k/tomcat/logs
fi

chmod 777 gradle/bin/gradle
chmod 755 deployPlayer.sh
chmod 755 deployDynamicPlayer.sh

#extract installation dir from t2k properties
INSTALLATION_DIR=`cat t2k.properties | grep installDir | sed 's/^\s*installDir\s*=\s*//' | head -1 | tr -d '\n' | tr -d '\r'`

#define diffrent java home for child processes
export JAVA_HOME=$INSTALLATION_DIR/jdk

gradeTask=""

case "$1" in
	create.all)	gradleTask="installBackendClean"
	;;
	skip.db)	gradleTask="installBackendWithoutDB"
	;;
	upgrade.db)	gradleTask="installBackendUpgrade"
	;;
	*) 
		echo "Usage: "
		echo "	./install.sh [installMode]"
		echo "Supported modes: "
		echo "	create.all  - (re)create the DB and CMS from scratch"
		echo "	upgrade.db  - upgrade existing DB"
		echo "	skip.db     - don't do any DB changes"
		echo "Example: "
		echo "	./install.sh upgrade.db"
		exit
	;;

esac

#run gradle as sub process
gradle/bin/gradle $gradleTask -Pos=linux --no-daemon --debug &
#wait for the child gradle process to finish before exiting
wait $!

gradle/bin/gradle --no-daemon -b deploySCPlayer.gradle deploySCPlayer &
#wait for the child gradle process to finish before exiting
wait $!
