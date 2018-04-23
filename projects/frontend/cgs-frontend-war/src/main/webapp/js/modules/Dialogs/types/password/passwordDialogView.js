define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'FileUpload', 'files', 'busyIndicator',
    'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/password/passwordDialog.html'],
    function f648(_, $, BaseView, Mustache, events, FileUpload, files, busy, BaseDialogView, template) {

        var passwordDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            events: {
                'keyup #pwd-input': 'checkPwd',
            },

            initialize: function f649(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f650($parent) {
                this._super($parent, this.customTemplate);
                this.$('#pwd-input').focus();
            },

            checkPwd: function(e) {
                var disable = this.$('#pwd-input').val() != this.options.config.password
                this.$('#yes').attr('disabled', disable);
                this.$('#yes')[disable ? 'addClass' : 'removeClass']('disabled');
            }

        }, {type: 'passwordDialogView'});

return passwordDialogView;

});