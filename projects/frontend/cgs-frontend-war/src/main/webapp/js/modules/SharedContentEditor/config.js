define({
	menuItems:[
		{
			'label' : '((Insert))',
			'id':'menu-button-shared',
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
							'args': {"type":"textViewer"},
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
							'id':'menu-button-new-audio', // id in DOM
							'icon':'pause',
							'label' : '((Audio))',
							'event':'createNewItem',
							'args': {"type":"audioPlayer"},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-video',
							'icon':'facetime-video',
							'label' : '((Movie))',
							'event':'createNewItem',
							'args': {"type":"videoPlayer"},
							'canBeDisabled':true
						},
						{
							'id':'menu-button-new-applet',
							'icon':'forward',
							'label' : '((Applet))',
							'event':'createNewApplet',
							'args' :{"templatePath":"modules/AppletWrapperEditor/AppletWrapperEditor"},
							'canBeDisabled' : true
						},
						{
							'id':'menu-button-new-table',
							'icon':'fast-forward',
							'label' : '((Table))',
							'event':'createNewItem',
							'args': {"type":"table"},
							'canBeDisabled':true
						}
					]
				}
			]
		}
	],
	menuInitFocusId:'menu-button-shared',
	notSelectableInStage: true,
	displayTaskDropdown: false,
	sortChildren: true
});