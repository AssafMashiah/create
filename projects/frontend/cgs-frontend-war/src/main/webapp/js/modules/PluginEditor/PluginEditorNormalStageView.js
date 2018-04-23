define(['BaseNormalStageContentView', 'text!./templates/PluginNormalStage.html'],
function(BaseNormalStageContentView, template) {

	var PlugintEditorNormalStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);

			this.template = template;

			console.log('PlugintEditorNormalStageView initialized');
		},
		render: function ($parent) {
			this._super($parent);

            this.$el.attr('data-type', 'plugin');

            if (this.controller.record.data.scrollableY) {
            	this.$('.' + this.controller.elementType + '_content').addClass('scrollableY');
            }

			var cfg = {
				$content: this.$('.' + this.controller.elementType + '_content'),
				$before: this.$('.' + this.controller.elementType + '_content_before'),
				$after: this.$('.' + this.controller.elementType + '_content_after'),
				state: 'edit',
				readOnly: require('editMode').readOnlyMode,
				menuHeight : $('.screen-header').outerHeight() + $("#task_types_nav_bar").outerHeight()
			};

			this.controller.pluginClassManagerInstance.invoke(this.controller.instanceId, 'onRenderComplete', cfg);
        }

	}, {type: 'PlugintEditorNormalStageView'});

	return PlugintEditorNormalStageView;

});
