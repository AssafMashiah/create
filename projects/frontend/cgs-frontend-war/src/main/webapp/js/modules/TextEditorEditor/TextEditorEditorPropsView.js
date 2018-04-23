define(['jquery', 'BasePropertiesView', 'text!modules/TextEditorEditor/templates/TextEditorEditorProps.html'],
function($, BasePropertiesView, template) {

	var TextEditorEditorPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);

        },
        render: function(){
        	this._super();
        	var self= this;

        	//validation on max chars
        	//4 chars only digits
			$("#MaxChars").blur(function(e){
			
				//if value inserted was invalid, we need to put default value according to answer size ( letter, word, line, ect..)
				if(this.value =="" || eval(this.value) == 0){
					this.value = require("modules/TextEditorEditor/constants").editor[self.controller.record.data.answer_size].MaxChars;
				}

				require('repo').updateProperty(self.controller.record.id, 'MaxChars', this.value.substring(0,4), false, true);
				this.value = self.controller.record.data.MaxChars;
			});

        },

        maximumChars: function() {
        	return this.controller.maximumChars();
        }

	}, {type: 'TextEditorEditorPropsView'});

	return TextEditorEditorPropsView;

});
