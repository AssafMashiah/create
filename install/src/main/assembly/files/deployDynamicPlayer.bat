echo off

set PATH=gradle/bin;%PATH%
FOR /F "eol=; tokens=1* delims==" %%A IN (t2k.properties) DO (IF "%%A" == "installDir"  set JAVA_HOME=%%B/jdk)

echo JAVA_HOME = %JAVA_HOME%

IF "%1" == "" GOTO usage
GOTO deployPlayer

:usage
echo Usage:
echo 	Please define relative path to player installation tar file
echo    Example: deployPlayer plaeyr/dl-7.0.15.tar.gz

GOTO End

:deployPlayer
gradle --no-daemon -b deployPlayer.gradle deployPlayer -Pplayer="%1" -Ptype=db

:End
gradle --stop
