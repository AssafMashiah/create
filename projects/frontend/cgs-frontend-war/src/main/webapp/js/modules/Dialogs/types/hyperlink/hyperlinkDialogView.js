define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'FileUpload', 'files', 'busyIndicator',
    'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/hyperlink/hyperlinkDialog.html'],
    function f648(_, $, BaseView, Mustache, events, FileUpload, files, busy, BaseDialogView, template) {

        var hyperlinkDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',
            events: {'keyup #text-url' : 'validateUrl'},

            initialize: function f649(options) {
                this.customTemplate = template;
                this._super(options);
            },
            validateUrl: function(){

                var urlValue = this.$('#text-url').val();
                var isValid = this.constructor.validationUrl.test(urlValue);

                this.$('#text-url')[isValid? 'removeClass' : "addClass"]('notValid');
            },

            render: function f650($parent) {
                this._super($parent, this.customTemplate);

                this.$('.test-link').click(function(e) {
                    var url = this.$('#text-url').val();
                    if (url) {
                        $(e.target).attr('href', url);
                    }
                    else {
                        $(e.target).removeAttr('href');
                        return false;
                    }
                }.bind(this));
                this.validateUrl();
                this.$('#text-url').focus();

            },

            beforeTermination: function() {
                this.controller.setReturnValue('yes', { url: this.$('#text-url').val() });
            }

        }, {type: 'hyperlinkDialogView',
            validationUrl : /^(https?):\/\/.+/i});

return hyperlinkDialogView;

});