define(['jquery', 'BasePropertiesView', 'repo', 'growingDoubleListComponentView','components/mathfield/MathField',
'mathfieldGrowingListView', 'text!modules/AnswerFieldTypeMathfieldEditor/templates/AnswerFieldTypeMathfieldProps.html'],
function($,  BasePropertiesView, repo, growingDoubleListComponentView,MathfieldView, mathfieldGrowingListView, template) {

	var AnswerFieldTypeMathfieldPropsView = BasePropertiesView.extend({

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
		setAnswerFieldMathfield: function (markupObj, onChange, defaultMarkup) {
			this.$el.find('.answer-container').removeClass('hide');
			this.$el.find('.correct-answer-header').removeClass('hide');

			var attributes = _.extend(require('cgsUtil').getRepoDefaultData('mathfield'), {
				maxHeight: this.controller.record.data.maxHeight
			});

            _.extend(attributes, require("localeModel").getConfig('mfConfig'));

            attributes.editMode = 'completion';
            

            var mfData = jQuery('<mathField/>').attr(attributes);
			
			if (!onChange) {
				repo.updateProperty(this.controller.record.id, 'answerMarkup', markupObj);
			} 

			mfData.append(markupObj.markup);  


			if (this.answerMathfield) {
				this.growingMathfieldListComponent && this.growingMathfieldListComponent.setDefaultMarkup(defaultMarkup || markupObj.markup);
				this.growingMathfieldListComponent && this.growingMathfieldListComponent.setMathfieldState(mfData);

				this.answerMathfield.mathField.view.cfg.data.empty();
				this.answerMathfield.mathField.setState(mfData);
				this.answerMathfield.mathField.view.setEnabled(true);
				return;
			}
			
			this.answerMathfield = new MathfieldView({
                data: mfData,
                parent: this.$el.find(".answer-container"),
                container: $('body'),
                iframeDoc: this.$el.find(".answer-container").parent(),
                onStartEdit: _.debounce(function () {
                	this.growingMathfieldListComponent && this.growingMathfieldListComponent.endMathfieldEdit();
                }.bind(this), 500, {
                  'leading': true,
                  'trailing': false
                }),
                onEndEdit: $.noop,
                onChange: function () {
					if (onChange && _.isFunction(onChange)) {
						onChange(this.answerMathfield.mathField.view.getMarkUpValue(), this.answerMathfield.mathField.view.getWidthEM());
					} else {
						repo.updateProperty(this.controller.record.id, 'answerMarkup', {
							markup: this.answerMathfield.mathField.view.getMarkUpValue(),
							widthEM: this.answerMathfield.mathField.view.getWidthEM()
						});
					}
                }.bind(this)
            });

          	this.growingMathfieldListComponent && this.growingMathfieldListComponent.setDefaultMarkup(defaultMarkup);

            if (this.answerMathfield.mathField) {
                this.answerMathfield.mathField.view.setEnabled(true);
                //mathfield workaround for dispose the editor mathfields
                this.answerMathfield.mathField.view._input.on('focus', function () {
                    $(document).trigger('mouseup.endMathfieldEdit') 
                });
            }

            if (this.answerMathfield.mathField) {
                this.answerMathfield.mathField.view.setEnabled(true);
            }
		},
		retriveEditMode: function () {
			_.delay(function () {
				var selectedEditor = require('router').selectedEditor;

				if (selectedEditor && selectedEditor.record.type === "cloze_text_viewer") {

					return selectedEditor && selectedEditor.stage_view && !selectedEditor.stage_view.isStartEditing && selectedEditor.stage_view.startEditing();

				}
			}, 50);
		},
		//initialize growing lists according to checking type
		create_lists: function f5() {
			if (this.controller.record.data.noCheckingType) return;

			switch(this.controller.record.data.checkingType){
				case 'condition':
					this.growingListComponent = new growingDoubleListComponentView({
						el : '#conditionsCheckingType-placeHolder',
						data :this.controller.record.data.conditionsData,
						title : 'condition',
						update_model_callback : _.bind(function(data, growingListComponentContext){
							this.controller.model.set('conditionsData', data);

							_.delay(function () {
								if (!growingListComponentContext.selectedMathfield) {
									this.retriveEditMode();
								}
							}.bind(this), 100);
						},this)
					});
				break;
				case 'exactMatch':
				this.growingMathfieldListComponent = new mathfieldGrowingListView({
						el : '#exactMatchCheckingType-placeHolder',
						data : this.controller.record.data.additionalExactMatch,
						title : 'additional correct',
						column_name : 'mathfield',
						propsView: this,
						update_model_callback : _.bind(function(event, data, mathfieldGrowingListViewContext){
							this.controller.model.set('additionalExactMatch' , data);

							_.delay(function () {
								if (!mathfieldGrowingListViewContext.selectedMathfield) {
									this.retriveEditMode();
								}
							}.bind(this), 100);
						},this)
					});

				break;
			}

		},
		hideAnswerFieldMathfield: function () {
			this.$el.find('.answer-container').addClass('hide');
			this.$el.find('.correct-answer-header  ').addClass('hide');

			delete this.answerMathfield;
		},
		init: function() {

			var self = this;
			this.$el.find('#mathfield-hint').change(function() {
				self.controller.model.set('hint', $(this).val());
			});

			if (_.isFunction(this.controller.viewRegisterEvents)) {
				this.controller.viewRegisterEvents();
			}
			this.create_lists();
		},

		dispose: function f6() {
			this.growingListComponent && this.growingListComponent.dispose();
			this.growingMathfieldListComponent && this.growingMathfieldListComponent.dispose();

			this._super();
		},
		onChangeEvents: function f7() {
			this.controller.model.on('change:checkingType', function(event, val){
				this.controller.refresh();
				this.retriveEditMode();
			}, this);
			this.controller.model.on('change:fieldWidth', function(event, val){
				this.controller.setMFWidth(val);
				this.controller.refresh();
				this.retriveEditMode();
			}, this);
		},
		isDDTask: function() {
			//dont show props when the task in not checkiable
			var cloze = repo.getAncestorRecordByType(this.controller.record.id, 'cloze'),
        		checkingEnabled = null;
	        	if(cloze){
	        		var progress = repo.getChildrenByTypeRecursive(cloze.id, 'advancedProgress');
	        		if(progress){
	        			progress = progress[0];
	        			var checkingEnabled = progress.data.checking_enabled;
	        		}
	        		
	        	}

			var clozeAnswer = require('repo').getAncestorRecordByType(this.controller.record.id, 'cloze_answer');
			return (!!clozeAnswer && clozeAnswer.data.interaction == 'dd' || checkingEnabled === false);
		},
		showConditions: function(){
			return this.controller.record.data.checkingType =='condition';
		},
		showExactMatchList : function(){
			return this.controller.record.data.checkingType =='exactMatch';
		}


	}, {type: 'AnswerFieldTypeMathfieldPropsView'});
	return AnswerFieldTypeMathfieldPropsView;

});