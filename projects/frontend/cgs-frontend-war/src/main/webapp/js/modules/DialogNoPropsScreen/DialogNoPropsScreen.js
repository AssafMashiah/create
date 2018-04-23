define(['modules/BaseDialogScreen/BaseDialogScreen', './DialogNoPropsScreenView', './config'],
function(BaseDialogScreen, DialogNoPropsScreenView, config) {

	var DialogNoPropsScreen = BaseDialogScreen.extend({

		initialize: function(configOverrides) {
			var joinedConfig = _.extend(_.clone(config), configOverrides);
			require('repo').reset();
			this._super(joinedConfig);
		},

		initView: function(){
			this.view = new DialogNoPropsScreenView({controller: this});
		},

		dispose: function() {
			this._super();
			require('repo').reset();
		}

	}, {type: 'DialogNoPropsScreen'});

	return DialogNoPropsScreen;

});