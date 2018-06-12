db.getSiblingDB('gcr').createUser( { 
									user: "gcrUser", 
									pwd: "4samlsh", 
									roles: [
											{role:"dbOwner", db : "gcr"}
										] 
									} );