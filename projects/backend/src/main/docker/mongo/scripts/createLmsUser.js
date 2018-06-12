db.getSiblingDB('lms').createUser( { 
									user: "lmsUser", 
									pwd: "4samlsh", 
									roles: [
											{role:"dbOwner", db : "lms"}
										] 
									} );