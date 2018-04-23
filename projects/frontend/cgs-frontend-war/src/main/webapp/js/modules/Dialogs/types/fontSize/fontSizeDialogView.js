define(['modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/fontSize/fontSizeDialog.html'],
    function f648(BaseDialogView, template) {

        var fontSizeDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',
            events: {
                'keyup #fontSizeInput': 'checkFontSize',//keyup: to support checking on each change
                'change #fontSizeInput': 'checkFontSize',//change: to support value changing with the arrows (input type number)
            },

            initialize: function (options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function ($parent) {
                this._super($parent, this.customTemplate);
            },
            checkFontSize: function(e) {
                var currrntVal = this.$('#fontSizeInput').val();
                var disable = !currrntVal.length ||
                            parseInt(currrntVal) < parseInt(this.$('#fontSizeInput').attr('min')) ||
                            parseInt(currrntVal) > parseInt(this.$('#fontSizeInput').attr('max'));
                this.$('#yes').attr('disabled', disable);
                this.$('#yes')[disable ? 'addClass' : 'removeClass']('disabled');
                if(!disable){
                    this.controller.setReturnValue( 'yes', this.$('#fontSizeInput').val() ) ;

                }
            }

        }, {type: 'fontSizeDialogView'});

return fontSizeDialogView;

});