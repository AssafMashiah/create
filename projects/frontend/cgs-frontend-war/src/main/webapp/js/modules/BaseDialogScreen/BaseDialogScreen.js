
define(['BaseScreen', './BaseDialogScreenView', './config'],
function(BaseScreen, BaseDialogScreenView, config) {

	var BaseDialogScreen = BaseScreen.extend({

		initialize: function(configOverrides) {

            require('router').getConfigByEditor(function(extendedConfig) {
            	if (configOverrides && configOverrides.components && configOverrides.components.menu) {
            		delete configOverrides.components.menu.config;
            	}

            	if (typeof extendedConfig == 'function') extendedConfig = extendedConfig();
                this._super(configOverrides, {components: {menu: {config: extendedConfig, modName: "MenuComponent"} }});
                this.initView();
                this.registerEvents()
            }.bind(this));
		},
		
		initView: function(){
			this.view = new BaseDialogScreenView({controller: this});
		},

		registerEvents: function() {
			
			this.bindEvents({
				'load':{'type':'bind', 'func': this.load,
					'ctx':this, 'unbind':'dispose'}
			});
		
		},

		dispose: function() {
			var validationResults = require('validate').isEditorContentValid(this.config.id);
			this.view.removeScreenBg();

			this._super();
		}

	}, {type: 'BaseDialogScreen'});

	return BaseDialogScreen;

});

