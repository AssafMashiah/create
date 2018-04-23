define(['jquery', 'BaseStageView', 'repo', 'text!modules/ReferenceSequenceEditor/templates/ReferenceSequenceStage.html'],
function($, BaseStageView, repo, template) {

	var ReferenceSequenceStageView = BaseStageView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			if (typeof this.template === 'undefined') {
				throw new Error('No `template` field: ' + this.constructor.type);
			}
			this._super(this.template);
		}

	}, {type: 'ReferenceSequenceStageView'});

	return ReferenceSequenceStageView;

});