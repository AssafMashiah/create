define(['jquery',  'mustache','repo', 'BasePropertiesView', 'growingListComponentView', 'text!modules/AnswerFieldTypeTextEditor/templates/AnswerFieldTypeTextProps.html'],
function($, Mustache, repo, BasePropertiesView, growingListComponentView, template) {

	var AnswerFieldTypeTextPropsView = BasePropertiesView.extend({

		initialize: function(options) {

			this.template = template;
			this._super(options);

			if (options.model) {
				this._data = options.model;

				var newData = require('cgsUtil').cloneObject(this.controller.record.data);
				repo.startTransaction({ ignore: true });
				repo.updateProperty(this.controller.record.id, 'data', _.extend(newData, this._data), true, true);
				repo.endTransaction();
			}
		},
		retriveEditMode: function () {
			var selectedEditor = require("router").selectedEditor;

			if (selectedEditor && selectedEditor.record.type === "cloze_text_viewer") {

				return selectedEditor && selectedEditor.stage_view && selectedEditor.stage_view.startEditing();

			}
		},
		showHintfield: function(){
			return repo.get(this.controller.record.parent).data.interaction === "write" &&
					this.controller.record.type  === "cloze_text_viewer"
		},

		render: function() {
			this._super();

			var self = this;

			this.$('#MaxChars').change(function() {
				var val = parseInt($(this).val());

				if (!val || val > self.maxChars()) {
					val = self.maxChars();
					$(this).val(val);
					repo.startTransaction({ appendToPrevious: true });
					repo.updateProperty(self.controller.record.id, 'MaxChars', val);
					repo.endTransaction();
				}
			});
		},

		create_lists: function f17() {
      var predefinedAdditionalCorrectAnswers = [{
        name: 'Empty Answer',
        id: 'AdditionalCorrectAnswerAllowEmpty',
        value: '',
      }];

      var predefinedPartiallyCorrectAnswers = [{
        name: 'Empty Answer',
        id: 'PartiallyCorrectAnswerAllowEmpty',
        value: '',
      }];

      var predefinedExpectedWrong = [{
        name: 'Empty Answer',
        id: 'ExpectedWrongAnswerAllowEmpty',
        value: '',
      }];

			if(!this.controller.record.data.noAdditionalCorrectAnswers) {
				this.ListOfAdditionalCorrectAnswers = new growingListComponentView({
					el : '#additional-placeholder',
					data : this.controller.record.data.AdditionalCorrectAnswers,
					title : '',
					column_name : 'Additional Answer',
          predefinedFields: predefinedAdditionalCorrectAnswers,
					update_model_callback : _.bind(function(event,data) {
						this.controller.model.set('AdditionalCorrectAnswers', data);
						this.retriveEditMode();
					},this)
				});
			}

			if(!this.controller.record.data.noPartiallyCorrectAnswers) {
				this.ListOfPartiallyCorrectAnswers = new growingListComponentView({
					el : '#partially-placeholder',
					data : this.controller.record.data.PartiallyCorrectAnswers,
					title : '',
					column_name : 'Partial Answer',
          predefinedFields: predefinedPartiallyCorrectAnswers,
					update_model_callback : _.bind(function(event,data){
						this.controller.model.set('PartiallyCorrectAnswers', data);
						this.retriveEditMode();
					},this)
				});
			}

			if(!this.controller.record.data.noExpectedWrong) {
				this.ListOfExpectedWrong = new growingListComponentView({
					el : '#expectedWrong-placeholder',
					data : this.controller.record.data.ExpectedWrong,
					title : '',
					column_name : 'Expected Wrong Answer',
          predefinedFields: predefinedExpectedWrong,
					update_model_callback : _.bind(function(event,data){
						this.controller.model.set('ExpectedWrong', data);
						this.retriveEditMode();
					},this)
				});
			}

		},
		init: function() {
			this.create_lists();

			var self = this;
			this.$el.find('#text-hint').change(function() {
				self.controller.model.set('hint', $(this).val());
			});

			if (this.controller.viewRegisterEvents) {
				this.controller.viewRegisterEvents();
			} else {
				this.controller.registerEvents && this.controller.registerEvents();
			}
		},
		onChangeEvents:function f18() {
			this.controller.model.on('change:showAdditionalCorrectAnswers', function f19() {
				this.controller.refresh();
				this.retriveEditMode();
			}, this);

			this.controller.model.on('change:showPartiallyCorrectAnswers', function f20() {
				this.controller.refresh();
				this.retriveEditMode();
			}, this);

			this.controller.model.on('change:showExpectedWrong', function f21() {
				this.controller.refresh();
				this.retriveEditMode();
			}, this);

			this.controller.model.on('change:answer_size', function f22() {
				this.controller.setMaxChars();
				this.controller.refresh();
				this.retriveEditMode();
			}, this);
			this.controller.model.on('change:MaxChars', function f23() {
				this.controller.OnMaxCharsChange();
				this.controller.refresh();
				this.retriveEditMode();
			}, this);
		},

		hideScenariosHeader: function() {
			var data = this.controller.record.data;
			return !data.displayFieldSize && data.noAdditionalCorrectAnswers && data.noPartiallyCorrectAnswers && data.noExpectedWrong
					|| data.isNoncheckable;
		},

		minChars: function() {
			switch (this.controller.record.data.answer_size) {
				case 'Line':
					return 16;
				case 'Custom':
					if (this.controller.record.type == 'cloze_text_viewer')
						return 46;
					return 1;
				case 'Word':
				default:
					return 2;
			}
		},

		maxChars: function() {
			switch (this.controller.record.data.answer_size) {
				case 'Line':
					return 45;
				case 'Custom':
					if (this.controller.record.type == 'cloze_text_viewer')
						return 80;
					return 250;
				case 'Word':
				default:
					return 15;
			}
		},

		hideShowToolbar: function(val) {
			this.$('.showToolbar')[val ? 'hide' : 'show']();
		}


	}, {type: 'AnswerFieldTypeTextPropsView'});

	return AnswerFieldTypeTextPropsView;

});
