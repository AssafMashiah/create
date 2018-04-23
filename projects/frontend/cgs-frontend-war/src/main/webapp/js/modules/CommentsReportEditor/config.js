define({
	menuItems:[
		{
			'label' : '((Comments))',
			'id':'menu-button-comments',
			'type':'button',
			'icon':'',
			'canBeDisabled':false,
			'subMenuItems':[
				{
					'id': 'menu-group-file',
					'label' : '((File))',
					'type':'btn-group',
					'subMenuItems':[
						{
							'id':'menu-button-export-comments',
							'icon':'export-assets',
							'label' : '((Export))',
							'event':'export_comments',
							'canBeDisabled': false
						},
						// {
						// 	'id':'menu-button-print-comments',
						// 	'icon':'print',
						// 	'label' : '((Print))',
						// 	'event':'print_comments',
						// 	'canBeDisabled': false
						// }
					]
				}
			]
		}
	],
	menuInitFocusId:'menu-button-comments',
	notSelectableInStage:true,
	displayTaskDropdown:false
});