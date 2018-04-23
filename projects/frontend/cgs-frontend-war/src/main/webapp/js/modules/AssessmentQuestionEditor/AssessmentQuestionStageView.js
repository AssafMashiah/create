define(['jquery','repo', 'BaseNormalStageContentView', 'text!modules/AssessmentQuestionEditor/templates/AssessmentQuestionStage.html'],
function($, repo, BaseNormalStageContentView, template) {

	var AssessmentQuestionStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		render: function(parent){
			this._super(parent);
			this.addClassToDialog();
		},
		addClassToDialog: function(){
			this.$el.addClass('childcontainerDialog');
		},
		dispose: function() {
			this._super();
			this.remove();
		}
		
	}, {type: 'AssessmentQuestionStageView'});

	return AssessmentQuestionStageView;

});
