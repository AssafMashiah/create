db = db.getSiblingDB('admin');
db.createUser( { user: "admin",
              pwd: "rap2el",
              roles: [ 
						{role:"readWriteAnyDatabase", db : "admin"},
						{role:"userAdminAnyDatabase", db : "admin"}, 
						{role:"dbAdminAnyDatabase", db : "admin"},
						{role:"clusterAdmin", db : "admin"}
					] 
			} );	
		  