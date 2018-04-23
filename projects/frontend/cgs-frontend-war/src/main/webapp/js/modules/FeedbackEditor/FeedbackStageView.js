define(['jquery', 'repo', 'BaseNormalStageContentView',
		'text!modules/FeedbackEditor/templates/FeedbackStage.html',
		'text!modules/FeedbackEditor/templates/FeedbackTable.html',
		'text!modules/FeedbackEditor/templates/mcSpecificTable.html',
		'text!modules/FeedbackEditor/templates/clozeWriteSpecificTable.html',
		'text!modules/FeedbackEditor/templates/clozeDragSpecificTable.html',
		'text!modules/FeedbackEditor/templates/mtqSpecificTable.html',
	    'mustache', 'dialogs', 'events', 'translate', 'types',
	    'modules/TextViewerEditor/TextViewerEditor', 'components/mathfield/MathField'],
function($, repo, BaseNormalStageContentView, template, TableTemplate,
		mcSpecificTable, clozeWriteSpecificTable, clozeDragSpecificTable, mtqSpecificTable, 
        Mustache, dialogs, events,  i18n, types, TextViewerEditor, MathFieldView) {

	var FeedbackStageView = BaseNormalStageContentView.extend({

		feedbacksToDisplay : {},

		initialize: function(options) {
			this.template = template;
			this.TableTemplate = TableTemplate;
			this.previewMF = [];
			this.previewElement = [];
			
			this._super(options);
			// Template for specific feedback by task type
			if (this.controller.feedback_type === "advanced") {
				switch (this.controller.taskType) {
					case 'mc':
						this.SpecificFeedbacksTableTemplate = mcSpecificTable;
						break;
					case 'cloze_write':
						this.SpecificFeedbacksTableTemplate = clozeWriteSpecificTable;
						break;
					case 'cloze_drag':
						this.SpecificFeedbacksTableTemplate = clozeDragSpecificTable;
						break;
					case 'mtq':
						this.SpecificFeedbacksTableTemplate = mtqSpecificTable;
						break;
				}
			}
		},

		render: function($parent) {

			this.clearPreviews();

			this._super($parent);
			this.createFeedBacksTable();

			if(this.controller.feedback_type === "advanced" && this.SpecificFeedbacksTableTemplate) {
				this.createSpecificFeedBacksTable();
			}

			if (this.canBeEditable()) { 

                this.$('#predefined_feedbacks').change(_.bind(function f758(event) {
                    this.controller.predefined_list_previousValue = this.controller.record.predefined_list;
                    this.controller.predefined_list_newValue = event.target.value;
                    this.ChangePredefinedFeedback(event);
                    },this))
			}
			else
				this.$('#predefined_feedbacks').attr('disabled', 'disabled');
		},

        ChangePredefinedFeedback: function f759() {
            var dialogConfig = {

                title: "Predefined Feedback change",

                content: {
                    text: "Choosing another predefined scenario removes all current feedbacks. Are you sure that you want to continue?",
                    icon: 'warn'
                },

                buttons: {
                    ok      :  { label: 'OK' },
                    cancel  :  { label: 'Cancel' }
                }

            };

            events.once('onChangePredefinedFeedback',function f760(response) {
                this.onChangePredefinedFeedbackResponse(response);
            }, this);

            var dialog = dialogs.create('simple', dialogConfig, 'onChangePredefinedFeedback');
        },

        onChangePredefinedFeedbackResponse: function f761(response) {

            if (response=="ok") {
            	repo.startTransaction();
                this.controller.loadPredefinedList(this.controller.predefined_list_newValue);
                repo.endTransaction();
            } else {
                this.$('#predefined_feedbacks').val(this.controller.predefined_list_previousValue);
            }

            // clean temporary variables...
            delete this.controller.predefined_list_newValue;
            delete this.controller.predefined_list_previousValue;
        },

		createOptionPreview: function(option) {

			if(option.additionalId){
				this.previews.indexOf(option.additionalId+"_"+option.id);
				this.previews.push(option.additionalId+"_"+option.id);
				
			}else{

				if (this.previews.indexOf(option.id) != -1) return;
				this.previews.push(option.id);
			}


			switch (option.dataType) {
				// The data type is repo element - load it's preview
				case 'repoChild':
					var defConfig = _.extend(_.clone(repo.get(option.data.child)), {
							'bindEvents': false,
							'previewMode': true,
							stagePreviewMode: "small",
							screen: this.controller.screen
						}),
						previewConfig = {'bindEvents': false, stagePreviewMode: "small"},
						parentContainer = this.$('.preview_' +(option.additionalId? (option.additionalId +"_") :"") + option.id),
						objectTypeRec = types[defConfig.type];

					var child = require('router').loadModule(objectTypeRec.editor, defConfig, false);

					if(!!child) {
						child.showStagePreview(parentContainer, previewConfig);
						this.previewElement.push(child);
					}
					break;
				// The data type is part of text viewer - render it by textviewer function
				case 'textViewerPart':
					var tve = new TextViewerEditor({ is_convertor: true }),
						html = tve.getHtmlFormatted($('<div />').html(option.data.previewText)[0].outerHTML, option.data.mathfieldArray || {});

					this.$('.preview_' + option.id).each(function() {
						var iframe = $('<iframe style="width: 100%; min-height: 42px" >');
						$(this).append(iframe);
						var _document = iframe.contents().get(0);
						var h = 0;
			            _document.open();
			            _document.write(html);

			            iframe.contents().find('body').contents().each(function () {
			            	h += $(this).height();
			            });

			            iframe.css('height', h);
					});
					break;
				// The data type is mathfield - load mathfield preview
				case 'mathfield':
					var attributes = {
						keyboardPreset:'contentEditorMathField',
						editMode: option.data.editMode,
						fontLocale: require("localeModel").getConfig("mfConfig").fontLocale,
						autoComma:'false',
						validate:'false',
						devMode:'false',
						italicVariables: 'true',
						maxHeight: 'secondLevel'
					}
	                _.extend(attributes, require('localeModel').getConfig('mfConfig'));

	                var mfData = jQuery('<mathField/>').attr(attributes);
	                mfData.append(option.data.markup);

	                var self = this;
	                this.$('.preview_' + option.id).each(function() {
		                self.previewMF.push(new MathFieldView({
		                    data: mfData,
		                    parent: $(this),
		                    container: $(this)
		                }));
	                });
					break;
			}

		},

		createSpecificFeedBacksTable: function() {
			this.previews = [];
			this.arr_options = _.where(this.controller.arr_options, {'default': undefined});
			this.defaultFeedbacks = !!_.where(this.controller.arr_options, {'default': true}).length;

			this.$el.append(Mustache.render(i18n._(this.SpecificFeedbacksTableTemplate), this));

			_.each(this.arr_options, function(option) {
				this.createOptionPreview(option);
				_.each(option.children, function(child) {
					this.createOptionPreview(child);
				}, this);
			}, this);
		},

		createFeedBacksTable: function() {
			var feedback, tmp_arr = this.controller.record.data.feedbacksToDisplay;
			this.feedbacksToDisplay = {};

			for (feedback in tmp_arr) {
				this.feedbacksToDisplay[tmp_arr[feedback]] = true;
			}
			this.$el.append(Mustache.render(i18n._(this.TableTemplate), this));
		},

		updatePredefinedList: function(val) {
			if(!!val) {
				if(this.$('#predefined_feedbacks option[value="' + val + '"]').length == 0) {
					this.$('#predefined_feedbacks').append(new Option(val, val));
				}
				this.$('#predefined_feedbacks').val(val);
			}
		},

		clearPreviews: function() {
			_.invoke(this.previewElement, 'dispose');
			_.invoke(this.previewMF, 'dispose');
			this.previewElement = [];
			this.previewMF = [];
		},

		dispose: function() {
			this.clearPreviews();
			this._super();
			this.remove();
		}
		
	}, {type: 'FeedbackStageView'});

	return FeedbackStageView;

});