define(['repo'], function (repo) {
	var updatedConfig = null;
	var publishToUrlButton = { subMenuItems: [] };

	if (AuthenticationData.account.publishSettings.lessons.enablePublishToUrl) {
		publishToUrlButton = {
			'label': '((lesson.toolbar.Share.a.link))',
			'type': 'btn-group',
			'subMenuItems': [{
				'id': 'menu-button-share-a-link-lesson',
				'icon': 'ebook-share-link',
				'label': '((lesson.toolbar.Share.a.link.tooltip))',
				'event': 'share_a_link',
				'args': {'type': 'lesson'},
				'canBeDisabled': true,
				'default_display': 'disabled'
			}]
		};
	}


	var pageConfig = {
		'id': 'menu-group-insert-overlay',
		'label': '((Insert))',
		'type': 'btn_split',
		'subMenuItems': [
			{
				'id': 'menu-button-new-image', // id in DOM
				'icon': 'overlay-image',
				'label': '((Image))',
				'event': 'add_overlay',
				'args': {"type": "image", "show": 'upload'},
				'shortcut': {
					'keys': 'ctrl + 1'
				},
				'canBeDisabled': true
			},
			{
				'id': 'menu-button-new-audio-player',
				'icon': 'overlay-audio',
				'label': '((Audio))',
				'event': 'add_overlay',
				'args': {"type": "audio", "show": 'upload'},
				'shortcut': {
					'keys': 'ctrl + 2'
				},
				'canBeDisabled': true
			},
			{
				'id': 'menu-button-new-video',
				'icon': 'overlay-video',
				'label': '((Movie))',
				'event': 'add_overlay',
				'args': {"type": "video", "show": 'all'},
				'shortcut': {
					'keys': 'ctrl + 3'
				},
				'canBeDisabled': true
			},
			{
				'id': 'menu-button-new-link',
				'icon': 'overlay-url',
				'label': '((Url))',
				'event': 'add_overlay',
				'args': {"type": "url", "show": 'url'},
				'shortcut': {
					'keys': 'ctrl + 4'
				},
				'canBeDisabled': true
			},
			{
				'id': 'menu-button-new-t2k',
				'label': '((page.menuItem.interaction))',
				'canBeDisabled': true,
				'dropDownItems': [
					{
						'id': 'menu-button-new-applet-task',
						'label': '((menuButton.applet))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/AppletTaskEditor/AppletTaskEditor"
						}
					},
					{
						'id': 'menu-button-new-fillInTheGaps-task',
						'label': '((menuButton.fillInTheGaps))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/ClozeEditor/ClozeEditor",
							"type": "cloze"
						}
					},
					{
						'id': 'menu-button-new-FreeWriting-task',
						'label': '((menuButton.freeWriting))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/FreeWritingEditor/FreeWritingEditor",
							"type": "lessonModeNormal"
						}
					},
					{
						'id': 'menu-button-new-matching-task',
						'label': '((menuButton.matching))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/MTQEditor/MTQEditor",
							"type": "matching"
						}
					},
					{
						'id': 'menu-button-new-multipleChoice-task',
						'label': '((menuButton.multipleChoice))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/MCEditor/MCEditor",
							"type": "lessonModeNormal"
						}
					},
					{
						'id': 'menu-button-new-sequencing-task',
						'label': '((menuButton.sequencing))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/MTQEditor/MTQEditor",
							"type": "sequencing"
						}
					},
					{
						'id': 'menu-button-new-shortAnswer-task',
						'label': '((menuButton.shortAnswer))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/ShortAnswerEditor/ShortAnswerEditor",
							"type": "lessonModeNormal"
						}
					},
					{
						'id': 'menu-button-new-sorting-task',
						'label': '((menuButton.sorting))',
						'event': 'new_t2k_interaction',
						'canBeDisabled': true,
						'args': {
							"taskTemplatePath": "modules/MTQEditor/MTQEditor",
							"type": "sorting"
						}
					}
				]
			}
		]
	};

	function getConfig() {
		if (updatedConfig) {
			return updatedConfig;
		}

		var loMenuItem = {
			subMenuItems: []
		};
		if (repo.get(repo._courseId).data.includeLo) {
			loMenuItem = {
				'label': '((lesson.toolbar_section.lesson_activities))',
				'type': 'btn-group-title',
				'id': 'menu-lesson-activities-group',
				'subMenuItems': [{
					'id': 'menu-button-new-lo', // id in DOM
					'icon': 'ok-sign2',
					'label': '((menu.button.add.lo))',
					'event': 'new_lesson_item',
					'args': {"type": "lo"},
					'canBeDisabled': true
				}]
			};
		}

		return {
			cgsHints: [{
				"selector": "#button_lock",
				"parentScroll": "",
				'displayInEditMode': true,
				"text": "coach_marks.lesson_screen.unlock_btn.lesson",
				"position": {
					verticalAlign: "bottom",
					horizontalAlign: "middle-left"
				}
			}],
			components: {
				menu: {
					modName: 'MenuComponent',
					config: {
						menuInitFocusId: 'menu-button-course',
						menuItems: [
							{
								'label': '((menuButton.back.course))',
								'id': 'menu-button-back',
								'type': 'button',
								'icon': 'chevron-left',
								'canBeDisabled': false,
								'event': 'backToPreviousScreen'
							},
							{
								'label': '((Lesson Screen))',
								'id': 'menu-button-course',
								'type': 'button',
								'icon': '',
								'canBeDisabled': false,
								'subMenuItems': [
									{
										'id': 'menu-group-file',
										'label': '((File))',
										'type': 'btn-group',
										'subMenuItems': [
											{
												'id': 'menu-button-save-lesson',
												'icon': 'folder-close',
												'label': '((Save))',
												'shortcut': {
													'keys': 'ctrl + s'
												},
												'event': 'lesson_save',
												'canBeDisabled': true
											}, {
												'id': 'menu-button-publish-lesson',
												'icon': 'globe',
												'label': '((Publish))',
												'event': 'publishLesson',
												'canBeDisabled': false
											}
										]
									},
									{
										'id': 'menu-group-clipboard',										
										'label': '((Clipboard))',
										'type': 'btn-group',
										'subMenuItems': [
											{
												'id': 'menu-button-cut',
												'icon': 'cut',
												'label': '((Cut))',
												'event': 'cut_item',
												'shortcut': {
													'keys': 'ctrl + x',
													'disableOnInput': true
												},
												'canBeDisabled': true
											},
											{
												'id': 'menu-button-copy',
												'icon': 'copy',
												'label': '((Copy))',
												'event': 'copy_item',
												'shortcut': {
													'keys': 'ctrl + c',
													'disableOnInput': true
												},
												'canBeDisabled': true
											},
											{
												'id': 'menu-button-paste',
												'icon': 'paste',
												'label': '((Paste))',
												'event': 'paste_item',
												'shortcut': {
													'keys': 'ctrl + v',
													'disableOnInput': true
												},
												'canBeDisabled': true
											},
											{
												'id': 'menu-button-undo',
												'icon': 'undo',
												'label': '((Undo))',
												'event': 'undo_action',
												'canBeDisabled': true,
												'shortcut': {
													'keys': 'ctrl + z',
													'disableOnInput': true
												}
											},
											{
												'id': 'menu-button-redo',
												'icon': 'circle-arrow-down',
												'label': '((Redo))',
												'event': 'redo_action',
												'canBeDisabled': true,
												'shortcut': {
													'keys': 'ctrl + y',
													'disableOnInput': true
												}
											},
											{
												'id': 'menu-button-delete-element',
												'type': 'btn-group',
												'icon': 'trash',
												'label': '((Delete))',
												'event': 'menu_page_item_delete',
												'shortcut': {
													'keys': 'delete',
													'focus': 'tree'
												},
												'canBeDisabled': true
											}

										]
									},
									loMenuItem,
									{
										'label': '((Pages))',
										'type': 'btn-group',
										'id': 'menu-lesson-pages',
										'subMenuItems': [
											{
												'id': 'menu-button-new-blank-page',
												'icon': 'home',
												'label': '((ebook.lesson.menu.newPage.blank))',
												'canBeDisabled': true,
												"event": "create_blank_page"
											},
											{
												'id': 'menu-button-upload-page',
												'icon': 'uploadEbook',
												'label': '((ebook.lesson.menu.newPage.upload))',
												'event': 'upload_ebook',
												'canBeDisabled': true
											}
										]
									},
									pageConfig,
									{
										'label': '((Comments))',
										'type': 'btn-group',
										'subMenuItems': [
											{
												'id': 'menu-button-add-comment',
												'icon': 'th-list',
												'label': '((Add))',
												'event': 'addComment',
												'canBeDisabled': true
											}
										]
									},
									{
										'label': '((subMenu.btnGroups.references))',
										'type': 'button_dropdown',
										'showFlag': 'enableReferences',
										'subMenuItems': [
											{
												'id': 'menu-button-references-course',
												'icon': 'envelope',
												'label': '((References))',
												'event': 'references_course',
												'canBeDisabled': true
											}
										]
									},
									{
										'label': '((TTS))',
										'type': 'btn-group',
										'showFlag': 'enableTextToSpeach',
										'subMenuItems': [
											{
												'id': 'menu-button-tts',
												'icon': 'TTS',
												'label': '((TTS))',
												'event': 'tts_report',
												'canBeDisabled': true
											}
										]
									},
									publishToUrlButton
								]
							},
							{
								'label': '((Review))',
								'id': 'menu-button-review',
								'type': 'button',
								'showFlag': 'enableReviewTab',
								'icon': '',
								'subMenuItems': [
									{
										'label': '((Reports))',
										'type': 'btn-group-title',
										'subMenuItems': [
											{
												'id': 'menu-button-lesson-assets',
												'icon': 'assets',
												'showFlag': 'enableAssetOrdering',
												'label': '((Orders))',
												'event': 'lesson_assets',
												'canBeDisabled': false
											},
											{
												'id': 'menu-button-lesson-narrations',
												'icon': 'narrations',
												'label': '((Narrations))',
												'event': 'lesson_narrations',
												'canBeDisabled': false
											},
											{
												'id': 'menu-button-lesson-comments',
												'icon': 'note',
												'label': '((Comments))',
												'event': 'lesson_comments',
												'canBeDisabled': false
											}
										]
									}
								]
							}
						]
					}
				},
				tree: {
					modName: 'TreeComponent',
					config: {
						startType: 'lesson',
						endType: ['task', 'help', 'overlay']

					}
				},
				props: {
					modName: 'PropsComponent'
				},
				navbar: {
					modName: 'NavBarComponent'
				},
				stage: {
					modName: 'StageComponent'
				}
			}
		};
	}

	return {
		get: function () {
			return getConfig();
		},

		set: function (newConfig) {
			updatedConfig = newConfig;
		}
	};

});