define({
    cgsHints : [
        {
            "selector" : "#menu-button-add-comment" ,
            "parentScroll" : "" ,
            "text" : "#menu-button-add-comment" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "left"
            }
        }
    ] ,
	menuItems:[
		{
			'label' : '((Insert))',
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
							'shortcut': {
                                'keys': 'ctrl + 1'
                            },
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-image', // id in DOM
							'icon':'picture',
							'label' : '((Image))',
							'event':'createNewItem',
							'args': {"type":"imageViewer"},
							'shortcut': {
                                'keys': 'ctrl + 2'
                            },
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-sound-button', // id in DOM
							'icon':'play',
							'label' : '((Sound Button))',
							'event':'createNewItem',
							'args': {"type":"soundButton"},
							'shortcut': {
                                'keys': 'ctrl + 3'
                            },
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-audio-player',
							'icon':'pause',
							'label' : '((Audio))',
							'event':'createNewItem',
							'args': {"type":"audioPlayer", "data":{"showAutoPlay": true}},
							'shortcut': {
                                'keys': 'ctrl + 4'
                            },
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-video',
							'icon':'facetime-video',
							'label' : '((Movie))',
							'event':'createNewItem',
							'args': {"type":"videoPlayer", "data":{"showAutoPlay": false}},
							'shortcut': {
                                'keys': 'ctrl + 5'
                            },
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-table',
							'icon':'fast-forward',
							'label' : '((Table))',
							'event':'createNewItem',
							'args': {"type":"table"},
							'shortcut': {
                                'keys': 'ctrl + 7'
                            },
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-applet',
							'icon':'forward',
							'label' : '((Applet))',
							'event':'createNewApplet',
							'args' :{"templatePath":"modules/AppletWrapperEditor/AppletWrapperEditor"},
							'shortcut': {
                                'keys': 'ctrl + 8'
                            },
							'canBeDisabled' : true
						}
					]
				}
			]
		}
	],
	menuInitFocusId:'menu-button-question',
	sortChildren: true
});