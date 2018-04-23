#!/bin/bash

# edit mongod configuration file
cat /etc/mongod.conf > tmp0
sed 's/^.*replSet.t2kReplSet$//' tmp0 > tmp1
sed 's/^.*Replication.Options.*$/# Replication Options\nreplSet=t2kReplSet/' tmp1 > tmp2
cat tmp2 > /etc/mongod.conf

# disable selinux
cat /etc/selinux/config > tmp1
sed 's/^SELINUX=.*$/SELINUX=disabled/' tmp1 > tmp2
cat tmp2 > /etc/selinux/config

# change property file for mongo client - we don't do that anymore. Administrator will do this manually. 
#cat /opt/t2k/tomcat/webapps/cgs/WEB-INF/classes/config/mongo.properties > tmp3
#sed 's/^mongoUseReplicaSet.*$/mongoUseReplicaSet=true/' tmp3 > tmp4
#cat tmp4 > /opt/t2k/tomcat/webapps/cgs/WEB-INF/classes/config/mongo.properties

# prompt restart
echo please reboot

# cleanup
rm tmp0
rm tmp1
rm tmp2
#rm tmp3
#rm tmp4
