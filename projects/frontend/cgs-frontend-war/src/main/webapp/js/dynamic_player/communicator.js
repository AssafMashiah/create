/*
 * communicator module - communicate between different app levels (iframes)
 * based on window.postMessage, with simple callback syntax.
 */
dbp.comm = {};

// when transmitting with callback, we store the callback function until it's 
// time to fire it back. this following object is used for this matter.
dbp.comm.storage = {};

/**
 * communicator - responsibile on manage two-direction communication between 2 windows using postMessage.
 *
 * @class 
 * @param {string} owner_id - the identifier of the communicator owner (used for identifying and routing incomming messages)
 * @param {object} target_window - the target window (which will recieve the messages)
 * @param {[Function]} [cb] - optional callback to be called when an event recieved
 */
dbp.comm.communicator = function(target_window, message_handler, owner_id, $iframe) {

	// set member variables
	this.id = dbp.comm.generate_id('comm_');
	this.target = target_window;
	this.message_handler = message_handler || null;
	this.owner_id = owner_id || null;
	this.interact_with_owner_id = null; // will be set if and when target owner introduces itself

	// when the target window is loaded,
	// introduce the owner_id (if provided).
	if (this.owner_id) {
		var _this = this,
			target_window = this.target;

		$($iframe).load(function(){
			_this.introduce_owner();
		});
	}

	// listen to window messages
	this.listen_to_messages();
}

/**
 * tell the target who we are, so we could understand which incoming message is
 * targeted to this specific communicator
 *
 * @private
 */
dbp.comm.communicator.prototype.introduce_owner = function() {
	this.send('introduce_owner');
}

/**
 * each communicator instance listens to post messages event and handles the data.
 *
 * @private
 */
dbp.comm.communicator.prototype.listen_to_messages = function() {
 	if (window.addEventListener) window.addEventListener('message', this.on_message.bind(this), false);
 	else window.attachEvent('onmessage', this.on_message.bind(this));	
}

/**
 * send - sends to the target an event with data, optional callback.
 * @param  {[string]}   ev   - the event name
 * @param  {[object]}   data - the event data
 * @param  {Function} [cb]   - optional callback
 */
dbp.comm.communicator.prototype.send = function(ev, data, cb) {

	// make sure there's an event
	if (!ev) {
		comm.log('comm send: missing event');
		return;
	}

	// make sure there's a target
	if (!this.target) {
		comm.log('comm send: missing target');
		return;
	}

	// initialize data object
	data = data || {};

	// unique signal identifier
	var sig_id = this.id + '_' + dbp.comm.generate_id('sig');

	// prepare the data
	var payload = { 
		sig: sig_id,
		owner: this.owner_id,
		ev: ev, 
		data: data 
	};

	// if this communicator is configured to interact with a specific owner, 
	// include this data in the payload.
	if (this.interact_with_owner_id)
		payload.sent_for_owner_id = this.interact_with_owner_id;

	// stringify
	var payload_str = JSON.stringify(payload);

	// transmit
	this.target.postMessage(payload_str, '*');

	// if there's a callback, store it till when it's needed
	if (cb && typeof cb == 'function')  {
		dbp.comm.storage[sig_id] = cb;
	}
}

/*
 * instance method:
 * indicate the origin communicator to fire the callback for a specific signal id
 */
dbp.comm.communicator.prototype.callback = function(cb_sig, data) {
	// i'm the target communicator and i'm calling back to origin after some stuff was done

	// make sure there's a callback signal id
	if (!cb_sig || !cb_sig.length)
		return;
	
	data = data || {};
	data.callback_sig = cb_sig;
	this.send('callback', data);
}

/**
 * on_message - handle messages from other communicators and route them to a proper destination
 *
 * @private
 * @param  {[MessageEvent]} message - postMessage - MessageEvent
 */
dbp.comm.communicator.prototype.on_message = function(message) {

	// make sure that message contains data
	if (!message.data) {
		dbp.comm.log('comm on_message: missing data');
		return;
	}

	var payload_str = message.data,
		payload;

	// make sure that payload string is json parseable
	try {
		payload = JSON.parse(payload_str);
	}
	catch(err) {
		dbp.comm.log('comm on_message: invalid payload');
		return;
	}

	// parse the payload
	var sig = payload.sig,
		msg_owner_id = payload.owner,
		ev = payload.ev,
		data = payload.data || {};

	// make sure signal id is passed with message data 
	// (for callback purpose)
	data.sig = sig;

	// temp log debugging method
	var _log = function(status, from, to, ev) {
		console.debug('[' + status + '] ' + (from || '<comm>') + ' --> ' + (to || '<comm>') + ': ' + ev);
	}

	// introduce owner event (i'm the target communicator, the origin is introducing it's identity).
	// we should send data back to origin communicator including this identifier for
	// the origin communicator(s) to route the response properly between them.
	if (ev == 'introduce_owner') {

		// set this communicator to interact only with it's owner
		this.interact_with_owner_id = msg_owner_id;

		// invoke the 'introduce_owner' callback
		this.message_handler(payload);
		
		_log('accepted', msg_owner_id, this.owner_id, ev);
	}
	else {

		// IF this communicator is meant to interact ONLY with it's owner,
		// ignore messages that doesn't match this.interact_with_owner_id
		// BUT if this.interact_with_owner_id stays null (nobody introduced to it), 
		// it will handle all messages and won't ignore any of them.
		if (payload.sent_for_owner_id && payload.sent_for_owner_id != this.owner_id) {
			// _log('rejected', msg_owner_id, this.owner_id, ev + ' (' + payload.sent_for_owner_id + ')');
			return;
		}

		_log('accepted', msg_owner_id, this.owner_id, ev);

		// callback event (i'm the origin communicator, the target is calling back).
		// any other events are handled separately by the callback (this.message_handler)
		if (ev == 'callback') {
			var cb_sig = data.callback_sig;
			if (cb_sig && cb_sig in dbp.comm.storage) {

				// get the callback
				var cb = dbp.comm.storage[cb_sig];

				// remove this signal from storage
				delete dbp.comm.storage[cb_sig];

				if (!data.success)
					data.success = false;

				// fire the callback
				cb(data);
			}
		}

		// any other events,
		// call message handler with the data payload
		else {
			if (typeof this.message_handler == 'function') {
				this.message_handler(payload);
			}
		}		
	}
}

/**
 * generate_id - generates a unique id.
 * 
 * @private
 * @param  {[String]} prefix - prefix for the id
 * @return {[String]}        - unique id (based on random number + current timestamp)
 */
dbp.comm.generate_id = function(prefix) {
	prefix = prefix || '';
	var r = parseInt(Math.random() * (999 - 99) + 99),
		t = parseInt((new Date()).getTime());

	return prefix + r + t;
}

/*
 * logging method
 */
dbp.comm.log = function(msg) {
	console.log('* [comm (' + this.owner_id + ')]: ' + msg);
};
