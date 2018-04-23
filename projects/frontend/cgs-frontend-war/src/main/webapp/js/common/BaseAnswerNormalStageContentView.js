define(['jquery', 'BaseNormalStageContentView','translate', 'text!common/BaseAnswerNormalStageContentViewTemplate.html' ],
    function($, BaseNormalStageContentView, i18n, template) {

	var BaseAnswerNormalStageContentView = BaseNormalStageContentView.extend({

        showStagePreview: function($parent, previewConfig) {
            this._super($parent, previewConfig);
            this.$el.find("> div:first").addClass("stage-answer-top");
            this.$el.find("> div").addClass("stage-answer");
            this.$el.prepend($(i18n._(template)));

        }

	}, {type: 'BaseAnswerNormalStageContentView'});

	return BaseAnswerNormalStageContentView;

});