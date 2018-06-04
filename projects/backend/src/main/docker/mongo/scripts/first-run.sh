#!/bin/bash

SCRIPTS_DIR="/scripts"

#mongod --dbpath /data/db --nojournal &
mongod --nojournal &
while ! nc -vz localhost 27017; do sleep 1; done

ls -l $SCRIPTS_DIR

mongo <  $SCRIPTS_DIR/createAdmin.js
mongo <  $SCRIPTS_DIR/createCgsUser.js
mongo <  $SCRIPTS_DIR/createGcrUser.js
mongo <  $SCRIPTS_DIR/createLmsUser.js
mongo <  $SCRIPTS_DIR/createReadUser.js
mongo <  $SCRIPTS_DIR/updateAdminRole.js
mongo <  $SCRIPTS_DIR/moveMigrationLog.js

#/usr/bin/mongod --dbpath /data --shutdown
/usr/bin/mongod --shutdown

rm -f $SCRIPTS_DIR/createAdmin.js
rm -f $SCRIPTS_DIR/createCgsUser.js
rm -f $SCRIPTS_DIR/createGcrUser.js
rm -f $SCRIPTS_DIR/createLmsUser.js
rm -f $SCRIPTS_DIR/createReadUser.js
rm -f $SCRIPTS_DIR/updateAdminRole.js
rm -f $SCRIPTS_DIR/moveMigrationLog.js
rm -f $SCRIPTS_DIR/first-run.sh

ls -l $SCRIPTS_DIR