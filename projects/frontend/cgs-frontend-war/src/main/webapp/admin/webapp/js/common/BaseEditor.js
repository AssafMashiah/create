define(['lodash', 'BaseController', 'events', 'types'],
	function(_, BaseController, events, types) {

	var BaseEditor = BaseController.extend({

		initialize: function(config, configOverrides) {
			this._super(config, configOverrides);

			this.screen = config.screen || this.screen;
			this.router = config.router || this.router;
		},
		commit: function (record, field, value, model) {

		},

		propagateChanges: function(record, field, /* optional */ validator, verbose) {
			if (!record.data) {
				throw new Error('Bad record with no `data` attribute');
			}

			if (typeof validator === 'boolean' && typeof verbose === 'undefined') {
				verbose = validator;
				validator = null;
			}

			var _change_handler = function (record, field, validator) {
				return function _commit_(model, value) {
					if (typeof validator === 'function') {
						var options = { 
										model:model, 
										field: field, 
										commit: _.bind(this.commit, this, record, field, value, model)
									};

						if (!validator(value, options)) {
							return false;
						}
					}

					this.commit(record, field, value, model);
				}
			}.call(this, record, field, validator);

			return _change_handler.bind(this);
		},

		dispose: function(){
			this._super();
		},
		

		initMenu:function () {
			if (!!this.config.menuItems && !!this.config.menuInitFocusId) {
				this.screen.components.menu.setItems(this.config.menuItems || {}, true, this.config.menuInitFocusId || '');
			}
		}

	}, {type: 'BaseEditor'});

	return BaseEditor;

});