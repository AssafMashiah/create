define(['BaseContentEditor', 'repo', './config', './MathfieldEditorEditorStageView','./MathfieldEditorEditorPropsView'],
    function(BaseContentEditor, repo, config, MathfieldEditorEditorStageView,MathfieldEditorEditorPropsView) {

        var MathfieldEditorEditor = BaseContentEditor.extend({

            initialize: function(configOverrides) {

                this.setStageViews({
                    small: MathfieldEditorEditorStageView,
                    normal: MathfieldEditorEditorStageView
                });

                this._super(config, configOverrides);
                if (!this.config.previewMode) {
                    this.startStageEditing();
                }
                
                this.constants = config.constants;
            },
            
            registerEvents: function f894() {
                this.record = repo.get(this.config.id);

                var changes = {
                    completionType : this.propagateChanges(this.record, 'completionType',  this.changeCompletionType.bind(this), true),
                    answer_size : this.propagateChanges(this.record, 'answer_size', true),
                };

                this.model = this.screen.components.props.startEditing(this.record, changes, $(".mathfield_editor_editor"));
                this.model.on('change:answer_size', this.answerSizeChange , this);
            },
            
            answerSizeChange : function f895(){
                repo.startTransaction({ appendToPrevious: true });
                repo.updateProperty(this.config.id,'MaxChars',config.constants.editor[this.record.data.answer_size].MaxChars);
                repo.endTransaction();

                //render the changed size of the text editor
                
                this.stage_view.endEditing();
                this.stage_view.render();
                this.startPropsEditing();

            },

            changeCompletionType: function f896(val) {
                repo.updateProperty(this.config.id, 'completionType', val);
            },

            startPropsEditing: function(){
                this._super();
                this.view = new MathfieldEditorEditorPropsView({controller:this});
                this.registerEvents();
            }
        }, 
        {
            type            : 'MathfieldEditorEditor',
            
            defaultRepoData : function() {
                return { 
            
                    keyboardPreset      : 'fullMathField',
                    editMode            : 'on',
                    fontLocale          : require("localeModel").getConfig("mfConfig").fontLocale,
                    autoComma           : 'true',
                    validate            : 'false',
                    devMode             : 'false',
                    maxHeight           : 'secondLevel',
                    completionType      : 'A',
                    italicVariables     : 'true',
                    disableDelete       : true,
                    displayFieldSize    : false,
                    disabledMaxChars    : true,
                    MaxChars            : 15,
                    answer_size         : "Word",
                    allowedSizes        :   [  
                                                { "value" : "Letter", "text" : "Single" },
                                                { "value" : "Word", "text" : "Short" },
                                                { "value" : "Line", "text" : "Long" }
                                            ]
            
                }
            }
        });

        return MathfieldEditorEditor;

    });
