define(['lodash', 'jquery', 'BaseView', 'events', 'types', 'text!modules/TreeComponent/templates/TreeEntryView.html'],
function(_, $, BaseView, events, types, template) {

	var TreeEntryView = BaseView.extend({

		className: 'entry',
		tagName: 'li',
		appendToParent: true,

		initialize: function(options) {
			this.options = options;
			this.item = options.item;
			this.$parent = $(this.options.parent || '#tree_list');
			this._super(this.item);
		},

		render: function() {
			this._super(template);

			if (_.isFunction(this.options.handler)) {
				this.$el.click(function (e) {
					this.$el.parents('ul').find('label').removeClass('selected');
					this.$el.find('label').addClass('selected');

					this.options.handler(e, this.options.item);
				}.bind(this));
			}
		},

		toggleCollapse: function() {
			this.collapsed = !this.collapsed;
			this.updateCollapsed(true);
		},

		updateCollapsed: function(toOpen) {
			if (this.collapsed) {
				this.$('> .node-tree').hide();
				this.$('> .node-collapse i').attr('class', 'icon-caret-right');
				this.controller.changeCollapsed(this.obj.id, true);
			}
			else if(toOpen){
				this.$('> .node-tree').show();
				this.$('> .node-collapse i').attr('class', 'icon-caret-down');
				this.controller.changeCollapsed(this.obj.id, false);
			}
		}

	}, {type: 'TreeEntryView'});

	return TreeEntryView;

});
