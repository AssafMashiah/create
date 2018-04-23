define({
    cgsHints : [
        {
            "selector" : "#button_lock" ,
            "parentScroll" : "" ,
            'displayInEditMode':true,
            "text" : "coach_marks.lesson_screen.unlock_btn.assessment" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        }
    ],
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
                        'label': '((Assessment))',
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
                                        'id': 'menu-button-delete-xxx',
                                        'type': 'btn-group',
                                        'icon': 'trash',
                                        'label': '((Delete))',
                                        'event': 'menu_lesson_item_delete',
                                        'shortcut': {
                                            'keys': 'delete',
                                            'focus': 'tree'
                                        },
                                        'canBeDisabled': true
                                    }

                                ]
                            },
                            {
	                            'id': 'menu-group-lesson-activities',
                                'label': '((Lesson Activities))',
                                'type': 'btn-group-title',
                                'subMenuItems': [
                                    {

                                        'id': 'menu-button-new-sequence',
                                        'icon':'download-alt',
                                        'label':'((course.levels.sequence))',
                                        'event': 'new_lesson_item',
                                        'args': {"type": "sequence", "data": {"type": "simple", "exposure": "all_exposed"}},
                                        'shortcut': {
                                            'keys': 'ctrl + i'
                                        },
                                        'stopPropagation': true,
                                        'canBeDisabled': true
                                    }
                                ]
                            },
	                        {
		                        'id': 'sequence-insert-menu',
		                        'label': '((Insert))',
		                        'type': 'btn-group-title',
		                        'subMenuItems': [
			                        {
				                        'id': 'menu-button-new-header',
				                        'icon': 'plus-sign',
				                        'label': '((Header))',
				                        'event': 'createNewItem',
				                        'args': {
					                        "templatePath": "modules/HeaderEditor/HeaderEditor",
					                        "type": "header",
					                        "insertAt": 0,
					                        "insertOnce": true
				                        },
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-questionOnly',
				                        'icon': 'plus-sign',
				                        'label': '((Question Only))',
				                        'event': 'createNewItem',
				                        'args': {"templatePath": "modules/QuestionOnlyEditor/QuestionOnlyEditor"},
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-MC',
				                        'icon': 'plus-sign',
				                        'label': '((MC))', /*Multiple Choice*/
				                        'event': 'createNewItem',
				                        'args': {
					                        "templatePath": "modules/MCEditor/MCEditor",
					                        "type": "lessonModeAssessment"
				                        },
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-freeWriting',
				                        'icon': 'plus-sign',
				                        'label': '((Free Writing))', /*Open Question*/
				                        'event': 'createNewItem',
				                        'args': {
					                        "templatePath": "modules/FreeWritingEditor/FreeWritingEditor",
					                        "type": "lessonModeAssessment"
				                        },
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-shortAnswer',
				                        'icon': 'plus-sign',
				                        'label': '((Short Answer))', /*short answer*/
				                        'event': 'createNewItem',
				                        'args': {
					                        "templatePath": "modules/ShortAnswerEditor/ShortAnswerEditor",
					                        "type": "lessonModeAssessment"
				                        },
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-applet-task',
				                        'icon': 'plus-sign',
				                        'label': '((Applet))',
				                        'event': 'createNewItem',
				                        'args': {"templatePath": "modules/AppletTaskEditor/AppletTaskEditor"},
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-cloze',
				                        'icon': 'plus-sign',
				                        'label': '((Fill in the Gaps))',
				                        'event': 'createNewItem',
				                        'args': {"templatePath": "modules/ClozeEditor/ClozeEditor", "type": "cloze"},
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-matching',
				                        'icon': 'plus-sign',
				                        'label': '((Matching))',
				                        'event': 'createNewItem',
				                        'args': {"templatePath": "modules/MTQEditor/MTQEditor", "type": "matching"},
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-sorting',
				                        'icon': 'plus-sign',
				                        'label': '((Sorting))',
				                        'event': 'createNewItem',
				                        'args': {"templatePath": "modules/MTQEditor/MTQEditor", "type": "sorting"},
				                        'canBeDisabled': true
			                        },
			                        {
				                        'id': 'menu-button-new-sequencing',
				                        'icon': 'plus-sign',
				                        'label': '((Sequencing))',
				                        'event': 'createNewItem',
				                        'args': {"templatePath": "modules/MTQEditor/MTQEditor", "type": "sequencing"},
				                        'canBeDisabled': true
			                        }
		                        ]
	                        },

	                        {
		                        'label': '((Arrangement))',
		                        'type': 'btn-group',
		                        'subMenuItems': [
			                        {
				                        'id': 'menu-button-compare',
				                        'icon': 'beaker',
				                        'label': '((Compare))',
				                        'event': 'compare_items',
				                        'canBeDisabled': true
			                        }
		                        ]
	                        },
	                        {
		                        'label' : '((Comments))',
		                        'type':'btn-group',
		                        'subMenuItems':[
			                        {
				                        'id': 'menu-button-add-comment',
				                        'icon': 'th-list',
				                        'label' : '((add comment))',
				                        'event': 'addComment',
				                        'canBeDisabled' : true
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
                                'label' : '((TTS))',
                                'type': 'btn-group',
	                            'showFlag': 'enableTextToSpeach',
                                'subMenuItems':[
                                    {
                                        'id': 'menu-button-tts',
                                        'icon': 'TTS',
                                        'label' : '((TTS))',
                                        'event' : 'tts_report',
                                        'canBeDisabled' : true
                                    }
                                ]
                            }
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
                                        'id':'menu-button-lesson-comments',
                                        'icon':'note',
                                        'label':'((Comments))',
                                        'event':'lesson_comments',                                  
                                        'canBeDisabled' : false
                                    }
                                ]
                            }
                        ]
                    }
                ]}
        },
        tree: {
            modName: 'TreeComponent',
            config: {
                startType: 'lesson',
                endType: ['task', 'help']

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
});