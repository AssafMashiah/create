echo off

set PATH=gradle/bin;%PATH%
FOR /F "eol=; tokens=1* delims==" %%A IN (t2k-windows.properties) DO (IF "%%A" == "installDir"  set JAVA_HOME=%%B/jdk)
echo JAVA_HOME = %JAVA_HOME%

IF "%1" == "" GOTO usage
GOTO copyProperties

:usage
echo Usage:
echo 	Please define path to source t2k.properties
echo    Example: copyProperties c:/tmp/t2k.properties

GOTO End

:copyProperties
gradle --no-daemon -b copyProperties.gradle -P fromProperties="%1"

:End
gradle --stop
