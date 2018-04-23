var dbp = dbp || {};

dbp.sdk = {

	init: function() {

		// make sure jQuery's included
		if(typeof jQuery === 'undefined') {
			dbp.sdk.log('book_player requires jQuery');
			return;
		}		
	},

	log: function(msg) {
		console.log('* [sdk]: ' + msg);
	}

};

(function(){
	dbp.sdk.init();
})();