define(['jquery', 'translate', 'BasePropertiesView', 'text!./templates/PluginDefaultPropertiesView.html'],
function($, translate, BasePropertiesView, defaultTemplate) {

	var PluginEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = options.template || defaultTemplate;
			this._super(options);
			console.log('QuestionEditorView initialized');
		},
		render: function ($parent) {
			//before rendering the plugin properties, set the plugin's translation file 
			if(this.controller.pluginClassManagerInstance.translation){
				translate.setTranslationJSon(this.controller.pluginClassManagerInstance.translation);
			}
			this._super($parent);

			//reset plugin's translation file
			translate.setTranslationJSon(null);

		}

	}, {type: 'PluginEditorView', showProperties: true});

	return PluginEditorView;

});
