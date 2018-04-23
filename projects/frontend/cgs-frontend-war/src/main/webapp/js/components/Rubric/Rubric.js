define(['BaseComponentView', 'components/Rubric/constants', 'events','repo', 'text!components/Rubric/templates/RubricPropsView.html'], 
	function f1772(BaseComponentView, constants, events,repo,template) {
	var Rubric = BaseComponentView.extend({
		initialize: function f1773(options) {
			this.template = template;

			this._super(options);


            this.setDefaults();

		},
		selectorAppendable: true,
		events: {
			"change #rubrics_enabled": 'onCheck',
			"click #edit-rubrics": 'onEdit'
		},
		render: function f1774() {
			this._super(this.template);
		},
		setDefaults: function f1775() {
			if (!this.model.get('rubrics')) {
				var _defaults = _.clone(constants.defaults_rubrics);

				_.each(_defaults.rows, function f1776(item) {
					item.id = repo.genId();

					_.each(item.cells, function f1777(cellItem) {
						cellItem.id = repo.genId();
					});
				})

				this.options.update(this.model, "rubrics", _defaults);
			}
		},
		showTablePreview: function f1778(show) {
			if (show) {
				this.$el.find('.table-preview').removeClass('hidden');
				this.$el.find('#edit-rubrics').removeClass('hidden');
				this.drawTablePreview();
			} else {
				this.$el.find('.table-preview').addClass('hidden');
				this.$el.find('#edit-rubrics').addClass('hidden');
			}
		},

		drawTablePreview: function(){
       		this.render(this.template);
       		this.delegateEvents();
			this.setTotalScore();
		},

		setTotalScore: function f1779() {
			var rubrics = this.model.get('rubrics');
			var progress = repo.getChildrenRecordsByType(this.options.controller.record.id, 'progress')

			if (!progress.length) {
				progress = repo.getChildrenRecordsByType(this.options.controller.record.id, 'advancedProgress');

				if (!progress.length) {
					throw new TypeError('no progress/advancedProgress is exists');
					return false;
				}
			}

			var totalScore = 0;

			if (rubrics) {
				_.each(rubrics.rows, function f1780(item) {
					totalScore += parseInt(item.totalScore);
				});

				repo.updateProperty(progress[0].id, 'score', totalScore);

				require('repo_controllers').get(progress[0].id).reload();

				this.options.onUpdateDataCallback();	
			} 

		},
		onCheck: function f1781(e) {
			this.options.update(this.model, 'rubrics_enabled', $(e.currentTarget).is(':checked'));

			this.showTablePreview($(e.currentTarget).is(':checked'));
		},
		onEdit: function f1782(e) {
			var dialogConfig = {
                title: 'Rubric Editor',
                content: {
                    icon: 'warn'
                },
                buttons: {
                    yes: { label: 'Save' },
                    cancel: { label: 'Cancel' }
                },
                rubric: this.model.get("rubrics")
            };

            require('events').once('onRubricEdited', function f1783(response) {
               	if (_.isObject(response)) {
               		this.options.update(this.model, "rubrics", response);
               		this.drawTablePreview();
               	}
            }, this);


            var dialog = require('dialogs').create('rubric', dialogConfig, 'onRubricEdited');

		}
	})

	return Rubric;
});