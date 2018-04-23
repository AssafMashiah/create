define(['BaseController', './TreeComponentView', './config', 'repo', 'events', 'editMode','cookie'],
function(BaseController, TreeComponentView, config, repo, events, editMode) {

	var TreeComponent = BaseController.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);
			this.view = new TreeComponentView({controller: this});
			this.activeEntry = 0;
			this.collapsedEntries = [];
			this.registerEvents();
		},

		registerEvents: function(){
			this.bindEvents({
				'loadTree':{'type':'register', 'func': this.load, 'ctx': this, 'unbind':'dispose'},
				'adjust_screen_height': {'type':'register', 'func': this.view.scrollToActive, 'ctx': this.view, 'unbind':'dispose'}
			});
		},

		load: function(id) {
			this.activeEntry = id;

			this.view.fillTree();

			this.view.setActive(this.activeEntry);

			this.screen.components.menu.refreshMenu();

			// Scroll to active
			this.view.scrollToActive();

			//check if we are in a course tree, if so, fire event to update toc editor tree index
			if (this.router.activeEditor.constructor.type == "TocEditor"){
				events.fire(this.constructor.type + "Ready", this.router.activeEditor.config.id);
			}
		},

		isCollapsed: function(id) {
			return _.contains(this.collapsedEntries, id);
		},

		changeCollapsed: function(id, toCollapse) {
			var index = this.collapsedEntries.indexOf(id);

			if (toCollapse) {
				if (index < 0){
					this.collapsedEntries.push(id);
					this.updateCookie(id);
				}
			}
			else if(index >= 0) {
				this.collapsedEntries.splice(index, 1);
				this.updateCookie(id);
			}
		},

		updateCookie: function(id) {
			var record = repo.getAncestorRecordByType(id,this.config.startType);
			collapsedStr = this.collapsedEntries.toString();
			$.removeCookie('cgs_tree_' + record.id);
			$.cookie('cgs_tree_' + record.id, collapsedStr, { expires: 30 });
		},

		dispose: function() {
			this._super();
		}

	}, {type: 'TreeComponent'});

	events.register("TreeComponentReady");

	return TreeComponent;

});
