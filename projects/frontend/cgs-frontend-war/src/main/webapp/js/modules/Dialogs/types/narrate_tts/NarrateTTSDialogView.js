define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'busyIndicator', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/narrate_tts/NarrateTTSDialog.html'],
function(_, $, BaseView, Mustache, events, busy, BaseDialogView, template) {

	var NarrateTTSDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',
        events: {
            'change .asIs_checkbox': 'onCheckAsIs',
            'click .narrate': 'narrate'
        },
		setReturnValueCallback: {
			"ok": function () { 
				return this.response;
			},
			"cancel": function () {
				return false;
			}
		},
		initialize: function(options) {
			
			this.customTemplate = template;
			
			this._super(options);

		},
        narrate: function (e) {
            busy.start();
            
            var repo = require("repo");
            var courseLocale = repo.get(repo._courseId).data.contentLocales[0];
            var textToNarrate = null;
            
              
            if (this.$('.asIs_checkbox').is(":checked")) {
                textToNarrate = this.options.config.asIsText;
            } else {
                textToNarrate = this.$('.asIs_textarea').val();
            }
            
            
            require("ttsModel").go(courseLocale, textToNarrate, function (response) {
                this.$('.message').text('File upload successfuly');
                this.response = response;
                
                busy.stop();
                
            }.bind(this), function () {
                busy.stop();
                this.$('.message').text('Error upload, invalid provider');
            }.bind(this));
        },
        onCheckAsIs: function (e) {
            if ($(e.target).is(":checked")) {
                this.$(".asIs_textarea").addClass('hide');
            } else {
                this.$(".asIs_textarea").removeClass("hide");
            }
        },
		render: function( $parent ) {
			this._super($parent, this.customTemplate);
		}

	}, {type: 'NarrateTTSDialogView'});

	return NarrateTTSDialogView;

});
