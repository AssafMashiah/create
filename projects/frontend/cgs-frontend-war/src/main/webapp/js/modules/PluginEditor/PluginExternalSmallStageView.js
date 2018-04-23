define(['BaseStageContentView', "text!./templates/PluginExternalSmallStage.html"],
function(BaseStageContentView, template) {

	var PluginExternalSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;

			this._super(options);
			
			console.log('PluginExternalSmallStageView initialized');
		},

		render: function ($parent) {
			this._super($parent);

			if (this.controller.record.data.scrollableY) {
            	this.$('.' + this.controller.elementType + '_content').addClass('scrollableY');
            }

			var cfg = {
				$content: this.$('.' + this.controller.elementType + '_content'),
				$before: this.$('.' + this.controller.elementType + '_content_before'),
				$after: this.$('.' + this.controller.elementType + '_content_after'),
				state: 'preview',
				readOnly: require('editMode').readOnlyMode,
				menuHeight : $('.screen-header').outerHeight() + $("#task_types_nav_bar").outerHeight()
			};

			this.controller.pluginClassManagerInstance.invoke(this.controller.instanceId, 'onRenderComplete', cfg);
		}
		
	}, {type: 'PluginExternalSmallStageView'});

	return PluginExternalSmallStageView;

});
