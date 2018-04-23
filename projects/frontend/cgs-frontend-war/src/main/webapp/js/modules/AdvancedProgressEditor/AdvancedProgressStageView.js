define(['jquery', 'BaseNormalStageContentView', 'lessonModel',
		'text!modules/AdvancedProgressEditor/templates/AdvancedProgressStage.html',
		'text!modules/AdvancedProgressEditor/templates/AdvancedProgressAssessmentStage.html'],
function($, BaseNormalStageContentView, lessonModel, noramlStagetemplate, assessmentStageTemplate) {
		
		/**
         *  advanced progress stage view for normal mode
         *  and assessment mode.
         */
        var AdvancedProgressStageViews = {
            "lessonModeNormal": noramlStagetemplate,
            "lessonModeAssessment": assessmentStageTemplate
        };

	var AdvancedProgressStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			//set progress stage template according to lesson mode : assessment / normal lesson
			var mode = lessonModel.isLessonModeAssessment() ? "lessonModeAssessment" : "lessonModeNormal";
			this.template = AdvancedProgressStageViews[mode];
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

	}, {type: 'AdvancedProgressStageView'});

	return AdvancedProgressStageView;

});
