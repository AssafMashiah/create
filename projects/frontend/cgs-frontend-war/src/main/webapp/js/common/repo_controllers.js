define(['lodash', 'jquery'],
function(_, $) {

	function RepoControllers() {
		this._data = {};
	}

	RepoControllers.prototype = {

		set: function(controllerObject) {
			if (controllerObject instanceof Array) {
				_.each(controllerObject, this.set, this);
				return;
			}

			this._data[controllerObject.record.id] = controllerObject;

			return controllerObject.record.id;
		},

		update: function(controllerObject) {
			if (controllerObject instanceof Array) {
				_.each(controllerObject, this.update, this);
				return;
			}

			return this.set(controllerObject, true);
		},

		remove: function(id) {
			delete this._data[id];
		},

		get: function(id) {
			return this._data[id];
		},

		clear: function() {
			this._data = {};
		},

		isEmpty: function() {
			return _.size(this._data) === 0;
		}

	}

	return new RepoControllers();

});