#!/bin/bash
mkdir -p $2
chmod 755 replication.sh
cp -p replication.sh ~/replication.sh
./del_rep_job_from_cron.sh
./add_rep_job_to_cron.sh $1 $2
