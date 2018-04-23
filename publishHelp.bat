echo off

cd help
CALL gradle --no-daemon createHelpArchive uploadArchives
:End
gradle --stop
cd ..
