define(['events'], function (events) {

	var PluginEventsModel = Class.extend({

		initialize: function (prefix) {
			this.eventPrefix  = prefix;

		},
		/**
		* @method register
		* @description - register global event
		* @param eventName - the id of the event
		* @callback callback - a functin to invoke when event is fire
		* @param context - the scope of the callback 
		**/
		register: function (eventName, callback, /*optional*/ context) {
			events.register((this.eventPrefix + eventName), callback, context);
		},
		/**
		* @method unregister
		* @description - unregister global event
		* @param eventName - the id of the event
		**/
		unregister: function(eventName, /*optional*/ callback, /*optional*/ context){
			events.unbind(this.eventPrefix + eventName, callback, context);
		},

		/**
		* @method fire
		* @description - fire global event
		* @param eventName - the id of the event
		* @oaram args - can pass multiple arguments to the method
		**/
		fire: function(/*eventName, optinal - args*/){
			var eventName = arguments[0];
			if (events.exists(eventName)) {
				events.fire.apply(events, arguments);
			}
			else {
				console.log('Event ' + eventName + ' doesn\'t exist');
			}
		}
	});

	return PluginEventsModel;
});