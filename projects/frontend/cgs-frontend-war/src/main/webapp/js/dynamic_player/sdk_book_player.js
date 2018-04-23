/**
 * Dynamic Book Player Wrapper (SDK)
 * @class  book_player
 * @param  {object}   sdk_configuration    sdk configuration object
 * @param  {object}   player_configuration player configuration object
 * @param  {object}   book                 book data object
 * @param  {object}   state                state object
 * @param  {Function} cb                   optional callback
 */
dbp.book_player = function(sdk_configuration, player_configuration, book, state, cb) {
	
	// player unique id generator
	var _generate_id = function() {
		var r = parseInt(Math.random() * (999 - 99) + 99),
			t = parseInt((new Date()).getTime());
		return 'sdkbp_' + r + t;
	};

	// set unique id
	this.id = _generate_id();

	// store configuration
	this.config = {
		sdk: sdk_configuration,
		player: player_configuration
	};

	// set init method that will be invoked after player iframe is ready
	this.init_cb = cb || function(){};

	// set member variables
	this.initialized = false;
	this.book = book || {};
	this.state = state || {};
	this.comm_player = null;
	this.$iframe = null;
	this.callbacks = null;
	this.init();
};

/*
 *
 */
dbp.book_player.prototype.init = function() {

	// start only once
	if (this.initialized) {
		dbp.sdk.log('book_player ' + this.id + ' already started');
		return;
	}

	// helper method to get size of an associative array.
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	// input validations
	if (!Object.size(this.config.sdk)) {
		dbp.sdk.log('book_player: missing sdk_configuration');
		return;
	}

	if (!this.config.sdk.target_id) {
		dbp.sdk.log('book_player: missing target_id');
		return;
	}

	if (!Object.size(this.config.player)) {
		dbp.sdk.log('book_player: missing player_configuration');
		return;
	}

	if (!Object.size(this.book)) {
		dbp.sdk.log('book_player: missing book');
		return;
	}

	// set as started
	this.initialized = true;

	// create iframe
	this.create_iframe();

	// set callbacks
	this.set_callbacks();

	// setup communication object
	this.setup_communicator();

	// bind to player_ready event sent by the player iframe
	this.callbacks.register('player_ready', this.on_player_ready.bind(this));
};

/**
 * create_iframe is being called during the init stage.
 * responsibile for creating the player iframe.
 *
 * @private
 * @method  create_iframe 
 */
dbp.book_player.prototype.create_iframe = function() {

	// make sure frame wasn't already loaded
	if (this.$iframe) {
		dbp.sdk.log('create_iframe: alread exists');
		return;
	}

	// make sure our target exists
	var $target = $("#" + this.config.sdk.target_id);
	if(!$target.length) {
		dbp.sdk.log('create_iframe: player target (' + this.config.sdk.target_id + ') not found. halting.');
		return;
	}

	// make sure player_url is valid
	if (!this.config.sdk.player_url) {
		dbp.sdk.log('create_iframe: player url missing or invalid. halting.');
		return;	
	}

	// create dom element
	var $iframe = $('<iframe />', {
	    id: this.id,
	    src:  this.config.sdk.player_url,
	    width: '100%',
	    frameborder: 0,
	    allowfullscreen: true
	});
	
	// store element
	this.$iframe = $iframe;

	// make the iframe stick to the bottom of the container
	$iframe.load(function(){
		$iframe.height(function(){
			return $target.height();
		});
	});

	// on window resize, resize the iframe as well
	$(window).resize(function(){
		$iframe.height(function(){
			return $target.height();
		});
	});

	// render iframe
	$target.html('').append($iframe);
};


/**
 * set_callbacks is called during the init, responsibile to expose the events the host can listen to.
 * 
 * @method set_callbacks
 * @private
 */
