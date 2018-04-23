define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/differentiationRelations/DifferentiationRelations.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var DifferentiationRelations = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',

		setReturnValueCallback: {
			'ok': function () {
				var totalScore = require("lessonModel").getAssessmentTotalScore(require("router").activeEditor.record.id);

				_.each(this.edited_critirias, function (item) {
					item.targetDiffLevelId = item.targetDiffLevelId.id; 

					delete item.isLast;
					delete item.isFirst;
				});

				return this.edited_critirias;
			},
			'cancel': function () {
				return this.critirias;
			}
		},
		initialize: function(options) {
			
			this.customTemplate = template;

			this.critirias = options.config.critirias.recommendationCriteria;
			this.showBadges = options.config.critirias.showBadges;
			this.taskWeight = options.config.critirias.taskWeight;
			

			this.edited_critirias = require('cgsUtil').cloneObject(options.config.critirias.recommendationCriteria)

			var totalScore = require("lessonModel").getAssessmentTotalScore(require("router").activeEditor.record.id);

			if (this.showBadges) {
				this.badges = _.range(1, parseInt(options.config.critirias.maxScore) + 1);
				this.badges = _.map(this.badges, function (item) {
					var prefix = "quiz.relation_dialog.";
					var n = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

					return prefix + n[parseInt(item) - 1];

				});
			}

			_.each(this.edited_critirias, function (item) {
				item.targetDiffLevelId = _.find(require('courseModel').getDifferentiationLevels(), function (level) {
					return level.id === item.targetDiffLevelId;
				});


				this.maximumScore = Math.max(this.maximumScore ? this.maximumScore : 0, item.toScoreNotEqual);

			}, this);


			var first = _.first(this.edited_critirias);

			first.isFirst = true;


			var last = _.last(this.edited_critirias);

			last.isLast = true;
			
			this._super(options);

		},
		update: function (levelId, key, value) {
			var critiria = _.find(this.edited_critirias, function (item) {
				return item.targetDiffLevelId.id.toString() == levelId.toString();
			});

			if (critiria) {
				critiria[key] = value;
			}
		},
		setEvents: function () {
			var self = this;
			var totalScore = require("lessonModel").getAssessmentTotalScore(require("router").activeEditor.record.id);

			this.$("[id^=diff_level_]").each(function () {
				var levelId = $(this).attr('id').replace('diff_level_', '');
				var parentRow = $(this);

				$(this).find('.feedback').on('change', function () {
					self.update(levelId, 'feedback', $(this).val());
				})

				if (self.showBadges) {				
					$(this).find('.badges').on('change', function () {
						self.update(levelId, 'score', parseInt($(this).find(':selected').text()));
					});

					$(this).find(".badges").children('option').each(function () {
						if ($(this).text() == $(this).parent().attr('data-selected')) {
							$(this).attr('selected', true);
						}
					});
				}


				$(this).find('input.score-input-y').on('change', function (e) {
					var parentRow = $(this).parents('tr.row-table');
					var nextLevId = parentRow.next().attr('id').replace('diff_level_', '');

					parentRow.next().find('.score-input-x').text($(this).val());

					self.update(levelId, 'toScoreNotEqual', parseInt($(this).val()));
					self.update(nextLevId, 'fromScore',  parseInt($(this).val()));		

					//if content is not valid, disable the ok button
					if (!self.validate() || !$(this).get(0).validity.valid) {
						self.$("#ok").removeClass('disabled').addClass('disabled');
					} else {
						self.$("#ok").removeClass('disabled');
					}

				});
			});
		},
		validate: function () {
			var self = this;
			var isValid = true;

			this.$('tr.row-table').each(function () {
				var levelId = $(this).attr('id').replace('diff_level_', '');
				var x = $(this).find('.score-input-x');
				var xv = x.text();
				var y = $(this).find('.score-input-y');
				var yv = y.is('SPAN') ? y.text() : y.val();

				if ((!$(this).find('.score-input-y').is('SPAN') && xv == yv) || (parseInt(xv) > parseInt(yv))) {
					isValid = false;
					y.is('INPUT') && y.get(0).setCustomValidity('Invalid Range');
				} else {
					y.is('INPUT') && y.get(0).setCustomValidity('');
				}
			});

			return isValid;
		},
		render: function( $parent ) {
			this._super($parent, this.customTemplate);
			this.setEvents();
		}

	}, {type: 'DifferentiationRelations'});

	return DifferentiationRelations;

});
