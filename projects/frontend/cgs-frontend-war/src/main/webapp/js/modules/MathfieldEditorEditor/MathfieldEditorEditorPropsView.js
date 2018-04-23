define(['jquery', 'BasePropertiesView', 'text!modules/MathfieldEditorEditor/templates/MathfieldEditorEditorProps.html'],
    function($,  BasePropertiesView, template) {

        var MathfieldEditorEditorPropsView = BasePropertiesView.extend({

            initialize: function(options) {
                this.template = template;
                this._super(options);
            }

        }, {type: 'MathfieldEditorEditorPropsView'});
        return MathfieldEditorEditorPropsView;

    });
