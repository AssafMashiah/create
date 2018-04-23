define([
  'jquery',  
  'underscore',
  'backbone',
  'views/locksView',
  'controllers/abstractController',
  'utils/dialogManager'
], function ($, _, Backbone,LocksView, AbstractController, DialogManager) {

	var LocksController = AbstractController.extend({

		initialize : function (locksPageModel, locksView) {


			this.locksPageModel = locksPageModel;
			this.locksView = locksView;

			locksView.on(LocksView.RELEASE_LOCK_CLIKED, this.handleReleaseLock, this); 
			locksView.on(LocksView.SORT_COLUMN_CLIKED, this.handleSortColumn, this); 

		},

		handleReleaseLock : function (entityType, entityId) {

			var _this = this;
			DialogManager.showQuestionDialog("Question", "Are you sure you want to release the lock, you may destroy someones work! ", function () {
				_this.locksPageModel.releaseLock(entityType, entityId);
			});

		},

		handleSortColumn : function (columnName) {
			if(this.locksPageModel.getSortBy() === columnName) {
				this.locksPageModel.sortBy(columnName, !this.locksPageModel.isAscending());
			} else {
				this.locksPageModel.sortBy(columnName, true);					
			}
		}

	});

	return LocksController;
});
