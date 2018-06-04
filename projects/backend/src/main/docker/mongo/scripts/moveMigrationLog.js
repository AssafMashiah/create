db.getSiblingDB('admin').auth('admin','rap2el');
db.getSiblingDB('cgs').migrationLog.find().forEach( function(x){db.getSiblingDB('admin').migrationLog.insert(x)} );
db.getSiblingDB('cgs').migrationLog.drop();
