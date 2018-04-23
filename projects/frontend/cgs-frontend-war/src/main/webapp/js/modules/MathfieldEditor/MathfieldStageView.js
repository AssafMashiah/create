define(['jquery', 'BaseNormalStageContentView','components/mathfield/MathField', 'repo', 'localeModel',
	'text!modules/MathfieldEditor/templates/MathfieldStage.html', 'editMode'],
function($, BaseNormalStageContentView, MathFieldView, repo, localeModel, template, editMode) {

	var MathfieldStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		setCompletionType: function (attributes) {
			var editor_controller = this.controller;
			var editor_rec = this.controller.record;

			var parent_editor = repo.getAncestorRecordByType(editor_rec.id, 'tableCell');

			if (!parent_editor) {
				parent_editor = repo.getAncestorRecordByType(editor_rec.id, 'ShortAnswer');

				if (!parent_editor) {
					return false;
				} else {
					var progress = repo.getChildrenRecordsByType(parent_editor.id, 'advancedProgress');
					var cloze_answer = repo.getChildrenRecordsByType(parent_editor.id, 'cloze_answer');

					if (progress) {
						progress = progress[0];
						parent_editor = repo.getAncestorRecordByType(editor_rec.id, 'ShortAnswerAnswer');

						if (parent_editor.data.answer_type === 'studentMath') {
							if (progress.data.checking_enabled) {
								attributes.keyboardPreset = 'contentEditorMathField_Completion';
								attributes.onChange = function () {
									var repo_controllers = require('repo_controllers');
									var mode = parent_editor.data.fieldsNum;

									var answerFieldsRecord = _.filter(repo.getChildrenRecordsByTypeRecursieve(parent_editor.id, 'answerFieldTypeMathfield'), function (rec) {
										return rec.id === this.controller.record.id;
									}, this)

									if (answerFieldsRecord && answerFieldsRecord.length) {
										answerFieldsRecord = answerFieldsRecord[0];

										var answerFieldController = repo_controllers.get(answerFieldsRecord.id)
            							var markup = answerFieldController.stage_view && answerFieldController.stage_view.mf && answerFieldController.stage_view.mf.mathField.view.getMarkUpValue();
            							var widthEM = answerFieldController.stage_view && answerFieldController.stage_view.mf && answerFieldController.stage_view.mf.mathField.view.getWidthEM();
										answerFieldController.view && 
											answerFieldController.view.setAnswerFieldMathfield({
												markup: markup,
												widthEM: widthEM
											});
										
										answerFieldController.view && 
											answerFieldController.view.growingMathfieldListComponent && 
												answerFieldController.view.growingMathfieldListComponent.setMathfieldState($("<state></state>").append(markup));
									}
								}.bind(this)
							}
						}
					}

				}
			} else {
				if (editor_rec.data.completionType === 'C' && parent_editor.data.isAnswerField) {
					var cloze = repo.getAncestorRecordByType(editor_rec.id, 'cloze');

					if (cloze) {
						var progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress');
						var cloze_answer = repo.getChildrenRecordsByType(cloze.id, 'cloze_answer');

						if (progress) {
							progress = progress[0];

							if (cloze_answer && cloze_answer.length) {
								cloze_answer = cloze_answer[0];
							}

							if (progress.data.checking_enabled && cloze_answer.data.interaction === 'write') {
								attributes.keyboardPreset = 'contentEditorMathField_Completion';
								attributes.onChange = function () {
									var answerField = repo.getChildrenRecordsByType(parent_editor.id, 'answerFieldTypeMathfield');

									if (answerField && answerField.length) {
										answerField = answerField[0];

										var answerFieldController = require("repo_controllers").get(answerField.id);

										if (answerFieldController && answerFieldController.stage_view) {
											if (answerFieldController.stage_view.mf) {											
												var markup = answerFieldController.stage_view.mf.mathField.view.getMarkUpValue();
												var widthEM =  answerFieldController.stage_view.mf.mathField.view.getWidthEM();

												answerFieldController.view.setAnswerFieldMathfield({
													markup: markup,
													widthEM: widthEM
												}, null, answerFieldController.stage_view.mf.mathField.view.getMarkUpValue());
											}
										}
									}
								}
							}
						}
					}
				}
			}


		},
		render: function(val){
			this._super(val);

			var attributes = require('cgsUtil').getRepoDefaultData('mathfield');

			if (this.controller.config.extraMathfieldProps) {
				attributes = _.extend(attributes, this.controller.config.extraMathfieldProps)
			}

			_.extend(attributes, localeModel.getConfig('mfConfig'));

			if (this.controller.record.data.completionType === 'C') {
				this.setCompletionType(attributes);
			}


            if (this.controller.record.data){
            	if(this.controller.record.data.maxHeight) {
                  attributes.maxHeight = this.controller.record.data.maxHeight;
                }
                if(this.controller.record.data.widthEM){
                	attributes.widthEM = this.controller.record.data.widthEM;
                }
            }
			var mfData = jQuery('<mathField/>').attr(attributes);

			if(this.controller.record.data.markup){
				mfData.append(this.controller.record.data.markup);
			}



			this.mf =new MathFieldView({
					data: mfData,
					parent: $('#mathfieldContainer_'+this.controller.elementId),
					container: $("body"),
					iframeDoc: $('#mathfieldContainer_'+this.controller.elementId).parent(),
					onChange: attributes.onChange || false
			});

		},
		startEditing: function(event){
			//disable double click 

			if (editMode.readOnlyMode) return false;
			
			if(!event || ($(event.target).parents('.keyboard').length === 0)){
				this.mf.mathField.view.setEnabled(true);

				//destroy drag & drop option while editing mathfield
				var parent = this.$el.parents('.ui-sortable');
					parent.sortable( "destroy" );
					parent.addClass('sortableTmp'); // add tmp class to re-init drag&drop function after endEditing

			}
		},
		endEditing: function(){
			if (this.mf && this.mf.mathField && this.mf.mathField.view) {
				this.mf.mathField.view.setEnabled(false);
				repo.updateProperty(this.controller.elementId, 'markup', this.mf.mathField.view.getMarkUpValue());
				repo.updateProperty(this.controller.elementId, 'widthEM', this.mf.mathField.view.getWidthEM());
				//init drag & drop function
				var parent = this.$el.parents('.sortableTmp');
					
				this.sortChildren(parent);
				
				parent.removeClass('sortableTmp');
			}
		},

		dispose: function() {
			this.mf && this.mf.dispose();
			delete this.mf;
			this._super();
		}

	}, {type: 'MathfieldStageView'});

	return MathfieldStageView;

});
