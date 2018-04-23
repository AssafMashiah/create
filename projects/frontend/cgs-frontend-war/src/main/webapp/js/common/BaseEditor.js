define(['lodash', 'BaseController', 'events', 'repo', 'types', 'repo_controllers', 'userModel'],
	function (_, BaseController, events, repo, types, repo_controllers, userModel) {

		var BaseEditor = BaseController.extend({

			initialize: function (config, configOverrides) {
				this.featureFlags();

				this._super(config, configOverrides);

				this.record = repo.get(this.config.id);

				if (this.config.screen && this.config.id) {
					if (!this.config.previewMode) {
						this.screen = this.config.screen;
						this.screen.editor = this;
					}
				}
				else {
					throw new Error("Can't initialize editor without `screen` and `id`");
				}

				repo_controllers.set(this);

				if (!this.config.previewMode) {

					this.initMenu();

				}
			},
			featureFlags: function () {
				this.enableStandards = userModel.account.enableStandards;
				this.enableCourseMiscSettings = userModel.account.enableCourseMiscSettings;
				this.enableReferences = userModel.account.enableReferences;
				this.enableReviewTab = userModel.account.enableReviewTab;
				this.enableTextToSpeach = userModel.account.enableTextToSpeach;
				this.enableNarrationAdditionalLanguages = userModel.account.enableNarrationAdditionalLanguages;
				this.enableAssetOrdering = userModel.account.enableAssetOrdering;
				this.enableDiffLevels = userModel.account.enableDiffLevels;
				this.enableIndependentAssessment = userModel.account.enableIndependentAssessment;
				this.enablePlacementAssessment = userModel.account.enablePlacementAssessment;
			},
			commit: function (record, field, value, model) {
				if (value === '') {
					if (record.data[field]) {
						repo.deleteProperty(record.id, field);
					}
				} else {
					repo.updateProperty(record.id, field, value);
				}

				events.fire('&' + record.id, record.id);
			},

			propagateChanges: function (record, field, /* optional */ validator, verbose) {
				if (!record.data) {
					throw new Error('Bad record with no `data` attribute');
				}
				if (typeof validator === 'boolean' && typeof verbose === 'undefined') {
					verbose = validator;
					validator = null;
				}

				var _change_handler = function (record, field, validator) {
					return function _commit_(model, value) {
						if (typeof validator === 'function') {
							var options = {
								model: model,
								field: field,
								commit: this.commit.bind(this, record, field, value, model)
							};

							if (!validator(value, options)) {
								return false;
							}
						}

						this.commit(record, field, value, model);
					}
				}.call(this, record, field, validator);

				return _change_handler.bind(this);
			},

			dispose: function () {
				var child;

				//loop on children & dispose them
				_.each(this.record.children, function (childId) {
					child = repo_controllers.get(childId);
					if (child && child.dispose)
						child.dispose();
				});

				//dispose yourself
				this.stage_view && this.stage_view.dispose && this.stage_view.dispose();
				this.view && this.view.dispose && this.view.dispose();
				this.model && this.model.off && this.model.off();

				repo_controllers.remove(this.record.id);

				this.endEditing && this.endEditing();
				this._super();

				delete this.stage_view;
				delete this.model;
				if (this.stageViews) {
					delete this.stageViews.normal;
					delete this.stageViews.small
				}
				delete this.stageViews;
			},


			initMenu: function () {


				var previewButton = this.screen.view.$el.find("#btn_Preview .previewTitle");

				if (previewButton.length) {

					var label = require("translate").tran("Preview");

					previewButton
						.html(label);

				}

				if (!!this.config.menuItems && !!this.config.menuInitFocusId) {
					this.screen.components.menu.setItems(this.config.menuItems || {}, true, this.config.menuInitFocusId || '');
				}
			},

			partialEdit: function () {
				return require('editMode').partialEdit();
			}

		}, {type: 'BaseEditor'});

		return BaseEditor;

	});