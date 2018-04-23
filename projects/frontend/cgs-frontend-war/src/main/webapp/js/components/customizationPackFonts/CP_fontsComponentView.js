define(['mustache', 'events', 'cgsUtil', 'text!components/customizationPackFonts/templates/cp_fontsTemplate.html'],
    function(mustache, events, cgsUtil, template) {

        var fontsView = Backbone.View.extend({
            events : {
                'click .new_font' : 'uploadFontFamily'
            },

            initialize: function() {
                this.render();
	            cgsUtil.setInputMode(this.$el);
            },

            render: function() {
                this.$el.html(mustache.render(template, this.options.data));

                // remove the last comma from the file extension list
                $(this.$('.extesions')).each(function(){
                    var  currentText =$(this).text();
                    $(this).text(currentText.substring(0 ,currentText.length -2 ));
                });
            },
  
            //open upload font family dialog
            uploadFontFamily: function(){

                var dialogConfig = {
                    title: "Embed Fonts",
                    buttons: {
                        yes: { label: 'Embed',canBeDisabled: true },
                        cancel: { label: 'Cancel' }
                    },
                    closeOutside: false
                };
                
                events.once('afterUploadFont', function(response, responseKey){

                    if(responseKey === "yes" && response){
                        //upload zip
                        this.options.controller.add_font(response);
                    }

                }, this);

                require('dialogs').create('cp_fontUpload', dialogConfig, 'afterUploadFont' );
            }

        });

        return fontsView;
    });