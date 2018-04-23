define(['BasePropertiesView', 'text!modules/PageEditor/templates/PageProps.html', './BlankPageProps', 'events', 'lodash',
		'FileUpload', 'assets', 'dialogs', 'repo'],
function(BasePropertiesView, template, BlankPageProps, events, _, FileUpload, assets, dialogs, repo) {

	var PagePropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.pageData = options.controller.record.data.virtualData;
			this.initTemplate();
			this._super(options);
		},

		initTemplate: function() {
			this.template = template;
		},

		render: function() {
			this._super();
			if (!_.isEmpty(this.pageData)) {
				this.renderReactElement();
				this.fileUpload = new FileUpload({
					activator: '#blank-page-upload-image',
					options: FileUpload.params['image'],
					callback: this.onImageFileUpload.bind(this),
					context: this.controller,
					recordId: this.controller.record.id,
					srcAttr: 'virtualData.background-image',
					enableAssetManager: false,
					enableEdit: true,
					enableDelete: true,
					deleteButton: "button.delete"
				});
			}
		},

		renderReactElement: function() {
			var thi$ = this;
			BlankPageProps.render({
				pageData: require("cgsUtil").cloneObject(this.pageData),
				onPageDataChange: function(newPageData) {
					Object.keys(newPageData).map(function(key) {
						repo.updatePropertyObject(thi$.controller.record.id, 'virtualData', key, newPageData[key]);
					});
					thi$.pageData = newPageData;
					events.fire('repo_changed');
					thi$.renderReactElement();
					// createPlayer method should get reduced to just render the player
					thi$.controller.createPlayer();
				}
			});
		},

		onImageFileUpload: function(response) {
			amplitude.logEvent('Change background image', {
                "Course ID" : repo._courseId,
				"Lesson ID":  require("lessonModel").getLessonId()
			});
			if (response) {
				this.pageData['background-image'] = response;
				
			} else {
				this.pageData['background-image'] = false;
			}
			// createPlayer method should get reduced to just render the player
			this.controller.createPlayer();
			this.renderReactElement();
			events.fire('repo_changed');
		}

	}, {type: 'PagePropsView'});

	return PagePropsView;

});
