define(['modules/BaseDialogScreen/BaseDialogScreen', './DialogScreenView', './config'],
function(BaseDialogScreen, DialogScreenView, config) {

	var DialogScreen = BaseDialogScreen.extend({

		initialize: function(configOverrides) {
			var joinedConfig = _.extend(_.clone(config), configOverrides);
			this._super(joinedConfig);
			console.log('DialogScreen initialized');
		},

		initView: function(){
			this.view = new DialogScreenView({controller: this});
		}

	}, {type: 'DialogScreen'});

	return DialogScreen;

});