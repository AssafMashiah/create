define(['lodash', 'jquery', 'BaseView', 'events','translate','text!modules/MenuComponent/templates/MenuComponentView.html',
	    'mustache', './constants', 'bootstrap'],
function(_, $, BaseView, events,i18n, template, Mustache, constants) {

	var MenuComponentView = BaseView.extend({

		el: '#menu_base',
		courseReferencesMenuItem: {},

		initialize: function(controller) {
			this.userName = AuthenticationData.user.userName;
			this._super(controller);
			this.templates = this.controller.constants.templates;
			this.controller.bindEvents({'setMenuButtonState' : {'type':'register', 'func': this.setButton, 'ctx':this}});

			console.log('MenuComponentView initialized');
		},

		menuRightInitialize:function () {

			var tmpBttn;

			_.each(constants.menuRight, function (item, index) {
				// if exsist event and in config showpreview == true and menu item can be disabled
				if (!!item.event) {
					this.enableMenuItem(item.id);

					tmpBttn = $("#" + item.id);
					tmpBttn.unbind('click');
					tmpBttn.click(function () {
						events.fire(item.event);
					});

				} else {
					this.disableMenuItem(item.id);
				}
			}, this);
		},

		remove: function() {
			$("#menu_base").empty();
			$("#sub_menu_base").empty();
			this._super();
		},

		render: function() {
			this._super(template);

			var id, self = this;
			this.startResizing = false;

			$(window).resize(function (event) {
				event.preventDefault();
				event.stopPropagation();
				clearTimeout(id);
				if(!self.startResizing) {
					id = setTimeout(self.doneResizing.bind(self), 100);
				}

				return false;
			});
		},

		doneResizing: function() {
			this.startResizing = true;
			this.controller.setItems(this.controller.extendedConfig, true, this.controller.menuInitFocusId);
			this.startResizing = false;
			console.log('Done Menu Resizing')
		},

		getMenuViewPortWidth: function() {
			return document.getElementsByClassName('screen-header')[0].scrollWidth;
		},

		setItems: function(config, menuInitFocusId) {
			// save configuration
			this.menuItemsCfg = config;

			// clear menu
			this.undelegateEvents();
			this.setElement(document.getElementById('menu_base'));
			this.$el.children('#menu_left_panel').remove();

			this.menuItems= [];

			// create and append base menu (up menu)
			var left_panel = $('<div id="menu_left_panel"></div>');

			_.each(config, function (menuItem, index) {

				if(!!menuItem.notImplemented) {
					menuItem.disabled = true;
					menuItem.tooltip = menuItem.label + ' – ' + i18n.tran('Coming soon') + '…';
				}

				this.menuItems.push(menuItem);
				//set up the first level menu display

				$(Mustache.render(this.templates[menuItem.type], menuItem))
					.bind('click.menu', _.bind(function () {
						if (!menuItem.notImplemented && !menuItem.disabled) {
							if (!!menuItem.event) {
                                events.fire_with_lock(200,menuItem.event);
                            }

							this.controller.menuInitFocusId = menuItem.id;
							this.openSubMenu(menuItem);

							this.doneResizing();
						}
					},this))
					.appendTo(left_panel);
			}, this);

			this.$el.append(left_panel);

			//open sub menu items for active menu item
			this.openSubMenu( this.getItemById(config, menuInitFocusId) );

			this.menuRightInitialize();

			events.once('end_load_of_menu', function(){
				console.log('menu render is finished');
			});

			events.fire('end_load_of_menu');

		},

		getItemById: function(config, id){
			if (!id)
				return config[0];

			return (_.where(config, {'id': id})[0]);
		},

		setButton: function(buttonId, action, params){
		
			var menuItem = _.where(this.menuItems, {'id':buttonId})[0];

			if(menuItem){
				switch(action){
					case 'select':
						$("#"+menuItem.id).addClass('selected');
					break;

					case 'unselect':
						$("#"+menuItem.id).removeClass('selected');
					break;

					case 'disable':
						$("#" + menuItem.id).attr('disabled', true)
                            .addClass("disabled")
                            .find("a")
                            .addClass("disabled")
                            .attr('disabled', true);

						if (params && params.unbindFunction) {
							if (params.functionToUnbind) {
								events.unbind(menuItem.event, params.functionToUnbind);
							} else {
								events.unbind(menuItem.event);
							}
						}
					break;

					case 'enable':
						$("#"+menuItem.id).attr('disabled', false)
                            .removeClass("disabled")
                            .find("a")
                            .removeClass("disabled")
                            .attr('disabled', false);

						var eventsConf = {};
						eventsConf[menuItem.event] = {};

						if (params && params.bindFunction) {
							eventsConf[menuItem.event] = {'type':'bind', 'func': params.functionToBind , 'ctx':this, 'unbind':'dispose'};
							this.controller.bindEvents(eventsConf);
								// events.bind(menuItem.event, params.functionToBind);
						} else if (params && params.registerFunction) {
							eventsConf[menuItem.event] = {'type':'register', 'func': params.functionToBind , 'ctx':this, 'unbind':'dispose'};
							this.controller.bindEvents(eventsConf);
								// events.register(menuItem.event, params.functionToBind);
							}
					break;

					case 'changeLabel':
						if(params&& params.label){
							$("#"+menuItem.id +" label").text(params.label);
						}
				}

			}
		},

		clearSubMenu: function(){
			$('#sub_menu_base').html('');
		},

		showActiveTab: function(menuItem){
			this.$('.btn').removeClass(constants.activeTabClass);
			this.$('#' + menuItem.id).addClass(constants.activeTabClass);
		},

		checkMaxDepth: function(){

			var selectedNode = $(".nav.node-tree .node-collapse.active .node-index").text(),
				currentLevel,
				course = repo.get(repo._courseId),
				maxDepth = 0;
			
			if (course) {
				maxDepth = course.data.maxDepth;
			}

			if(selectedNode === ""){
				currentLevel = 0;
			} else {
				var tmpArray = selectedNode.split(".");
				currentLevel = tmpArray.length;
			}

			return (currentLevel >= maxDepth);
		},

		handleMenuItem:function (rec) {

        
            this.handleEditMode(rec);
		},

		handleEditMode: function(rec) {

		},

		openSubMenu : function(menuItem) {
			if(!!!menuItem) {
				return;
			}

			this.clearSubMenu();
			this.showActiveTab(menuItem);
			var repoItems = {};
            if (!menuItem.subMenuItems.length) {
                $('#sub_menu_base').parent().addClass("hidden");
            }
			_.each(menuItem.subMenuItems, function(subMenuItem,index){
				this.menuItems.push(subMenuItem);

				repoItems.tab = subMenuItem.subMenuItems;
				repoItems.label = subMenuItem.label;
				repoItems.id = subMenuItem.id;

				_.each(repoItems.tab, function(rec, i){
					this.menuItems.push(rec);
					this.handleMenuItem(rec);

				}, this);
				
				$(Mustache.render(this.templates[subMenuItem.type], repoItems)).appendTo($('#sub_menu_base'));
				this.setEventToItems(repoItems.tab);

			}, this);
		},

		setEventToItems:function (Items) {

			$(Items).each(function (index, item) {

				if (!!item.event) {

					// handle 'dontStealFocus'
					if (item.dontStealFocus) {
						$("#" + item.id).mousedown(function (e) {
							e.stopPropagation();
							return false;
						});
					}

					//handle mouse clicks
					$("#" + item.id).unbind('click');  //prevent multiple binding

					$("#" + item.id).on("click",_.bind(function (e) {
                        var $el = $("#" + this.id);
                        //for sub sub menus
                        if(this.stopPropagation) {
                            e.stopPropagation();
                        }
                        if ($el.attr('disabled')) {//&& !$(e.target[id='menu-button-insert-af']).length > 0
                            return false;
                        }
                        events.fire_with_lock(300,this.event,this.args);

                    }, this));

					//handle keyboard actions
					if (item.keyPress && !$("#" + item.id).attr('disabled')) {
						item.keyPress.event = item.event;
					}
				}
			});
		},

        disableMenuItem : function(menuItemId){
			$('#'+ menuItemId).addClass('disabled').attr('disabled', '').unbind('click');
		},

		enableMenuItem : function(menuItemsId) {
			if(_.isEmpty(menuItemsId)) {
                return ;
            }
            if (!_.isArray(menuItemsId)) {
                menuItemsId = [menuItemsId];
            }
            _.map(menuItemsId,function (value){
                $('#'+ value).removeClass('disabled').removeAttr('disabled');
            });

		},

		dispose: function(){
			$(window).unbind('resize');
			this.undelegateEvents();
			this.remove();

			delete this;
		}

	}, {type: 'MenuComponentView'});

	return MenuComponentView;

});