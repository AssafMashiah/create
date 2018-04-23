#!/bin/bash
#This is the cron job itself. It is performed at the slave machine. 
#The slave asks the master for changes and updates itself.

homedir=$HOME
running_flag=$homedir/rsync_running.pid

#Make sure that rsync isn't still processing its last job
if [ -e "$running_flag" ]
then
exit
fi

#Mark that we are running
echo "Running" >> $running_flag

#perform the synchronization
unison -nodeletion=$2 -nodeletion=ssh://$1/$2 -batch $2 ssh://$1/$2

#Mark that we aren't running
rm -f "$running_flag"
