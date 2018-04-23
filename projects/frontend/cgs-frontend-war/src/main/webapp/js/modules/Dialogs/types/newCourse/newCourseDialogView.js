define(['moment', 'events', 'modules/Dialogs/BaseDialogView',
		'text!modules/Dialogs/types/newCourse/newCourseDialog.html'],
	function(moment,  events,  BaseDialogView, template) {

		var newCourseDialogView = BaseDialogView.extend({

			tagName : 'div',
			className : 'css-dialog-newcourse',
			events: {
				'click #newCourseBtn': function (e) {
					e.preventDefault();
					this.newCourse();
				},
				'change #contentLocales': function (e) {
					e.preventDefault();
					e.currentTarget.classList[e.currentTarget.selectedIndex ? 'add' : 'remove']('has-value');
					this.validate();
				},
				'click #contentLocales': function (e) {
					e.currentTarget.classList.add('has-value');
				},
				'input #newCourseName': function (e) {
					e.preventDefault();
					this.validate();
				}
			},

			initialize: function(options) {
				this.options = options;
				this.customTemplate = template;
				this._super(options);
			},

			getFieldsValues: function () {
				this.contentLocales = this.$contentLocales.val() || '';
				this.newCourseName = this.$el.find('#newCourseName').val() || '';
			},

			validate: function() {
				this.getFieldsValues();

				//set input direction according to content locale
				if(["iw_IL", "ar_IL"].indexOf(this.contentLocales) >= 0) {
					this.$newCourseName.removeClass('ltr').addClass('rtl');
				} else {
					this.$newCourseName.removeClass('rtl').addClass('ltr');
				}

				this.$el.find('#newCourseBtn').attr('disabled',
					!(this.contentLocales.length && this.newCourseName.length));
			},

			newCourse: function() {
				this.getFieldsValues();

				require('courseModel').createNewCourse({
					'courseName': this.newCourseName,
					'contentLocales': this.contentLocales
				});

				events.fire('terminateDialog', 'newCourseAdded');
			},

			render: function( $parent ) {
				this.locales = require('userModel').account.contentLocales.options;
				this.selectedLocale = require('userModel').account.contentLocales.selected;

				this._super($parent, this.customTemplate);

				this.$contentLocales = this.$el.find('#contentLocales');
				this.$newCourseName = this.$el.find("#newCourseName");

				var newName = require("translate").tran("New Course") + ' ' + moment().format('MMM DD, YYYY');
				this.$newCourseName.attr('placeholder', newName);
				this.$newCourseName.attr('value', newName);
				this.$contentLocales.val(this.selectedLocale);

				if (this.selectedLocale) {
					this.$contentLocales.addClass('has-value');
				}

				this.validate();
			}

		}, {type: 'newCourseDialogView'});

		return newCourseDialogView;

	});