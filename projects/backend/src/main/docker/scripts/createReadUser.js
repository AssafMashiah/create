var createUser=function(dbname, username, password){
	db = db.getSiblingDB(dbname);
	db.createCollection("tmp");
	db.dropUser(username);
	db.createUser( { 	user: username,
					pwd: password,
					roles: [ 
						{role:"read", db : dbname}
					]
				}
	);
	db.tmp.drop();
};

var username="dtpReader";
var password= "7sanqsh";
createUser("admin", username, password);
createUser("lms", username, password);
createUser("cgs", username, password);
createUser("gcr", username, password);

// To execute this:  mongo admin -u admin -p XXXX  < createReadUser.js