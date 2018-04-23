define(['Class', 'mustache', 'translate'], function (Class, mustache, translate) {

	var PluginRenderTemplateModel = Class.extend({
		//init the model with a json of translation according to the current interface language
		initialize: function (translation) {
			this.translation = translation;
		},
		//render a mustache template can sent the object context to render the template + partial template
		render: function (template, obj, partials) {
			var renderResult;
			//set in translate model the current translation json
			translate.setTranslationJSon(this.translation);

			renderResult = mustache.render(template,obj || {}, partials);

			//move the translation json from the translate model
			translate.setTranslationJSon(null);

			return renderResult;
		},
		// translate a string 
		translate: function(string){
			var translationString;
			
			//set in translate model the current translation json
			translate.setTranslationJSon(this.translation);
			
			//call translate finction
			translationString = translate.tran(string);

			//remove the translation json from the translate model
			translate.setTranslationJSon(null);

			return translationString;

		}
		
	});

	return PluginRenderTemplateModel;
});