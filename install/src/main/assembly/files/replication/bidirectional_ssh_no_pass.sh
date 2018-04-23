#!/bin/bash
#This script esablishes a passwordledd SSH connection with the other machine, using private and public keys.

username=eval whoami
userdir=$HOME

echo ${userdir}
echo ${username}

mkdir -p $userdir/.ssh
mv $userdir/.ssh /home/rsync/.sshtmp
ssh-keygen -t rsa -N "" -f $userdir/.ssh/id_rsa
scp $username@$1:$userdir/.ssh/authorized_keys remote_authorized_keys
cat $userdir/.ssh/id_rsa.pub >> remote_authorized_keys
scp remote_authorized_keys $username@$1:$userdir/.ssh/authorized_keys
rm -rfv $userdir/.sshtmp
rm -rfv remote_authorized_keys
echo "Created Keys"

