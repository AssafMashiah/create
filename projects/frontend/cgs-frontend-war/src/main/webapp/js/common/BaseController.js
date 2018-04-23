define(['lodash', 'backbone_super', 'repo', 'events'], function(_, Backbone, repo, events) {

	var BaseController = Backbone.Router.extend({

		initialize: function(config, configOverrides) {
            this.config = $.extend(true, _.clone(config), configOverrides)

			this.router = this.config.router;
			this.events = {};
			if (this.config.screen)
				this.screen = this.config.screen;
		},

		createItem: function(itemConfig) {
            var result = repo.createItem(itemConfig);
            return result;
        },

		deleteItem: function(id) {
			var parent = repo.remove(id);

			this.router.load(parent);
		},

		createArrayAndSaveToRepo: function(value, field) {
			var arr = [];

			if(value.indexOf(",") >= 0) {
				arr = value.split(',');
			} else {
				arr.push(value);
			}

			repo.updateProperty(this.config.id, field, arr);
		},

		/*
		* How to use:
		*	 this.bindEvents(
		*	 {
		*		'eventName':{'type':'register\bind\once', 'func': functionName , 'ctx': context, 'unbind':'dispose\endEditing'},
		*		'eventName':{'type':'register\bind\once', 'func': functionName , 'ctx': context, 'unbind':'dispose\endEditing'}
		*	 });
		* */
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
            this.model && this.model.off && this.model.off();

            if (this.view) {
            	this.view.dispose();
	            delete this.view;
            }

			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					if ((["record", "_super", "screen"].indexOf(key) < 0) && this[key]) {
						delete this[key];
					}
				}
			}

		},

		endEditing: function(){
			this.unbindEvents('endEditing');
		}


	}, {type: 'BaseController'});

	return BaseController;

});
