define(['modules/Dialogs/BaseDialogView',
		'text!modules/Dialogs/types/publish/templates/PublishVariantsDialogView.html'],
	function (BaseDialogView, template) {

		var PublishVariantsDialogView = BaseDialogView.extend({

			tagName: 'div',
			className: 'css-dialog-prepublish',

			initialize: function (options) {
				this.options = options;
				this.initPublishMode();
				this.customTemplate = template;
				this._super(options);
			},

			initPublishMode: function () {
				var userModelAccount = require('userModel').getAccount();
				var publishSettings = userModelAccount.publishSettings;

				this.isPublishTypeLesson = this.options.config.publishType == "lesson";

				this.enabledCourseCatalog = this.options.config.publishType == "lesson" ? false : ( publishSettings.courses && publishSettings.courses.enablePublishToCatalog);
				this.enabledCourseFile = this.options.config.publishType == "lesson" ? false : (publishSettings.courses && publishSettings.courses.enablePublishToFile);
				this.enabledCourseURL = this.options.config.publishType == "lesson" ? false : (publishSettings.courses && publishSettings.courses.enablePublishToUrl);
				this.enabledLessonCatalog = publishSettings.lessons && publishSettings.lessons.enablePublishToCatalog;
				this.enabledLessonFile = publishSettings.lessons && publishSettings.lessons.enablePublishToFile;
				this.enabledLessonURL = publishSettings.lessons && publishSettings.lessons.enablePublishToUrl;

				var hasPublishToCourse = this.enabledCourseCatalog || this.enabledCourseFile || this.enabledCourseURL;
				var hasPublishToLesson = this.enabledLessonCatalog || this.enabledLessonFile || this.enabledLessonURL;

				this.displayPublishModeDropdown = hasPublishToCourse && hasPublishToLesson;
				this.noPublishMethods = !hasPublishToCourse && !hasPublishToLesson;
			},

			togglePublishTypesDisplay: function () {
				if (this.displayPublishModeDropdown) {
					this.publishLesson = $("#PublishMethodSelection").val() == 'lesson';

					if (this.publishLesson) {
						$(".publishModeRow.course").hide();
						$(".publishModeRow.lesson").show();
						//set default publish mode value
						$(".publishModeRow.lesson input[name='publishMode']").first().attr('checked', true);
					} else {
						$(".publishModeRow.course").show();
						$(".publishModeRow.lesson").hide();
						//set default publish mode value
						$(".publishModeRow.course input[name='publishMode']").first().attr('checked', true);
					}
				} else {
					//set default publish mode value
					$(".publishModeRow input[name='publishMode']").first().attr('checked', true);
				}
			},

			render: function ($parent) {
				this._super($parent, this.customTemplate, this);
				$parent.find('#PublishMethodSelection').on('change', this.togglePublishTypesDisplay.bind(this));
				this.togglePublishTypesDisplay();
			},

			setReturnValueCallback: {

				next: function () {

					return {
						"target": $("input[name=publishMode]:checked").val()
					};
				}
			},

			dispose: function () {
				this._super();
			}

		});

		return PublishVariantsDialogView;

	});