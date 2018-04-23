define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/publishErrorDialog/PublishErrorDialog.html'],
    function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

        var PublishErrorDialogView = BaseDialogView.extend({

            tagName:'div',
            className:'css-dialog',

            /**
             * Each enumerator value must be added as key to dictionaries (e.g. en_US.js)
             * The value of that key should be the explanation of the key
             */
            ErrorEnum: {
                "1" : "MISSING_SEQUENCE_REFERENCE"
            },

            initialize:function f653(options) {

                options.config.data instanceof Array && _.each( options.config.data , function(conflict){
                    conflict.conflictType = this.ErrorEnum[ conflict.conflictType ] || "Error";
                }.bind(this) );
                this.customTemplate = template;
                this._super(options);
            },

            render:function f654($parent) {
                this._super($parent, this.customTemplate);
            }

        }, {type: 'PublishErrorDialogView'});

        return PublishErrorDialogView;

    });