define(['jquery', 'repo', 'mustache', 'types', 'editMode', 'clipboardManager', 'BaseView',
	'text!modules/TreeComponent/templates/TreeComponentView.html',
	'text!modules/TreeComponent/templates/TreeEntryView.html'],
function($, repo, mustache, types, editMode, clipboardManager, BaseView, template, recordTemplate) {

	var TreeComponentView = BaseView.extend({

		el: '#tree_base',
		clearOnRender: true,

		initialize: function(options) {
			this._super(options);
		},

        events: {
            'mouseover':  "propagateFieldChange"
        },

        // handle field change prior to click on tree. 
        // this will blur and focus back to the activeElement, so change event for a field will fire.
        // Otherwise, upon clicking on a tree item, router goes somewhere else before change event, and record is not updated.
        propagateFieldChange: function f1376(){
            if (['TEXTAREA','INPUT'].indexOf(document.activeElement.nodeName) !== -1) {
                document.activeElement = document.activeElement;
                $(document.activeElement).blur();
                $(document.activeElement).focus();
                event.stopPropagation();
            }
        },

		render: function() {
			this._super(template);
		},

		getRecordHTML: function(record, parentIndex, count) {

			var myIndex;
			if (count) {
				myIndex = parentIndex ? [parentIndex, count].join('.') : count;
			}
			else {
				myIndex = parentIndex || '';
			}

			var childrenHTML = _.chain(record.children)
								.map(function(childId) {
									return repo.get(childId);
								})
								.filter(function(child) {
									if (child && types[child.type]) {
										if (child.type == "sequence" && child.data &&
											(child.data.sq_type == "ending" || child.data.sq_type == "overview")) {
											return false;
										}
										//stop the recursion
										if (!_.isArray(this.controller.config.endType)) {
											this.controller.config.endType = [this.controller.config.endType];
										}
										//types[child.type].group !== this.controller.config.endType &&
										return  this.controller.config.endType.indexOf(types[child.type].group) === -1;
									}
								}, this)
								.map(function(child, index) {
									return this.getRecordHTML(child, myIndex, index + 1);
								}, this)
								.value()
								.join('\n');

			var data = {
				obj: record,
				showCommentIndication: this.showCommentIndication(record),
				valid: true,
				index: myIndex,
				children: childrenHTML,
				hasChildren: !!childrenHTML,
				collapsed: this.controller.isCollapsed(record.id)
			};
			
			return mustache.render(recordTemplate, data);
		},

		fillTree: function() {
			this.unbindDOMEvents();

			this.render();

			var record = repo.getAncestorRecordByType(this.controller.activeEntry, this.controller.config.startType);

			this.controller.collapsedEntries = [];
			var collapsed = $.cookie('cgs_tree_' + record.id);
			if(collapsed) {
				this.controller.collapsedEntries = collapsed.split(',');
			}

			var mustached = this.getRecordHTML(record);

			this.$('#tree_list').html(mustached);

			this.bindDOMEvents();
		},

		bindDOMEvents: function() {
			var self = this;

			this.$('[data-id]').each(function() {
				require('events').bind('&' + $(this).attr('data-id'), self.updateName, self);
			});

			this.$('li.entry').bind('click', function(e) {

				var elementId = $(e.currentTarget).attr('data-id');

				if (e.target.tagName == 'I' && !$(e.target).is('.hide-icon')) {
					this.toggleCollapse(e);
				}
				event.stopPropagation();
				this.setActive(elementId);
				clipboardManager.setFocusItem({
					id: elementId
				});
			}.bind(this));

			var liItems = this.$('li:not(.nosort)');

			// var unpublishedItems = _.filter(liItems, function f1374(item) {
			// 	var _id = $(item).attr('data-id');
			// 	return _id && !~require("courseModel").getPublishedItems().indexOf(_id);
			// });

			_.each(liItems, function f1375(item) {
				var _id = $(item).attr('data-id');
				if (~require("courseModel").getPublishedItems().indexOf(_id)) {
					$(item).children(".node-collapse").find(".node-label").addClass("published");
				}
			});

			// Sorting for tree component
			setTimeout(function() {
				if (!editMode.readOnlyMode) {
					$('.nav.node-tree', self.$el).each(function() {
						$(this).sortable({
							containment: 'parent',
							cursor: 'move',
							forceHelperSize: true,
							forcePlaceholderSize: true,
							items: liItems.filter($(this).children()).filter("[data-type!='quiz']"),
							revert: true,
							tolerance: 'pointer',
							start: self.onStartSort.bind(self),
							stop: self.onStopSort.bind(self),
							update: self.onUpdate.bind(self)
						});
					});
				}
			}, 700);
		},

		updateName: function(id) {
			var rec = repo.get(id);
			if (rec) {
				this.$('li[data-id="' + id + '"] > a.node-collapse > .node-label').text(rec.data.title).attr('title',rec.data.title);
			}
		},

		unbindDOMEvents: function() {
			this.$('[data-id]').each(function() {
				require('events').unbind('&' + $(this).attr('data-id'));
			});

			this.$('li.entry').unbind('click');
		},

		onStartSort: function(event, ui) {
			$('a.node-collapse', ui.item).bind('click', this.disableHref);
			ui.placeholder.append('<a class="node-collapse"><span class="node-index">1.1.2</span></a>');
		},

		onStopSort: function(event, ui) {
			$('a.node-collapse', ui.item).unbind('click', this.disableHref);
		},

		disableHref: function() {
			return false;
		},

		onUpdate: function(event, ui) {
			var ids = $.map($(ui.item).parent().children(), function(item) {
				return $(item).attr('data-id');
			});

			var items_order = ids.join(',');
			var id = ui.item.attr('data-id');

			repo.updateChildrenOrder(id, null, items_order, true);

			this.controller.load(id);
		},

		setActive: function(id) {
			this.$('a.active').removeClass('active');
			this.$('[data-id="' + id + '"] > a').addClass('active');
		},

		scrollToActive: function() {
			var tree = this.$el;

			if (tree && tree.length) {
				var activeEl = tree.find('.node-collapse.active');
				
				if (activeEl.position().top < 0) {
					tree.scrollTop(0);
					tree.scrollTop(activeEl.position().top);
				}
				else if (activeEl.position().top > tree.height() - activeEl.height()) {
					tree.scrollTop(0);
					tree.scrollTop(activeEl.position().top - tree.height() + activeEl.height());
				}
			}
		},

		showCommentIndication: function (record) {
            if (['sequence', 'html_sequence', 'url_sequence', 'separator', 'differentiatedSequenceParent', 'page'].indexOf(record.type) != -1) {
                //check for comment inside the sequence
                if (record.data.comments && record.data.comments.length > 0) {
                    return true;
                }
                //check for comment inside any of the sequence children
                for (var i = 0; i < record.children.length; i++) {
                    var taskChild = repo.get(record.children[i]);
                    if (taskChild.data.comments && taskChild.data.comments.length > 0) {
                        return true;
                    }
                }
            }
            return false;
        },

        toggleCollapse: function (e) {
        	var li = $(e.currentTarget);
            if ($(e.target).hasClass('icon-caret-down')) {
            	li.children('.node-tree').addClass('collapsed-tree');
            	$(e.target).removeClass('icon-caret-down').addClass('icon-caret-right');
                this.controller.changeCollapsed(li.attr('data-id'), true);
            }
            else {
            	li.children('.node-tree').removeClass('collapsed-tree');
            	$(e.target).removeClass('icon-caret-right').addClass('icon-caret-down');
                this.controller.changeCollapsed(li.attr('data-id'), false);
            }
        },

        dispose: function() {
        	this.unbindDOMEvents();
        	this._super();
        }

	}, {type: 'TreeComponentView'});

	return TreeComponentView;

});
