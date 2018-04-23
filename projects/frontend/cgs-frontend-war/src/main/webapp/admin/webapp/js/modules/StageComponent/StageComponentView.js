define(['jquery', 'events'],
function($, events) {

	var StageComponentView = Backbone.View.extend({

		el: '#stage_base',

		initialize: function(controller) {
			this.registerEvents();
			console.log('StageComponentView initialized');
		},

		registerEvents: function() {
			// Click on the stage (not including its children)
			// will fire event that changes the active editor.
			this.$el.click(function(event) {
				if ($(event.target).attr('id') == 'stage_base') {
					events.fire('clickOnStage');
				}
			});
		}

	}, {type: 'StageComponentView'});

	return StageComponentView;

});
