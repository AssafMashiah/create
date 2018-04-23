define({
	menuItems:[
		{
			'label' : '((Ending))',
			'id':'menu-button-question',
			'type':'button',
			'icon':'',
			'canBeDisabled':false,
			subMenuItems:[
				{
					'id': 'menu-group-insert',
					'label' : '((Insert))',
					'type':'btn-group',
					'subMenuItems':[
						{
							'id':'menu-button-new-text', // id in DOM
							'icon':'text-height',
							'label' : '((Text))',
							'event':'createNewItem',
							'args': {"type":"textViewer", 'data':{"width":"100%"}},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-image', // id in DOM
							'icon':'picture',
							'label' : '((Image))',
							'event':'createNewItem',
							'args': {"type":"imageViewer"},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-sound-button', // id in DOM
							'icon':'play',
							'label' : '((Sound Button))',
							'event':'createNewItem',
							'args': {"type":"soundButton"},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-audio-player',
							'icon':'pause',
							'label' : '((Audio))',
							'event':'createNewItem',
							'args': {"type":"audioPlayer", "data":{"showAutoPlay": true}},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-video',
							'icon':'facetime-video',
							'label' : '((Movie))',
							'event':'createNewItem',
							'args': {"type":"videoPlayer", "data":{"showAutoPlay": false}},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-table',
							'icon':'fast-forward',
							'label' : '((Table))',
							'event':'createNewItem',
							'args': {"type":"table"},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-applet',
							'icon':'forward',
							'label' : '((Applet))',
							'event':'createNewApplet',
							'args' :{"templatePath":"modules/AppletWrapperEditor/AppletWrapperEditor"},
							'canBeDisabled' : true
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
	menuInitFocusId:'menu-button-question',
	sortChildren: true
});