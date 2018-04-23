#!/bin/bash

#extract installation dir from t2k properties
INSTALLATION_DIR=`cat ../../../t2k.properties | grep 'installDir=' | sed 's/^\s*installDir\s*=\s*//'`

#define diffrent java home for child processes
export JAVA_HOME=$INSTALLATION_DIR/jdk

#!/bin/bash
$JAVA_HOME/bin/java -cp "../../../:../conf/:../lib/*" com.t2k.cgs.utils.standards.StandardsLoader -Dspring.profiles.active="production"
