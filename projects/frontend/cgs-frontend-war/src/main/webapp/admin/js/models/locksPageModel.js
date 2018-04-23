define([
  'jquery',  
  'underscore',
  'backbone',
  'bootstrap',
  'models/pageModel',
  'models/lockModel',
  'services/locksService',
  'utils/dialogManager'
], function ($, _, Backbone, Bootstrap, PageModel, LockModel, LocksService, DialogManager) {

	var LocksPageModel = PageModel.extend({
		initialize : function (name , route) {
			//call super
			LocksPageModel.__super__.initialize.call(this, name, route);

	   		this.set( {
	    		"sortBy": null,
	    		"isAscending": true
	    	}, {silent: true});
	    },

		setLocks : function (locks) {
			var i;
			var newLocks = [];

			for (i = 0; i < locks.length; i++) {
				var lock = new LockModel(locks[i]);
				newLocks.push(lock);
			}

			this.set({"locks" : newLocks});
			this.notifyUpdate(LocksPageModel.LOCKS_UPDATED);
		},

		sortBy : function (fieldName, isAscending) {
			this.set({"sortBy" : fieldName, "isAscending": isAscending});
			this.notifyUpdate(LocksPageModel.LOCKS_UPDATED);
		},

		clearSort : function () {
			this.set({"sortBy" : null});
			this.notifyUpdate(LocksPageModel.LOCKS_UPDATED);
		},

		getSortBy : function () {
			return this.get("sortBy");
		},

		isAscending : function () {
			return this.get("isAscending");
		},

		getLocks : function () {
			var sortedLocks = this.get("locks").slice();
			var _this = this;

			if(_this.getSortBy() !== null){
				sortedLocks.sort(function(a,b){
					var aValue = a.attributes[_this.getSortBy()];
					var bValue = b.attributes[_this.getSortBy()];

					if(aValue === null && bValue === null) { return 0; }
					if(aValue === null) { return -1; }
					if(bValue === null) { return 1; }
					if(aValue === bValue) { return 0; }
					if(aValue > bValue) { return 1; }
					if(aValue < bValue) { return -1; }
				});

				if(!_this.isAscending()){
					sortedLocks.reverse();
				}
			}

			return sortedLocks;
		},

		removeLock : function (entityType, entityId) {
			var i;
			for (i = 0; i < this.get("locks").length; i++) {
				if(this.get("locks")[i].getEntityType() === entityType &&
				   this.get("locks")[i].getEntityId() === entityId)
				{

					this.get("locks").splice(i,1);
					return;
				}
			}
		},

		releaseLock : function (entityType, entityId) {
			var _this = this;

			//TODO - move locks service to the controller
			LocksService.releaseLockById(entityType, entityId, function (data, returnType){

				console.log("release lock returned:" + returnType);

				if(returnType === "success"){
					_this.removeLock(entityType, entityId);
					_this.notifyUpdate(LocksPageModel.LOCKS_UPDATED);
				} else {

					//TODO - move dilog to the controller
					DialogManager.showErrorDialog("Failed releasing lock");
					_this.refreshLocks();
				}

			});	
		},

		activate : function () {
			this.refreshLocks();
		},

		refreshLocks : function () {
			var _this = this;

			//TODO - move locks service to the controller
			LocksService.getLocks(function (data, returnType) {
				if(returnType === "success"){
					var locks = data;
					_this.setLocks(locks);
				} else {
					//TODO - move dilog to the controller
					DialogManager.showErrorDialog("Failed getting locks");
				}

			});

		}


	});

	LocksPageModel.LOCKS_UPDATED = "locksUpdated";

	return LocksPageModel;
});
