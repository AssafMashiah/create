define(['lodash', 'BaseController', './MenuComponentView', 'events', './config', './constants'],
function(_, BaseController, MenuComponentView, events, config, constants) {

	var MenuComponent = BaseController.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);
			this.constants = constants;

			// default menu items configuration
			this.defaultMenuItems = this.config.menuItems;

			this.view = new MenuComponentView({controller: this});

			// set default items
			this.setItems({}, true);
			
			this.registerEvents();
			console.log('MenuComponent initialized');
		},

		registerEvents: function() {
			this.bindEvents({
				'disable_menu_item':{'type':'register', 'func':this.view.disableMenuItem, 'ctx':this, 'unbind':'dispose'},
				'enable_menu_item':{'type':'register', 'func':this.view.enableMenuItem, 'ctx':this, 'unbind':'dispose'}
			});
		},

		dispose: function() {
			this.view.dispose();
			this._super();
			delete this;
			console.log('MenuComponent is disposed of');
		},

		refreshMenu: function() {
			this.setItems(this.extendedConfig, false, this.menuInitFocusId);
		},

		setItems: function(itemsConfig, appendToDefault, menuInitFocusId) {
			var extendedConfig = itemsConfig;

			if (appendToDefault) {
				extendedConfig = itemsConfig.length ? _.union(this.defaultMenuItems, itemsConfig) : this.defaultMenuItems;
			}

			this.extendedConfig = extendedConfig;
			this.menuInitFocusId = menuInitFocusId;

			//check shown menu width according to view port
			var resultJson = this.checkMenuWidth($.extend(true, {}, extendedConfig), menuInitFocusId);

			//if config has been changed - render it with new configuration
			if(_.isEqual(resultJson.newConfig, extendedConfig) == false) {
				this.view.setItems(resultJson.newConfig, menuInitFocusId);
			}
		},

		checkMenuWidth: function(extendedConfig, menuInitFocusId) {
			var shownMenuConfig, self = this;
			//find config of current shown menu
			if(!!menuInitFocusId) {
				shownMenuConfig = _.where(extendedConfig, {id: menuInitFocusId})[0];
			} else {
				//first menu config if there is no focus id passed by configuration
				shownMenuConfig = extendedConfig[0];
			}

			if(shownMenuConfig) {

				var viewPortWidth = this.view.getMenuViewPortWidth();
				var rsWidth = viewPortWidth - this.constants.marginFactor;  //view port width minus margin factor
				var menuWidth = 0;

				//num of sub menus multiplied by menu dom width
				var subMenusWidthArray = _.map(shownMenuConfig.subMenuItems, function (element, index, list) {
					return {
						'subMenuIndex':index, 
						'subMenuLength':element.subMenuItems && element.subMenuItems.length || 0,
						'elementWidth': element.type === 'btn-group-scroll' ? 
						    			self.constants.menuScrollItemWidth :
						    			(element.subMenuItems && element.subMenuItems.length || 0) * self.constants.menuItemWidth
					};
				});

				//sum of sub-menus width
				menuWidth = calcMenuWidth(subMenusWidthArray);

				var widthDiff = rsWidth - menuWidth, tmpElem, numOfMenusToCollapse = 0;
				while((widthDiff < 0) && (numOfMenusToCollapse <= subMenusWidthArray.length)) { //View Port smaller than optimum width
					//If the collapse of 1 group is not enough the next group will collapse and so forth
					numOfMenusToCollapse +=1;
					//First buttons group from right to left that contains more than 1 button is collapsed into a drop-down named by the group name
					tmpElem = _.last(_.filter(subMenusWidthArray, function(item){ return item.subMenuLength > 1; }), numOfMenusToCollapse);

					//update subMenuWidth according to collapsed width
					for(var item in tmpElem) {
						tmpElem[item].elementWidth = this.constants.menuItemWidth;
					}

					//calc new menu width
					menuWidth = calcMenuWidth(subMenusWidthArray);
					widthDiff = rsWidth - menuWidth;
				}

				if(numOfMenusToCollapse > 0) {
					_.each(tmpElem, function(element, index, list){
						buildNewConfig(shownMenuConfig, element.subMenuIndex);
					});
				}

			}

			function calcMenuWidth(subMenusWidthArray) {
				var menuWidth = 0;
				_.each(subMenusWidthArray, function(element, index, list){
					menuWidth += element.elementWidth;
				});
				return menuWidth;
			}

			function buildNewConfig(shownMenuConfig, subMenuIndex) {
				var subMenuToCollapse = shownMenuConfig.subMenuItems[subMenuIndex];

				if(!!subMenuToCollapse ) {
					//build new config for collapsed group
					var dropDownItems = _.clone(subMenuToCollapse.subMenuItems);
					var newConfig = [
						{
							'id': subMenuToCollapse.id,
							'icon':'',
							'label':subMenuToCollapse.label,
							'notImplemented' : subMenuToCollapse.notImplemented,
							'canBeDisabled':true,
							'dontStealFocus':true,
							'dropDownItems':dropDownItems
						}
					];

					subMenuToCollapse.type = 'btn_dropdown';
					subMenuToCollapse.subMenuItems = newConfig;
				}

				return subMenuToCollapse;
			}

			return {'newConfig' : extendedConfig, 'numOfMenusToCollapse' : numOfMenusToCollapse} ;

		}

	}, {type: 'MenuComponent'});

	return MenuComponent;

});