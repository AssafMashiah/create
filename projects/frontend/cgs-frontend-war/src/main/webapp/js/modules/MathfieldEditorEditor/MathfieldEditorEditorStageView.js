define(['jquery', 'BaseNormalStageContentView',
    'text!modules/MathfieldEditorEditor/templates/MathfieldEditorEditorStage.html'],
    function($, BaseNormalStageContentView, template) {

        var MathfieldEditorEditorStageView = BaseNormalStageContentView.extend({

            initialize: function(options) {
                this.template = template;
                this._super(options);
            }

        }, {type: 'MathfieldEditorEditorStageView'});

        return MathfieldEditorEditorStageView;

    });
