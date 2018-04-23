define(['jquery', 'BaseNormalStageContentView', 'text!modules/OptionEditor/templates/OptionNormalStage.html','editMode'],
function($, BaseNormalStageContentView, template,editMode) {

	var OptionStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		// override parent function for read only mode check 
		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);

			if(this.canBeEditable()) {
				var self = this;
				this.$el.find('.option_icon').click(function(){
					self.setCorrectOption();
				});
			}
		},

		dispose: function() {
			this.$el.find('.option_icon').unbind('click');
			this._super();
		},

		setCorrectOption: function() {
			this.children_obj[0] && this.children_obj[0].stage_view.endEditing(); //TV/IM/SB
			this.controller.setCorrectOption();
			require('router').startEditingActiveEditor();
		}
		
	}, {type: 'OptionStageView'});

	return OptionStageView;

});
