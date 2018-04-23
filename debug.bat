rem the first argument is the home directory of your trunk e.g. d:\t2kdev.
rem the second argument is the version build (usually incremented daily)

d:
cd %1\cgs\projects\backend
call gradle
cd %1\cgs\projects\frontend
call gradle
cd %1\cgs\install
call gradle
cd %1\cgs\install\build\cgs-install-7.0.%2.0
call install.bat upgrade.db
timeout 3
call net stop tomcat7t2k
timeout 3
call C:\t2k.dtp\tomcat\bin\startup.bat