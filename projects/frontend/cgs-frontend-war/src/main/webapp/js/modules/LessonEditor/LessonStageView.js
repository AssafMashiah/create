define(['jquery', 'BaseStageView', 'rivets', 'text!modules/LessonEditor/templates/LessonStage.html'],
function($, BaseStageView, rivets, template) {

	var LessonStageView = BaseStageView.extend({

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

	}, {type: 'LessonStageView'});

	return LessonStageView;

});
