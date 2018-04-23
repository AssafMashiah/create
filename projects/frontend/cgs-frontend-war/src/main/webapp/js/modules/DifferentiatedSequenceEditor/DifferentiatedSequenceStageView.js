define(['jquery', 'BaseStageView', 'rivets', 'mustache', 'translate',
		'text!modules/DifferentiatedSequenceEditor/templates/DifferentiatedSequenceStage.html'],
function($, BaseStageView, rivets, Mustache, i18n, template) {

	var DifferentiatedSequenceStageView = BaseStageView.extend({

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


	}, {type: 'DifferentiatedSequenceStageView'});

	return DifferentiatedSequenceStageView;

});
