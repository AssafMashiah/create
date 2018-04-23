define(['BaseStageContentView', "text!./templates/PluginContentStage.html"],
function(BaseStageContentView, defaultTemplate) {

	var PluginContentStageView = BaseStageContentView.extend({
		el: "#stage_base",
		clearOnRender: true,
		initialize: function(options) {
            var wrapper = $(defaultTemplate);

            if (options.template) {
                wrapper.html(options.template);
            }


			this.template = wrapper.get(0).outerHTML;
			
			this._super(options);

			console.log('PluginContentStageView initialized');
		},
		render: function($parent) {
			if (typeof this.template === 'undefined') {
				throw new Error('No `template` field: ' + this.constructor.type);
			}

			this.$el.append(require('mustache').render(this.template, this.controller));
		}
		
	}, {type: 'PluginContentStageView'});

	return PluginContentStageView;

});
