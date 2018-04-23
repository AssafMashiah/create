#!/bin/bash
 #Clean the cron from any rsync jop and add to id this rsync job. The cleaning is done in case of an update in the rsync script.
        crontab -l > mycron
         echo "*/1 * * * * ~/./replication.sh $1 $2 #end-of-replication-job" >> mycron
	crontab mycron
        rm mycron
