define(['jquery', 'configModel', 'BaseView', 'mustache', 'modules/Dialogs/BaseDialogView', 'modules/Dialogs/types/mathmlDialog/wiris/wiris_editor', 'text!modules/Dialogs/types/mathmlDialog/mathMLDialog.html'],
    function($, configModel, BaseView, Mustache, BaseDialogView, mathml, template) {

        var MathMLDialogView = BaseDialogView.extend({

            tagName : 'div',
            className : 'css-dialog',


            initialize: function(options) {

                this.customTemplate = template;
                // if markup was passed within options - save it to use in rendering.
                options && options.config && options.config.data && options.config.data.markup && (this.markup = options.config.data.markup);

                this._super(options);

            },
            setReturnValueCallback: {
                // on "Save" action getting the MathML from the editor
                "save": function() {
                    return {
                        text: this.getSource()
                    }
                }
            },
            render: function( $parent ) {
                // Settings dialog view
                this._super($parent, template);

                // initializing wiris MathML Editor
                this.mathMLHandler = mathml.jsEditor.JsEditor.newInstance({'language': 'en'});
                this.mathMLHandler.insertInto(document.getElementById('WIRISEditor'));

                // defining global 'com.wiris' for the editor to communicate with its service (must have).
                window.com || (window.com = {});
                window.com.wiris = mathml;

                $( ".wrs_focusElement" ).focus();

                // if markup exists - pass it to editor.
                this.markup && this.setSource(this.markup);
            },
            // gettings MathML from editor
            getSource: function(){
                return this.mathMLHandler.getMathML();
            },
            // passing source MathML to editor;
            setSource: function(src){
                this.mathMLHandler.setMathML(src);
            },
            dispose: function(){
                //disposing global vars.
                delete window.com.wiris;

                this._super();
            }

        }, {type: 'MathMLDialogView'});

        return MathMLDialogView;

    });
