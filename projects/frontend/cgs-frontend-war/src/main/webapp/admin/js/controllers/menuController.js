define([
  'jquery',  
  'underscore',
  'backbone',
  'views/menuView',
  'controllers/abstractController'
], function ($, _, Backbone,MenuView, AbstractController) {

	var MenuController = AbstractController.extend({

		initialize : function (siteModel, menuView) {


			this.siteModel = siteModel;
			this.menuView = menuView;

			menuView.on(MenuView.MENU_ITEM_CLIKED, this.handleItemClick, this); 

		},

		handleItemClick : function (menuItemIndex) {
			var index = parseInt(menuItemIndex);
			this.siteModel.setCurrentPageByIndex(index);
		}

	});

	return MenuController;
});
