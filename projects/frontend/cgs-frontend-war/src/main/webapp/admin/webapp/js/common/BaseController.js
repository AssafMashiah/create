define(['lodash', 'backbone_super', 'events'], function(_, Backbone, events) {

	var BaseController = Backbone.Router.extend({

		initialize: function(config, configOverrides) {
			this.config = _.extend(_.clone(config), configOverrides);

			this.router = this.router || this.config.router || null;
		},

		/*
		* How to use:
		*	 this.bindEvents(
		*	 {
		*		'eventName':{'type':'register\bind\once', 'func': functionName , 'ctx': context, 'unbind':'dispose\endEditing'},
		*		'eventName':{'type':'register\bind\once', 'func': functionName , 'ctx': context, 'unbind':'dispose\endEditing'}
		*	 });
		* */
		events: {},
		bindEvents: function(cfg){
			_.each(cfg, function(eventObj,eventName){
				if(!this.events[eventName] || this.events[eventName].type != eventObj.type){
					this.events[eventName] = eventObj;
					//prevent binding same event twice
					if(events._names[eventName] && eventObj.type === "once") {
						events.unbind(eventName);
					}

					events[eventObj.type](eventName, eventObj.func, eventObj.ctx);
				}
			},this);
		},
		
		unbindEvents: function(unbindMethod){
			_.each(this.events, function(eventObj,eventName){
				if( ( unbindMethod == 'dispose' || unbindMethod == eventObj.unbind ) && ( eventObj.unbind != 'never' ) ){
					events.unbind(eventName, eventObj.func, eventObj.ctx);
					delete this.events[eventName];
				}
			},this);
		},

		dispose: function(){
			this.unbindEvents('dispose');
		},

		endEditing: function(){
			this.unbindEvents('endEditing');
		}


	}, {type: 'BaseController'});

	return BaseController;

});
