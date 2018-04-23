define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/changesTree/changesTreeDialog.html'],
    function f588(_, $, BaseView, Mustache, events, BaseDialogView, template) {

        var changesTreeDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            initialize: function f589(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f590($parent) {
                this._super($parent, this.customTemplate);
                $(".changesTree #yes").addClass("btn-primary");
            }



        }, {type: 'changesTreeDialogView'});

        return changesTreeDialogView;

    });