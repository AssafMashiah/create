#!/bin/bash
#This script takes care of the initial settings of the two machines.

username=rsync
cms_home=$1

function create_user {
	echo creating user
	useradd -g 0 $username
	echo "$username:1Qaz2wsx" | chpasswd
}
function change_group {
	echo changing user group
	usermod -g 0 $username
}

#stop mongo and tomcat
service mongod stop
service Tomcat7T2K stop

#make sure that the rsync user exists with the right privileges and if not then make it happen
if grep -q "^$username:" /etc/passwd ;
	then
		echo user exists
		group=$(id -g $username)
		echo group id is $group
		if [ $group != "0" ];
			then
				change_group	
		fi
					
	else
		create_user
fi

#put rsync in sudoers list
./update_sudoers.sh

#make the cms dir writable by the root group (which includes rsync user)
if [[ ! -d $cms_home ]]; 
	then
		mkdir --parents $cms_home
		echo cms directory was created
	else
		echo "cms directory already exists (which is OK)"
fi
setfacl -m u:rsync:rwx $cms_home


#copy relevant scripts to the rsync home dir
user_home="$(eval echo ~$username)"
echo user home dir: $user_home
shopt -s extglob
cp !(configure_replication.sh) $user_home
chmod -R g+x $user_home


