define({
	menuItems:[
		{
			'label' : '((Info Balloon))',
			'id':'menu-button-task',
			'type':'button',
			'icon':'',
			'canBeDisabled':false,
			'subMenuItems':[
				{
					'id': 'menu-group-insert',					
					'label' : '((Insert))',
					'type':'btn-group',
					'subMenuItems':[
						{
							'id':'menu-button-new-text', // id in DOM
							'icon':'text-height',
							'label' : '((Text))',
							'event':'createIbItem',
							'args': {"type":"textViewer", "data":{"mode":"plain"}},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-image', // id in DOM
							'icon':'picture',
							'label' : '((Image))',
							'event':'createIbItem',
							'args': {"type":"imageViewer"},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-sound-button', // id in DOM
							'icon':'play',
							'label' : '((Sound Button))',
							'event':'createIbItem',
							'args': {"type":"soundButton"},
							'canBeDisabled':true
						}
					]
				},
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
	notSelectableInStage:true,
	displayTaskDropdown:false
});