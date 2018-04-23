define(['FileUpload', 'files', 'modules/Dialogs/BaseDialogView', 
    'text!modules/Dialogs/types/customizationPackFontUpload/customizationPackFontUpload.html'],
    function f648(FileUpload, files, BaseDialogView, template) {

        var customizationPackFontUploadDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            events: {
                'click .legalRightsCheckbox': 'enableUpload',
                'click .moreInfoBtn' : 'showMoreInfo'
            },

            initialize: function f649(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f650($parent) {
                this._super($parent, this.customTemplate);

                //upload zip of font files
                new FileUpload({
                    activator: "#upload_font",
	                options:  _.extend({
		                uploadFileLocalyOnly: true
	                }, FileUpload.params.zip),
                    callback: this.openZip,
                    context: this
                });
                this.bindEvents();
            },

            bindEvents: function(){
                //bind the "yes" event because the yes button is disabled at first so he has no event attached to it
                this.$("#dialogControls #yes:not(.disabled)").unbind('click').click(_.bind(function(){
                    this.controller.onDialogTerminated('yes');
                },this));
            },

            //set the font name in the dialog 
            openZip: function(filePath, originalName) {
                this.$('.fontName').html(originalName);
                //add the fonts zip path as a return value
                this.controller.setReturnValue( 'yes', {'filePath' : filePath , 'originalName' : originalName} );
                this.enableUpload();
            },

            //allow "yes" button only if checkbox is checked
            enableUpload: function() {
                if( this.$('.legalRightsCheckbox').attr('checked') && this.$('.fontName').html() !== ''){
                    this.$("#dialogControls #yes").removeAttr('disabled').removeClass('disabled');
                }else{
                    this.$("#dialogControls #yes").attr('disabled', 'disabled').addClass('disabled');
                }
            },

            //show leagal rights info
            showMoreInfo: function (e){
                if(this.$('#dialog').hasClass('showInfo')){
                    this.$('#dialog').removeClass('showInfo');
                }else{
                    this.$('#dialog').addClass('showInfo');

                }
            }

        }, {type: 'customizationPackFontUploadDialogView'});

return customizationPackFontUploadDialogView;

});