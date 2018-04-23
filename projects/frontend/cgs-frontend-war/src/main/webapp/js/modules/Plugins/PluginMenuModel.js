define(['Class', 'repo', 'events', 'types'], function (Class, repo, events, types) {
	function getMenuTemplate(data) {
		if (!_.isArray(data)) {
			data = [data];
		}

		_.each(data, function(menuItem) {
			if (menuItem.event) {
				setMenuItemEvent(menuItem);
			}

			if (menuItem.subMenuItems && menuItem.subMenuItems.length) {
				_.each(menuItem.subMenuItems, function (item) {
					if (item.event) {
						setMenuItemEvent(item);
					}

					if (item.subMenuItems && item.subMenuItems.length) {
						return getMenuTemplate(item);
					}
				})
			}
		});

		return data;
	};

	function setMenuItemEvent(item) {
		var eventId = "Plugin_Event_" + repo.genId();

		events.register(eventId, item.event);

		item.event = eventId;
	};

	function registerMenuEvents() {
		events.bind('setMenuButtonState', function (itemId, state, params) {
			if (~MENU_BUTTON_STATES.indexOf(state)) {
				_.each(this.onMenuItemsChangedCallbacks, function (callback) {
					callback.call({
						itemId: itemId,
						state: state,
						data: params
					});
				});
			}
		}, this);
	}

	var MENU_BUTTON_STATES = ['disable', 'enable'];

	var PluginMenuModel = Class.extend({
		initialize: function () {
			this.activeScreen = require('router').activeScreen;
			this.menu = this.activeScreen.components.menu; 
			this.onMenuItemsChangedCallbacks = [];

			registerMenuEvents.call(this);
		},
		loadMenu: function (data) {
			var menuInitFocusId = _.isArray(data) ? data[0].menuInitFocusId : data.menuInitFocusId;
			this.menu.setItems(getMenuTemplate(data) || {}, true, menuInitFocusId || '');
		},
		setMenuItemState: function (data) {
			if (!data || !_.isObject(data)) {
				throw new TypeError('setMenuItemState: data is invalid');
			}

			if (!data.state || !~MENU_BUTTON_STATES.indexOf(data.state)) {
				throw new TypeError("setMenuItemState: no valid state pass to setMenuItemState");
			}

			if (!data.id) {
				throw new TypeError("setMenuItemState: No valid menu item is passed");
			}

			events.fire('setMenuButtonState', data.id, data.state );
		},
		onMenuItemStateChanged: function (callback) {
			if (!callback || !_.isFunction(callback)) {
				throw new TypeError('onMenuItemStateChanged: Expected function');
			}

			this.onMenuItemsChangedCallbacks.push(callback);
		},
		getTasksMenu: function(addTaskCallback) {
			var tasks = _.chain(types)
						.map(function(v, k) {
							if (v.selectTaskType || k == 'header') {
								return {
									id: k,
									name: '((' + (v.fullName == 'Applet Task' ? 'Applet' : v.fullName) + '))',
									order: v.order
								}
							}
						})
						.compact()
						.sortBy('order')
						.value();
			return {
				'label' : '((Create Tasks))',
				'id':'menu-button-tasks',
				'type':'button',
				'icon':'',
				'canBeDisabled':false,
				'subMenuItems': [
					{
						'id':'menu-button-cgs-task-group', // id in DOM
						'icon':'text-height',
						'type': 'btn-group-title',
						'label' : '((Tasks))',
						'canBeDisabled':true,
						'subMenuItems': _.map(tasks, function(task) {
							return {
								'id':'menu-button-' + task.id, // id in DOM
								'icon':'text-height',
								'label' : task.name,
								'event': addTaskCallback.bind(this, task.id),
								'canBeDisabled':true,
								"subMenuItems" : []
							}
						}, this)
					}
				]
			}
		}
	});

	return PluginMenuModel;
})