define(['jquery', 'BaseStageContentView', 'repo', 'types', 'mustache', 'text!modules/SeparatorEditor/templates/SeparatorStage.html'],
function($, BaseStageContentView, repo, types, Mustache, template) {

	var SeparatorStageView = BaseStageContentView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		

	}, {type: 'SeparatorStageView'});

	return SeparatorStageView;

});
