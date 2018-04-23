define({
    
	components:{
		menu:{
			modName:'MenuComponent',
			config:{
				menuInitFocusId:'menu-button-task',
				menuItems: [{
					'label' : '((Task Screen))',
					'id': 'menu-button-task',
					'type': 'button',
					'icon': '',
					'canBeDisabled' : false,
					'subMenuItems': [
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
				}]
            }
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