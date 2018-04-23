#!/bin/bash
#This script delets the rsync cron job. This is done when a slave stops being a slave.
crontab -l > mycron1
sed 's/^.*#end-of-replication-job.*$//' mycron1 > mycron2
sed '/^$/d' mycron2 > mycron3
crontab mycron3

rm mycron1
rm mycron2
rm mycron3
