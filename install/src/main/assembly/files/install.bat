echo off

set PATH=gradle/bin;%PATH%
FOR /F "eol=; tokens=1* delims==" %%A IN (t2k-windows.properties) DO (IF "%%A" == "installDir"  set JAVA_HOME=%%B/jdk)

echo JAVA_HOME = %JAVA_HOME%

IF "%1" == "skip.db" GOTO SkipDB
IF "%1" == "upgrade.db" GOTO UpgradeDB
IF "%1" == "create.all" GOTO CreateDB

echo Usage:
echo 	./install.sh [installMode]
echo Supported modes:
echo 	create.all  - (re)create the DB and CMS from scratch
echo 	upgrade.db  - upgrade existing DB
echo 	skip.db     - don't do any DB changes
echo Example:
echo 	./install.sh upgrade.db

GOTO End
:UpgradeDB
CALL gradle --no-daemon installBackendUpgrade
GOTO End
:CreateDB
CALL gradle --no-daemon installBackendClean
GOTO End
:SkipDB
CALL gradle --no-daemon installBackendWithoutDB
GOTO End
:End

CALL gradle --no-daemon -b deploySCPlayer.gradle deploySCPlayer

