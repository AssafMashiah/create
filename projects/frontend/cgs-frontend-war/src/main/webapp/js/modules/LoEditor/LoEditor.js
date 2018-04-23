define(['BaseContentEditor', 'repo', 'events', './config', 'teacherGuideComponentView', './LoEditorView', './LoStageView', 'validate', 'userModel','localeModel', 'lessonModel'],
function(BaseContentEditor, repo, events, config, teacherGuideComponentView, LoEditorView, LoStageView, validate, user,localeModel, lessonModel) {

	var LoEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);

            // get Lo Types from server - by using the user account settings
            this.pedagogicalLoTypeCollection = localeModel.getConfig('loTypes');

			this.view = new LoEditorView({controller: this});
			this.stage_view = new LoStageView({controller: this});

			this.registerEvents();

			require('publishModel').getLessonPublishedUrl(repo._courseId, lessonModel.getLessonId())
				.then(function() {
					events.fire('enable_menu_item', 'menu-button-share-a-link-lesson');
				}, function() {
					events.fire('disable_menu_item', 'menu-button-share-a-link-lesson');
				});
		},

		startPropsEditing: function() {
            // prevent super start editing
        },

		registerEvents: function() {

			this.bindEvents(
				{
					'new_lesson_item':{'type':'register', 'func':function(args){
							var parent = this.config.id;
							if(args.type =="lo"){
								parent = this.record.parent;
							}
							var itemConfig= _.extend({parentId: parent}, args);

	                        events.fire('createLessonItem', itemConfig);

						} , 'ctx':this, 'unbind':'dispose'},

					'new_differentiated_sequence': {
						'type': 'register', 'func': function () {
							events.fire('createDifferentiatedSequence', this.config.id, this);
						}, 'ctx': this, 'unbind': 'dispose'
					},
					'new_separator': {
						'type': 'register', 'func': function (args) {
							var itemConfig = _.extend({parentId: this.config.id}, args);
							events.fire('createSeparator', itemConfig);
						}, 'ctx': this, 'unbind': 'dispose'
					},
					'menu_lesson_item_delete': {
						'type': 'register', 'func': function () {
							events.fire('delete_lesson_item', this.config.id);
						}, 'ctx': this, 'unbind': 'dispose'
					},
					'menu_page_item_delete': {
						'type': 'register', 'func': function () {
							this.deleteItemAndUpdateEbooks(this.config.id);
						}, 'ctx': this, 'unbind': 'dispose'
					}

				});

			var changes = {
				title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
				pedagogicalLoType: this.propagateChanges(this.record, 'pedagogicalLoType', true),
				modality: this.propagateChanges(this.record, 'modality', true),
				typicalLearningTime: this.propagateChanges(this.record, 'typicalLearningTime', validate.integer3Digits, true),
				teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.model.on('change:title', function f892() {
				if (!this.record.data.title) {
					repo.startTransaction({ appendToPrevious: true });
					repo.updateProperty(this.record.id, 'title', ' ');
					repo.endTransaction();
					events.fire('load', this.record.id);
				} 
				this.stage_view.render.call(this.stage_view);
			}, this);

			this.model.on('change:keywords', function(child, val) {
				repo.startTransaction({ appendToPrevious: true });
				this.createArrayAndSaveToRepo(val, 'keywords');
				repo.endTransaction();
			}, this);
		} 

	}, {type: 'LoEditor'});

	return LoEditor;

});
