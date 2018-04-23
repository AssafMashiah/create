define(['jquery', 'backbone', 'BaseView', 'events', '_mathfield', 'jquery_ui'],
function($, Backbone, BaseView,  events, wrapped) {
	var MathFieldView=  BaseView.extend({
		
		initialize: function(config) {
			
			this.config = config;

			var container = $(config.iframeDoc || config.container);
			
			if (container.length &&
				(container[0].nodeType == 9 && container[0].defaultView ||
				container[0].nodeType == 1)) {
				this.render();
			}
			else {
				this.remove();
			}

		},

		render: function() {
		var self = this;
		conf = {
				parent:this.config.parent,
				container: $(this.config.container),
				targetDocument: $(this.config.iframeDoc),
				onRendered: console.log.bind(console, 'mathfield rendered'),
				onStartEdit : this.config.onStartEdit,
				onEndEdit : this.config.onEndEdit,
				useMathfieldKBHack: true,
				onChange: this.config.onChange,
				dontEnableBlowup : !!this.config.data.attr('dontEnableBlowup')
			};

			if (this.config.editMode) {
				conf.editMode = this.config.editMode;
				
				$(this.config.data).attr('editMode', this.config.editMode);
			}

			conf.data = $(this.config.data);

			this.mathField = new wrapped.mathfield(conf);

			this.mathField.setEnabled(false);
		},

		dispose: function() {
			this.mathField && this.mathField.dispose && this.mathField.dispose();
			this._super();
		}

	}, {type: 'MathFieldView'});
	return MathFieldView;
});
