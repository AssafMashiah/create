db.getSiblingDB('cgs').createUser( { 
				user: "cgsUser", 
				pwd: "4samlsh", 
				roles: [
						{role:"dbOwner", db : "cgs"}
					] 
				} );