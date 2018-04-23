define({
	cgsHints : [
        {
            "selector": "#button_lock",
            "parentScroll": "",
            "text": "coach_marks.course_screen.unlock_btn",
            'displayInEditMode': true,
            "position": {
                verticalAlign: "bottom",
                horizontalAlign: "middle-right"
            }
        }
    ],
	components: {
		menu: {
			modName: 'MenuComponent',
			config : {
				menuInitFocusId:'menu-button-course',
				menuItems: [
				{
					'label' : '((Course))',
					'id': 'menu-button-course',
					'type': 'button',
					'icon': '',
					'canBeDisabled' : false,
					'subMenuItems': [
						{
							'id': 'menu-group-file',
							'label' : '((File))',
							'type': 'btn_split',
							'subMenuItems':[
								{
									'id':'menu-button-new',
									'icon':'home',
									'label' : '((New))',
									'canBeDisabled':false,
									'dontStealFocus':true,
									'dropDownItems':[
										{
											'id':'new-native-course',
											'label' : '((menuButton.new.course))',
											'event':'newCourse',
											'dontStealFocus':true
										},
										{
											'id': 'menu-button-from-file',
											'label': '((landing.page.button.importCourse))',
											'event': 'importCourse',
											'dontStealFocus': true
										},
										{
											'id': 'menu-button-from-epub',
											'label': '((landing.page.button.importEpub))',
											'event': 'importEpub',
											'showFlag': 'enableEpubConversion',
											'dontStealFocus': true
										}
									]

								},
								{
									'id': 'menu-button-open-course',
									'icon': 'folder-open',
									'label' : '((Open))',
									'shortcut': {
										'keys': 'ctrl + o'
									},
									'event': 'course_open',
									'canBeDisabled' : false
								},
								{
									'id': 'menu-button-save-course',
									'icon': 'folder-close',
									'label' : '((Save))',
									'shortcut': {
										'keys': 'ctrl + s'
									},
									'event': 'course_save',
									'canBeDisabled' : true
								},
								{
									'id': 'menu-button-export-as-course',
									'icon': 'map-marker',
									'label': '((Save as))',
									'event':'course_save_as',
									'canBeDisabled' : true,
									'dropDownItems':[
										{
											'id':'menu-button-save-as-course',
											'event': 'course_save_as',
											'shortcut': {
												'keys': 'ctrl + shift + s'
											},
											'label' : '((Different Course))',
											'dontStealFocus':true
										},
										{
											'id':'menu-button-export-as-file',
											'event':'export_course',
											'label':'((CGS File))',
											'dontStealFocus':true
										}
									]
								},
                                {
                                    'id': 'menu-button-import-lesson',
                                    'icon': 'real-download-alt',
                                    'label' : '((Import Lesson))',
                                    'event': 'import_lesson',
                                    'shortcut': {
										'keys': 'ctrl + shift + i'
									},
                                    'canBeDisabled' : true
                                }
							]
						},
						{
							'id': 'menu-group-versioning',
							'label' : '((Versioning))',
							'type': 'btn-group',
							'subMenuItems':[
								{
									'id': 'menu-button-edition-course',
									'icon': 'edition',
									'label' : '((New Edition))',
									'event': 'course_edition',
									'shortcut': {
										'keys': 'ctrl + shift + e'
									},
									'canBeDisabled' : true
								},
								{
									'id': 'menu-button-publish-course',
									'icon': 'globe',
									'label' : '((Publish))',
									'event': 'course_publish',
									'shortcut': {
										'keys': 'ctrl + shift + p'
									},
									'canBeDisabled' : true
								}
							]
						},
						{
							'id': 'menu-group-clipboard',
							'label' : '((Clipboard))',
							'type': 'btn-group',
							'subMenuItems':[
									{
										'id': 'menu-button-cut',
										'icon': 'shopping-cart',
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
										'icon': 'heart',
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
										'icon': 'pencil',
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
										'icon': 'plus-sign',
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
										'icon': 'minus-sign',
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
							'id': 'menu-group-level',
							'label' : '((Level))',
							'type': 'btn-group-title',
							'subMenuItems':[
								{
									'id':'menu-button-new-level', // id in DOM
									'icon':'ok-sign',
									'label' : '((Add))',
									'event':'toc_new',
									'canBeDisabled':true
								},
								{
									'id':'menu-button-delete-level',
									'icon':'trash',
									'label' : '((Delete))',
									'canBeDisabled':true,
									'event':'toc_del',
									'shortcut': { 
										'keys': 'delete',
										'focus': 'tree'
									}
								}
							]
						},
                        {
                            'label' : '((subMenu.btnGroups.references))',
                            'type': 'button_dropdown',
	                        'showFlag': 'enableReferences',
                            'subMenuItems':[
                                {
                                    'id': 'menu-button-references-course',
                                    'icon': 'envelope',
                                    'label' : '((References))',
                                    'event' : 'references_course',
                                    'canBeDisabled' : true
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
				startType: 'course',
				endType: 'lesson'
			}
		},
		props: {
			modName: 'PropsComponent'
		},		
		navbar: {
			modName: 'NavBarComponent'
		}
	}
});
