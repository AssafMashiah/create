define(['events'], function (events) {

	var _partialEdit = false;

	function EditMode() {
		this.readOnlyMode = true;
		this.registerEvents();
	}

	EditMode.prototype = {

		registerEvents:function () {

			events.register('readonly_mode', this.changeMode, this)

		},

		/**
		 * change readOnly / Edit global mode
		 */
		changeMode:function (isReadOnlyMode) {
			var router = require("router"), cgsModel = require('cgsModel');

			this.readOnlyMode = isReadOnlyMode;

			if(!!cgsModel.doLogOut) { //program is inside logout flow, don't reload screen
				return;
			}

			if (!!router.activeEditor) {
				router.load(router.activeEditor.config.id, router._static_data.tab, router._static_data.page);
			} else {
				router.navigate('', {trigger: true});  //load default route
			}
		},

		partialEdit: function(val) {
			function getPartialMode() {
				var _router = require("router"),
					_activeEditorType = _router._static_data.activeType;

				var _courseModel = require("courseModel"),
					_lessonModel = require("lessonModel");

				var _lessonId;


				function is_published(id) {
					return _courseModel.isElementPublished(id);
				};

				var _handlers = {
						"course": function () {	
							return _partialEdit;
						},
						"toc": function (record) {
							if (record && is_published(record.id)) {
								return true;
							}
						},
						"lesson": function (record) {
							if (record && is_published(record.id)) {
								return true;
							}
						}
					},
					exeptEditors = ['help'];

				if (_activeEditorType) {
					if (!_handlers[_activeEditorType]) {
						_lessonId = _lessonModel.getLessonId();

						if (_lessonId && is_published(_lessonId) && exeptEditors.indexOf(_activeEditorType) == -1) {
							return true;
						}
					} else {
						return _handlers[_activeEditorType].call(_router, _router.activeRecord);
					}
				} else {
					return _partialEdit;
				}
			}

			if(_.isUndefined(val)) {
				return getPartialMode();
			} else {
				_partialEdit = val;
			}
		}
	};

	return new EditMode();

});