dbp.book_player.prototype.set_callbacks = function() {

	// set only once
	if (this.callbacks) {
		dbp.sdk.log('set_callbacks: already set');
		return;
	}

	// create callbacks manager
	this.callbacks = new dbp.callbacks();

	// set events
	this.callbacks.events = {
		
		/**
		 * fires after dbp fully initialized
		 * 
		 * @event on_init
		 */
		
		on_init: [],

		/**
		 * fires when the player is moving to a new page, will pass data with current page, new page, 
		 * time spent on page. currently passing the new page idx.
		 *
		 * @event page_changed
		 */
		page_changed: [],

		/**
		 * fires when the player successfuly render page passing data including:
		 * page style, width, size
		 *
		 * @event page_rendered
		 */		
		page_rendered: [],

		/**
		 * player_on_keypressed - an event fired when a keypressed in side the player iframe, data will hold the keydown event.
		 * @event player_on_keypressed
		 */
		player_on_keypressed: [],

		/**
		 * fires when a new overlay_element added, usually after the host is invoking the add_new_overlay_element.
		 * @event overlay_element_added
		 */
		overlay_element_added: [],

		/**
		 * fires when player is in EDIT mode and the user is selecting a overlay_element.
		 * @event overlay_element_selected
		 */
		overlay_element_selected: [],

		/**
		 * fires when an overlay element is being deselected.
		 * @event overlay_element_deselected
		 */
		overlay_element_deselected: [],

		/**
		 * fires when a overlay_element data is being updated. will pass all overlay_element data.
		 *
		 * @event overlay_element_updated
		 */
		overlay_element_updated: [],

		/**
		 * fires when overlay_element is being removed, will pass the overlay_element instance with all assosicated data.
		 *
		 * @event overlay_element_removed
		 */
		overlay_element_removed: [],

		/**
		 * fires when player in viewer mode, and the user interacts with an overlay element, the overlay_element will be passed.
		 * @event overlay_element_activated
		 */
		overlay_element_activated: [],

		/**
		 * fires when a page is being added to bookmarks, will pass the page as parameter
		 *
		 * @event bookmark_added
		 */
		bookmark_added: [],

		/**
		 * fires when a page is being removed from bookmarks, will pass the page as parameter.
		 *
		 * @event bookmark_removed
		 */
		bookmark_removed: [],

		/**
		 * fires every time the highlights state changed.
		 *
		 * @event highlight_added
		 */
		highlights_state: [],


		/**
		 * fires once a user search for a term, will pass the search term as parameter.
		 *
		 * @event new_search
		 */
		new_search: [], 

		/**
		 * fires when one of the state components is being changed - the whole state being passed as param.
		 *
		 * @event state_changed
		 */
		state_changed: [],


		/**
		 * when player configuration use_external_player is true - this event will let the host know that a video needs to be played.
		 * the media data will be passed
		 * @event external_play_video
		 */
		external_play_video: [],

		/**
		 * when player configuration use_external_player is true - this event will let the host know that a audio needs to be played.
		 * the media will be passed
		 * @event external_play_audio
		 */
		external_play_audio: [],

		/**
		 * embed_dl_sequence is an event that fires when the host needs to take care of embedding an dl_sequence overlay element,
		 * the overlay element data and a target id of the container will be passed
		 * @event embed_dl_sequence
		 */
		embed_dl_sequence: [],		

		/**
		 * dl_sequence patch:
		 * when player tells sdk to dispose an element (when page switched / popup closed)
		 * @event dispose_dl_sequence_element
		 */
		dispose_dl_sequence_element: [],

		/**
		 * fires once our player iframe is ready. for internal usage.
		 *
		 * @event player_ready
		 */
		player_ready: []		
	};
};




/*
 *
 */
dbp.book_player.prototype.on_message = function(payload) {
	
	// we recieve a parsed payload from the communicator.

	// parse the payload
	var sig = payload.sig,
		ev = payload.ev,
		data = payload.data || {};

	// make sure signal id is passed with message data 
	// (for callback purpose)
	data.sig = sig;
	
	// any other event, fire internal callback
	this.callbacks.fire(ev, data);

};


/**
 * setup_communicator - init the communicator class to handle postmessage.
 * 
 * @method setup_communicator
 * @private
 */
dbp.book_player.prototype.setup_communicator = function() {
	
	// set only once
	if (this.comm_player) {
		dbp.sdk.log('setup_communicator: already setup');
		return;
	}	

	// create and store the communicator object
	// pass the current player id, for identification of messages specifically for this current player.
	// also, pass a callback that will recieve events from the communicator.
	var target_window = this.$iframe[0].contentWindow,
		message_handler = this.on_message.bind(this);

	this.comm_player = new dbp.comm.communicator(target_window, message_handler, this.id, this.$iframe);
}


/**
 * being called once our player iframe is ready to recieve init payload
 *
 * @method  on_player_ready
 * @param  {array} data - data passed from on_player_ready event
 * @private
 */
dbp.book_player.prototype.on_player_ready = function(data) {

	// prepare the data
	var data = {
		player_configuration: this.config.player,
		book: this.book,
		state: this.state
	};

	// tell player to setup
	var _this = this;
	this.comm_player.send('setup', data, function(res){
		if(_this.init_cb && typeof _this.init_cb == 'function') {
			// time for book player init callback
			_this.init_cb(res);
			_this.init_cb = null;
		}
	});
};


/*
 * Exposed api methods
 */


/**
 * configure lets the host send a new player_configuration
 * to override existing configuration, for use in run time. (after init)
 * 
 * @method configure
 * @param {Object} configuration 
 * @param {Function} [cb] - optional callback
 */
dbp.book_player.prototype.configure = function(configuration, cb) {
	this.comm_player.send('configure', { player_configuration: configuration }, cb);
}


/**
 * switch_to_page a method to change to a specific page.
 * 
 * @method  switch_to_page
 * @param {String} page_id - the page identifier
 * @param {Function} [cb] - optional callback
 */
