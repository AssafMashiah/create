define(['jquery', 'mustache', 'modules/TextViewerEditor/TextViewerPropsView', 'text!modules/ClozeTextViewerEditor/templates/ClozeTextViewerProps.html'],
function($, Mustache, TextViewerPropsView, template) {


	var ClozeTextViewerPropsView = TextViewerPropsView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		//ovverride function in textviewer ,here don't allow narration per paragraph
		initNarrationTypes: function(){
			var types= this.controller.record.data.availbleNarrationTypes;
			if(!types){
				types = [{"name": "None", "value": ""},
						{"name":"General", "value": "1"}];
			}

			_.each(types, function(item){
				var mustached = Mustache.render('<option value="{{value}}">{{name}}</option>', item);
				$("#narration_type").append(mustached);
			});
		}
	}, {type: 'ClozeTextViewerPropsView'});

	return ClozeTextViewerPropsView;

});
