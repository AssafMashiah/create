define(['backbone_super', 'BaseController', './config'],
function(Backbone, BaseController, config) {

	var PropsComponent = BaseController.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);
		},

		startEditing: function(record, changes, container) {
			var Model = Backbone.Model.extend({}),
				model = new Model(record.data);

			if (changes) {
				_.each(changes, function(callback, field) {
					model.on('change:' + field, callback);
				});
			}

			this.config.screen.editor.view.startEditing(model, container);



			return model;
		}

	}, {type: 'PropsComponent'});

	return PropsComponent;

});
