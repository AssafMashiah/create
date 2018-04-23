define(['modules/BaseDialogScreen/BaseDialogScreen', './AppletDialogScreenView', './config'],
function(BaseDialogScreen, AppletDialogScreenView, config) {

	var AppletDialogScreen = BaseDialogScreen.extend({
	
	initialize: function(configOverrides) {
			var joinedConfig = _.extend(_.clone(config), configOverrides);
			this._super(joinedConfig);
		},

		initView: function(){
			this.view = new AppletDialogScreenView({controller: this});
		}

	}, {type: 'AppletDialogScreen'});

	return AppletDialogScreen;

});

