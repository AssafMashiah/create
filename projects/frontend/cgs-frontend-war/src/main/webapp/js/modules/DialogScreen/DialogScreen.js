define(['modules/BaseDialogScreen/BaseDialogScreen', './DialogScreenView', './config'],
function(BaseDialogScreen, DialogScreenView, config) {

	var DialogScreen = BaseDialogScreen.extend({

		initialize: function(configOverrides) {
			var joinedConfig = _.extend(_.clone(config), configOverrides);
			require('repo').reset();
			this._super(joinedConfig);
		},

		initView: function(){
			this.view = new DialogScreenView({controller: this});
		},

		dispose: function() {
			this._super();
			require('repo').reset();
		}

	}, {type: 'DialogScreen'});

	return DialogScreen;

});