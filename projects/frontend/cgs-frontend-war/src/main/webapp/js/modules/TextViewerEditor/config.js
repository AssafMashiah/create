define(['localeModel'], function f1121(localeModel) {
	return function f1122() {
		return {
			menuItems:[
				{
					'label' : '((Text))',
					'id': 'menu-button-text-editor',
					'type': 'button',
					'icon': '',
					'canBeDisabled' : false,
					subMenuItems:[
						{
							'label' : '((styles))',
							'type':'btn-group-scroll',
							'id': 'menu-button-text-style',
							'args' :{
								"extraEvent":{
									"p.divider-horizontal":{"event":"stylesOpenScroll","class":"scroll-opened","openScrollIdPrefix":"ul_"}
								}
							},
							'subMenuItems': localeModel.getConfig('menu') && localeModel.getConfig('menu').textViewerStyles || []
						},
						{
							'label' : '((Effects))',
							'type':'btn-group-scroll',
							'id': 'menu-button-text-effects',
							'args' :{
								"extraEvent": {
									"p.divider-horizontal":{"event":"effectsOpenScroll","class":"scroll-opened","openScrollIdPrefix":"ul_"}
								}

							},
							'subMenuItems': localeModel.getConfig('menu') && localeModel.getConfig('menu').textViewerEffects || []
						},
						{
							'label' : '((Font))',
							'type':'btn-group',
                            'id': 'menu-button-font-style',
							'subMenuItems':[
								{
									'id':'menu-button-font-upper',
									'icon':'arrow-up',
									'label' : 'x-' + '((up))',
									'event':'executeCommand',
									'args' :['superscript', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								},
								{
									'id':'menu-button-font-lower',
									'icon':'arrow-down',
									'label' : 'x-' + '((down))',
									'event':'executeCommand',
									'args' :['subscript', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								}
							]
						},
						{
							'label' : '((Paragraph))',
                            'id': 'menu-button-paragraph-style',
							'type':'btn_dropdown',
							'subMenuItems':[
								{
									'id': 'menu-button-paragraph-bullet_number',
									'icon': 'cog',
									'label' : '((Bullets))' + ' & ' +'((Numbering))',
									'canBeDisabled' : true,
									'dontStealFocus' : true,
									'dropDownItems': [
										{
											'id': 'menu-dropdown-numbering',
											'event':'executeCommand',
											'args' :['insertOrderedList', null],
											'label' : '((Numbers))',
											'dontStealFocus' : true
										},
										{
											'id': 'menu-dropdown-bulleting',
											'event':'executeCommand',
											'args' :['insertUnorderedList', null],
											'label' : '((Bullets))',
											'dontStealFocus' : true
										}
									]
								},
								{
									'id':'menu-button-paragraph-increase-indent',
									'icon':'indent-left',
									'label' : '((Increase Indent))',
									'event':'executeCommand',
									'args' :['indent', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								},
								{
									'id':'menu-button-paragraph-decrease-indent',
									'icon':'indent-right',
									'label' : '((Decrease Indent))',
									'event':'executeCommand',
									'args' :['outdent', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								}
							]
						},
						{
							'label' : '((Insert))',
							'id': 'text-viewer-insert-menu',
							'type':'btn_split',
							'subMenuItems':[
                                {
                                    'id': 'menu-button-paragraph-math',
                                    'icon': 'adjust',
                                    'label': '((MF))',
                                    'event': 'executeCommand',
                                    'args': ['insertMathField', null],
                                    'canBeDisabled' : true,
                                    'dontStealFocus' : true,
                                    'dropDownItems': [
                                        {
                                            'id':'menu-button-insert-mf',
                                            'label' : '((MF))',
                                            'event':'executeCommand',
                                            'args': ['insertMathField', null],
                                            'dontStealFocus' : true
                                        },
                                        {
                                            'id':'menu-button-insert-latex',
                                            'label' : '((LaTeX))',
                                            'event':'executeCommand',
                                            'args' :['insertLatex', null],
                                            'dontStealFocus' : true
                                        },
                                        {
                                            'id':'menu-button-insert-mathml',
                                            'label' : '((MathML))',
                                            'event':'executeCommand',
                                            'args' :['insertMathML', null],
                                            'dontStealFocus' : true
                                        }
                                    ]
                                },
								{
									'id':'menu-button-insert-img',
									'icon':'picture',
									'label' : '((textViewer.menu.title.image))',
									'event':'executeCommand',
									'args' :['insertInlineImage', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								},
								{
									'id':'menu-button-insert-sb',
									'icon':'play',
									'label' : '((textViewer.menu.title.soundButton))',
									'event':'executeCommand',
									'args' :['insertSoundButton', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								},
								{
									'id':'menu-button-insert-narration',
									'icon':'pause',
									'label' : '((Narration))',
									'event':'executeCommand',
									'args' :['insertNarration', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								},
								{
									'id':'menu-button-insert-ib',
									'icon':'heart-empty',
									'label' : '((textViewer.menu.title.infoBalloon))',
									'event':'executeCommand',
									'args' :['insertInfoBaloon', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								},
								{
									'id':'menu-button-insert-link',
									'icon': 'link',
									'label': '((textViewer.menu.title.link))',
									'event': 'executeCommand',
									'args': ['insertLink', null],
									'canBeDisabled' : true,
									'dontStealFocus' : true
								}
							]
						}
					]
				}
			],
			menuInitFocusId: 'menu-button-text-editor'
		}
	}
});