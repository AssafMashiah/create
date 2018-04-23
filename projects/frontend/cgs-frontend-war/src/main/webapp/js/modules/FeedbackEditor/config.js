define({
	menuItems:[
		{
			'label' : '((Feedback))',
			'id':'menu-button-task',
			'type':'button',
			'icon':'',
			'canBeDisabled':false,
			subMenuItems:[
				{
					'id': 'menu-group-clipboard',
                    'label': '((Clipboard))',
                    'type': 'btn-group',
                    'subMenuItems': [
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
                        }

                    ]
                }
			]
		}
	],
	menuInitFocusId:'menu-button-task',
	notSelectableInStage: true,
	displayTaskDropdown: false
});