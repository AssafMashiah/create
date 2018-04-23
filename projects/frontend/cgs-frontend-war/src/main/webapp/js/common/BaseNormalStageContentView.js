define(['jquery', 'BaseStageContentView', 'editMode' ], function($, BaseStageContentView, editMode) {

	var BaseNormalStageContentView = BaseStageContentView.extend({

		canBeEditable: function() {
			return !editMode.readOnlyMode;
		}

	}, {type: 'BaseNormalStageContentView'});

	return BaseNormalStageContentView;

});