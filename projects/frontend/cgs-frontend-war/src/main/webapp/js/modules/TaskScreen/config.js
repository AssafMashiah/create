define({
    cgsHints : [{
            "selector" : "#button_lock" ,
            'displayInEditMode':true,
            "parentScroll" : "" ,
            "text" : "coach_marks.task_screen.unlock_btn" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : "#navbar_base_sub_back" ,
            "parentScroll" : "" ,
            "text" : "coach_marks.task_screen.close_task" ,
            "position" : {
                verticalAlign : "top" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : ".element_preview_wrapper:nth-child(3) .textViewer_content" ,
            "parentScroll" : "" ,
            "text" : "coach_marks.task_screen.edit_item" ,
            "position" : {
                verticalAlign : "top" ,
                horizontalAlign : "left"
            }
        }
    ],
	components:{
		menu:{
			modName:'MenuComponent',
			config:{
				menuInitFocusId:'menu-button-task',
				menuItems: [
				{
					'label' : '((menuButton.back.lesson))',
					'id': 'menu-button-back',
					'type': 'button',
					'icon': 'chevron-left',
					'canBeDisabled' : false,
					'event': 'backToPreviousScreen'
				},
				{
					'label' : '((Lesson Screen))',
					'id': 'menu-button-task',
					'type': 'button',
					'icon': '',
					'canBeDisabled' : false,
					'subMenuItems': [
						{
							'id': 'menu-group-file',
							'label' : '((File))',
							'type':'btn-group',
							'subMenuItems':[
								{
									'id': 'menu-button-save-lesson',
									'icon': 'folder-close',
									'label' : '((Save))',
									'event': 'lesson_save',
                                    'shortcut': {
                                        'keys': 'ctrl + s'
                                    },
									'canBeDisabled' : true
								}
							]
						},
                        {
	                        'id': 'menu-group-clipboard',	                        
                            'label' : '((Clipboard))',
                            'type':'btn-group',
                            'subMenuItems':[
                                {
                                    'id': 'menu-button-cut',
                                    'icon': 'cut',
                                    'label' : '((Cut))',
                                    'event': 'cut_item',
                                    'shortcut': {
                                        'keys': 'ctrl + x',
                                        'disableOnInput': true
                                    },
                                    'canBeDisabled' : true
                                },
                                {
                                    'id': 'menu-button-copy',
                                    'icon': 'copy',
                                    'label' : '((Copy))',
                                    'event': 'copy_item',
                                    'shortcut': {
                                        'keys': 'ctrl + c',
                                        'disableOnInput': true
                                    },
                                    'canBeDisabled' : true
                                },
                                {
                                    'id': 'menu-button-paste',
                                    'icon': 'paste',
                                    'label' : '((Paste))',
                                    'event': 'paste_item',
                                    'shortcut': {
                                        'keys': 'ctrl + v',
                                        'disableOnInput': true
                                    },
                                    'canBeDisabled' : true
                                },
                                {
                                    'id': 'menu-button-undo',
                                    'icon': 'undo',
                                    'label' : '((Undo))',
                                    'event': 'undo_action',
                                    'canBeDisabled' : true,
                                    'shortcut': {
                                        'keys': 'ctrl + z',
                                        'disableOnInput': true
                                    }
                                },
                                {
                                    'id': 'menu-button-redo',
                                    'icon': 'circle-arrow-down',
                                    'label' : '((Redo))',
                                    'event': 'redo_action',
                                    'canBeDisabled' : true,
                                    'shortcut': {
                                        'keys': 'ctrl + y',
                                        'disableOnInput': true
                                    }
                                }

                            ]
                        },
						{
							'label' : '((References))',
							'type': 'button_dropdown',
							'subMenuItems':[
								{
									'id': 'menu-button-references-course',
									'icon': 'envelope',
									'label' : '((References))',
									'event' : 'references_course',
									'canBeDisabled' : true
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
                        }
					]
				}
			]}
		},
		props:{
			modName:'PropsComponent'
		},
		navbar:{
			modName:'NavBarComponent',
			config:{
				showTaskBar:true,
				showSubTaskBar:true
			}
		},
		stage:{
			modName:'StageComponent'
		}
	}
});