dbp.book_player.prototype.switch_to_page = function(page_id, cb) {
	this.comm_player.send('switch_to_page', { page_id: page_id }, cb);
};


/**
 * add_new_page allows the host to add a new page to the current book table of contents.
 * 
 * @method  add_new_page
 * @param {object} page - a page object
 * @param {number} index - insert the page in specific index (optional)
 * @param {Function} [cb] - optional callback
 *
 * usage example:
 * player.add_new_page(pageData, 4, callback);
 * OR:
 * player.add_new_page(pageData, callback);
 * OR:
 * player.add_new_page(pageData);
 */
dbp.book_player.prototype.add_new_page = function(page_data, index, cb) {

	// index is optional
	if (!index)
		index = null;

	// in case callback passed instead of index
	else if (typeof index == 'function') {
		cb = index;
		index = null;
	}

	// prepare data
	var data = { page_data: page_data };
	if (index != null)
		data.index = index;

	// instruct player to add a new page
	this.comm_player.send('add_new_page', data, cb);
};

/**
 * add_new_overlay_element let the host add a new overlay_element 
 * 
 * @method add_new_overlay_element
 * @param {String} page_id - page identifier to inject the element into. 
 * @param {object} overlay_element - a json represent of a overlay_element to add.
 * @param {Function} [cb] - optional callback
 */
dbp.book_player.prototype.add_new_overlay_element = function(page_id, element_data, cb) {

	// prepare data
	var data = { page_id: page_id, element_data: element_data };

	// instruct player to add the new element
	this.comm_player.send('add_new_overlay_element', data, cb);
};



/**
 * update_overlay_element - let the host update an overlay element data.
 *
 * @method update_overlay_element
 * @param  {string} page_id - the page_id that owns the element.
 * @param  {string} element_id  - the element id
 * @param  {object} element_data - the element data changes.
 * @param  {Function} [cb]      - optional cb
 */
dbp.book_player.prototype.update_overlay_element = function(page_id, element_id, element_data, cb) {

	// prepare data
	var data = { page_id: page_id, element_id: element_id, element_data: element_data };

	// insturct player to update the element
	this.comm_player.send('update_overlay_element', data, cb);
};

/**
 * remove_overlay_element - let the host remove an overlay element.
 *
 * @method remove_overlay_element
 * @param  {string}   page_id - the page_id that owns the element.
 * @param  {string} element_id  - the element id
 * @param  {Function} [cb]      - optional cb
 */
dbp.book_player.prototype.remove_overlay_element = function(page_id, element_id, cb) {

	var data = {page_id: page_id, element_id: element_id};

	this.comm_player.send('remove_overlay_element', data, cb);
}

/**
 * deselect_all_overlay_elements - deselect all selected overlay elements when in edit mode.
 *
 * @method deselect_all_overlay_elements
 */
dbp.book_player.prototype.deselect_all_overlay_elements = function() {
	this.comm_player.send('deselect_all_overlay_elements');
}

/**
 * dl_sequence_embedded - a method that the host should use to notify the player when he finished embedding a dl sequence (called after the embed_dl_sequence fired)
 * @param  {[object]}   overlay_element - the overlay element that the host just embedded
 * @param  {Function} [cb]              - optional callback
 */
dbp.book_player.prototype.dl_sequence_embedded = function(overlay_element, cb) {
	this.comm_player.send('dl_sequence_embedded', {overlay_element: overlay_element}, cb);	
}

/**
 * terminate - terminate the book_player instance and iframe.
 *
 * @method  terminate
 * @param  {Function} [cb] - optional callback
 */
dbp.book_player.prototype.terminate = function(cb) {
	this.$iframe.remove();
	if (cb && typeof cb == "function")
		cb({success: true});
}

/**
 * DL_SEQUENCE PATCH:
 * tell player to dispose an element after host is done with it
 */
dbp.book_player.prototype.dispose_dl_sequence_element = function(page_id, overlay_element_id, cb) {
	this.comm_player.send('dispose_dl_sequence_element', { page_id: page_id, overlay_element_id: overlay_element_id }, cb);	
}


/**
 * [get_displayed_page_style description]
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
dbp.book_player.prototype.get_displayed_page_style = function(cb) {
	this.comm_player.send('get_displayed_page_style', {}, cb);
}

/**
 * [zoom_in description]
 * @return {[type]} [description]
 */
dbp.book_player.prototype.zoom_in = function() {
	this.comm_player.send('zoom_in', { }, cb);	
}

/**
 * [zoom_out description]
 * @return {[type]} [description]
 */
dbp.book_player.prototype.zoom_out = function() {
	this.comm_player.send('zoom_in', { }, cb);	
}

/**
 * [fit_to_page description]
 * @return {[type]} [description]
 */
dbp.book_player.prototype.fit_to_page = function() {
	this.comm_player.send('fit_to_page', { }, cb);	
}
