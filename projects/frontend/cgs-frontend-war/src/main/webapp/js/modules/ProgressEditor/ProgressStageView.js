define(['jquery', 'tooltip', 'BaseNormalStageContentView', 'lessonModel',
		'text!modules/ProgressEditor/templates/ProgressStage.html',
		'text!modules/ProgressEditor/templates/ProgressAssessmentStage.html'],
function($, tooltip, BaseNormalStageContentView, lessonModel, noramlStagetemplate, assessmentStageTemplate ) {

	var ProgressStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			//set progress stage template according to lesson mode : assessment / normal lesson
			this.template =lessonModel.isLessonModeAssessment()? assessmentStageTemplate : noramlStagetemplate;
			this._super(options);
		},
		render: function($el){
			this._super($el);
			this.initHintAndFeedbackTooltip();
		},
		initHintAndFeedbackTooltip: function(){
			this.$('.validTip').tooltip({
				content : function(){
					return $(this).attr('title');
				}
			});
		}


	}, {type: 'ProgressStageView'});

	return ProgressStageView;

});
