define(['jquery', 'BasePropertiesView', 'StandardsList', 'standardsModel', 'text!modules/LoEditor/templates/LoEditor.html'],
function($, BasePropertiesView, StandardsList, standardsModel, template) {

	var LoEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function () {
			this._super();
			if (this.controller.enableStandards) {
				this.standardsList = new StandardsList({
						itemId: '#standards_list',
						repoId: this.controller.config.id,
						getStandardsFunc: _.bind(function () {
							return standardsModel.getStandards(this.controller.config.id);
						}, this)
					});
			}
		}


	}, {type: 'LoEditorView'});

	return LoEditorView;

});
