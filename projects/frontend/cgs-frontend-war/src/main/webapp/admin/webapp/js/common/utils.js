define([], function() {
		
	var util ={

		/*UUID v4 generator in JavaScript (RFC4122 compliant)

		RFC text:   http://tools.ietf.org/html/rfc4122
		Taken from: http://blog.snowfinch.net/post/3254029029/uuid-v4-js
		License:	Public domain
		*/
		genId: function() {
			var uuid = "", i, random;

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;

				if (i == 8 || i == 12 || i == 16 || i == 20) {
					uuid += "-"
				}
				uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
			}
			return uuid;
		}
	}
	return util;

});
