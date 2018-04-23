define({
	menuItems : [
		{	'label' : '((Narrations))',
			'id' : 'assets-action',
			'type' : 'button',
			'canBeDisabled' : false,
			'subMenuItems'	:[
                {
                    'label'         : 'Excel',
                    'type'          : 'btn-group',
                    'notImplemented' : true,
                    'subMenuItems':[
                        {
                            'id'            : 'menu-button-export-assets',
                            'type'          : 'button',
                            'icon'          : 'export-assets',
                            'canBeDisabled' : false, //true
                            'event' : 'assetsTableToCsv'
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
	]
});