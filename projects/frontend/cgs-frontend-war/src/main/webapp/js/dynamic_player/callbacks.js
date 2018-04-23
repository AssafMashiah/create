/*
 * callbacks module - register and fire events
 */

dbp.callbacks = function() {
	
	/*
	 * list of the events,
	 * will be filled from outside in each environment with relevant events.
	 */
	this.events = {};
};


/*
 * callbacks.register():
 * - each event can fire multiple registered callbacks.
 * arguments:
 * - event_name 		(a valid event name that should exist on callbacks.events)
 * - cb 				(a function to invoke when the event has happened)
 */
dbp.callbacks.prototype.register = function(event_name, cb) {
	
	// make sure we have both event_name and the callback function
	if (!event_name || !cb) {
		return;
	}

	// make sure cb is actually a function
	if (typeof cb != 'function') {
		return;
	}

	// make sure event_name is a valid event name
	if (!(event_name in this.events)) {
		this.log('recieved registeration to event ' + event_name + ' which doesnt exists in callbacks list.');
		return;
	}

	// register the callback
	this.events[event_name].push(cb);
};


/*
 * callbacks.fire():
 * - fire a callback by it's event name and invoke all registered functions
 */
dbp.callbacks.prototype.fire = function(event_name, data) {
	
	// make sure we have the event name
	if (!event_name) 
		return;

	// data is optional
	if (!data) 
		data = {};

	// make sure event_name is a valid event name
	if (!(event_name in this.events)) {
		this.log('recieved fire event ' + event_name + ' which doesnt exists in callbacks list.');
		return;
	}

	// call all registered functions
	var arr = this.events[event_name];
	for (var i=0; i<arr.length; i++) {

		var fn = arr[i];
		// invoke only functions
		if (typeof fn == 'function') {
			fn(data);
		}

	}
};


/*
 *
 */
dbp.callbacks.prototype.log = function(msg) {
	console.log('* [callbacks]: ' + msg);
};
