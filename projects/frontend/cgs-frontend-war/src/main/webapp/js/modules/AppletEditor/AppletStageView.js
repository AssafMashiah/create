define(['jquery', 'BaseStageContentView', 'assets', 'text!modules/AppletEditor/templates/AppletStage.html'],
function($, BaseStageContentView, assets, template) {

	var AppletStageView = BaseStageContentView.extend({

		initialize: function(options) {
			
			this.template = template;
			this._super(options);
		},

		render: function(parent){
			
			this._super(parent);

			this.loadApplet() ;
			
		},
		
		loadApplet: function(){
			this.$frame = this.$('#appletFrame');
			this.$frame.attr("src", assets.serverPath(this.controller.record.data.appletPath+"/data/index.html"))
				.addClass('notvisible');
		},

		dispose: function() {
			if (this.$frame) {
				this.$frame.remove();
			}

			this._super();

			delete this.$frame;
		}
		
				
	}, {type: 'AppletStageView'});

	return AppletStageView;

});
