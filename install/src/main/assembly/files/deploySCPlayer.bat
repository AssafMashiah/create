echo off

set PATH=gradle/bin;%PATH%
FOR /F "eol=; tokens=1* delims==" %%A IN (t2k.properties) DO (IF "%%A" == "installDir"  set JAVA_HOME=%%B/jdk)

echo JAVA_HOME = %JAVA_HOME%

:deployPlayer
gradle --no-daemon -b deploySCPlayer.gradle deploySCPlayer

:End
gradle --stop
