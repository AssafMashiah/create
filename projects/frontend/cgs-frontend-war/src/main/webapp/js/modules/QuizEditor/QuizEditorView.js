define(['jquery', 'BasePropertiesView', 'dialogs',  'events', 'text!modules/QuizEditor/templates/QuizEditor.html'],
function($, BasePropertiesView, dialogs, events, template) {

	var QuizEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		render: function ($parent) {
			this._super($parent);
			this.setEvents();

			if (this.controller.record.data.scoreType === 'BADGES') {
				this.setBadgesState(true);
			}
		},
		//set view events
		setEvents: function () {
			this.$('#set_diff_relations').on('click', this.showDifferentiationDialog.bind(this));
		},
		//show relations dialog
		showDifferentiationDialog: function () {
			var dialogCfg = {
                title: "quiz.relation_dialog.differentiation_levels.title",

                content: {
                    text: ""//"Set the parameters for the differention levels"
                },

                critirias: this.controller.getCritirias(),

                buttons: {

                    ok:		{ label: 'OK' },
                    cancel:		{ label: 'Cancel' }
                }
            };

          	events.once('onUpdateRelations', this.update.bind(this, 'recommendationCriteria'))
        	dialogs.create('differentiationRelations', dialogCfg, 'onUpdateRelations')
		},
		getOverallScore: function () {
			return function (val, render) {
				return render(this.controller.getOverallScore());
			}.bind(this)
		},
		setOverallScore: function (score) {
			this.$("#overall_score").text(score);
		},
		setRelationState: function (state, includeCheckbox) {
			this.$("#set_diff_relations").attr('disabled', state);

			if (includeCheckbox) {			
				this.$("#field_useForDifferentialRecommendation").attr('checked', !state);
				this.$("#field_useForDifferentialRecommendation").attr('disabled', state);
			}
		},
		//update data
		update: function (key, data) {
			if (!_.isObject(data)) return;

			this.controller.update(key, data);
		},
		setRedoState: function (state) {
			if (state) {
				this.$(".retest-form").removeClass('hide');
			} else {
				this.$(".retest-form").addClass('hide');
			}
		},
		setBadgesState: function (state) {
			if (state) {
				this.$(".badges-container").removeClass('hide');
			} else {
				this.$(".badges-container").addClass('hide');
			}
		},
		dispose: function () {
			this.$('#set_diff_relations').off('click');
		}

	}, {type: 'QuizEditorView'});

	return QuizEditorView;

});
