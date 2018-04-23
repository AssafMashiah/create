
define(['BaseScreen', './BaseDialogScreenView', './config'],
function(BaseScreen, BaseDialogScreenView, config) {

	var BaseDialogScreen = BaseScreen.extend({

		initialize: function(configOverrides) {

			this._super(config, configOverrides);
			this.initView();
			this.registerEvents();

			console.log('BaseDialogScreen initialized');
		},
		
		initView: function(){
			this.view = new BaseDialogScreenView({controller: this});
		},

		registerEvents: function() {
			
			this.bindEvents({
				'task_back':{'type':'register', 'func': this.goBack,
					'ctx':this, 'unbind':'dispose'},
				'load':{'type':'bind', 'func': this.load,
					'ctx':this, 'unbind':'dispose'}
			});
		
		},

		dispose: function() {
			this._super();
			this.view.removeScreenBg();
		}

	}, {type: 'BaseDialogScreen'});

	return BaseDialogScreen;

});

