define(['BaseController', './TreeComponentView', './TreeEntryView', './config', 'events', 'publisher_collection'],
function(BaseController, TreeComponentView, TreeEntryView, config, events, PublishersCollection) {

	var TreeComponent = BaseController.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);

			this.view = new TreeComponentView({controller: this});
		},
		_add_new_entry: function (model, index) {
			return new TreeEntryView({
				item: {
					data: model.toJSON()
				},
				handler: this.handler
			});
		},
		setItems: function(collection, callback, controller, dontDispose) {
			if ((!collection || !_.size(collection)) && !dontDispose) {
				this.dispose();
				this.view.dispose();
			} else {
				this.view.clear()

				this.collection = collection;
				this.handler = callback.bind(controller);

				_.each(this.collection, this._add_new_entry, this);
		
				this.view.adjustWidth();
				
				$("#tree-component-root").click();
			}
		},
	}, {type: 'TreeComponent'});

	events.register("TreeComponentReady");

	return TreeComponent;

});
