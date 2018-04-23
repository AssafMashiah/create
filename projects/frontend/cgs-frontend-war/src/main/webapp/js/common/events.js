define(['lodash', 'backbone_super'], function(_, Backbone) {

	function GlobalEvents() {
		this._names = {};
        this._locks = [];
	};

	_.extend(GlobalEvents, Backbone.Events);

	_.extend(GlobalEvents.prototype, {

		register: function(eventName /* [callback], [context] */) {
			this._names[eventName] = true;

			if (arguments.length !== 1) {
				if (typeof arguments[1] === 'function') this.bind.apply(this, arguments);
			}
		},

		exists: function (eventName) {
			return this._names[eventName] ? true : false;
		},

		unregister: function(eventName /* [callback], [context] */) {
			if (arguments.length !== 1) {
				if (typeof arguments[1] === 'function') this.unbind.apply(this, arguments);
			}

			delete this._names[eventName];
		},

		_call: function(methodName, args) {
			var eventName = args[0];

			if (typeof eventName !== 'string') {
				throw new Error('Bad eventName of type ' + typeof eventName);
			}

			if (eventName.charAt(0) === '&' || typeof this._names[eventName] !== 'undefined') {
				this.constructor[methodName].apply(this.constructor, args);
			}
			else {
				if(methodName != 'off'){//for unbind we don't mind if it's not registered.
					throw new Error('Unknown global event: ' + eventName);
				}
			}
		},

		once: function(eventName, callback) {
			var self = this;
			//first register the event before binding it.
			this.register(eventName);
			var wrapperCallback = (function(oCallback) {
				return function() {
					self._call('off', [eventName, arguments.callee]);
					oCallback.apply(this, arguments)
				}
			})(callback);

			arguments[1] = wrapperCallback ;
			this._call('on', arguments);
		},

		bind: function(/* eventName, callback, [context] */) {
			this._call('on', arguments);
		},

		unbind: function(/* eventName, callback, [context] */) {
			this._call('off', arguments);
		},

        /**
         * fire an event with locking check
         */
        fire: function(/* eventName, [*args] */) {
            if (this._locks[arguments[0]] == undefined){
			    this.forcedFire.apply(this,arguments);
            }
		},

        /**
         * fire an event without checking locking first
         */
        forcedFire: function(/* eventName, [*args] */) {
            this._call('trigger', arguments);
        },

        /**
         * lock an event
         * @param eventName
         */
        lock: function (eventName){
            this._locks[eventName] = true;
        },

        /**
         * unlock an event
         */
        unlock : _.debounce(function(eventName,time){setTimeout(_.bind(function (){
            delete this._locks[eventName];
        },this),time)},400,false),

        /**
         * run the event with locking
         * @param time
         * @param eventName
         */
        fire_with_lock : function (time,eventName){
            if (this._locks[eventName] == undefined){
                this._locks[eventName] = true;
                this.forcedFire.apply(this,Array.prototype.slice.call(arguments,1));
            }
            this.unlock(eventName,time);
        },

		removeCallback: function(callback, context) {
			this.constructor["off"](null, callback, context);
		},

		removeEventFromContext: function(eventName, context) {
			this.constructor["off"](eventName, null, context);
		}

	});

	return new GlobalEvents();

});
