define({
	treeComponentTitle: "Cloud/Server Name",
	menuConfig: {
			menuInitFocusId:'menu-button-publishers',
			menuItems: [
			{
				'label': 'Administration',
				'id': 'menu-button-publishers',
				'type': 'button',
				'icon': '',
				'canBeDisabled' : false,
				'subMenuItems': [
					{
						'id':'menu-group-publisher',
						'type': 'btn-group-title',
						'label': 'Accounts',
						'subMenuItems': [
							{
								'id':'menu-button-new-group',
								'event': 'new-group',
								/*'icon': 'plus',*/
								'tooltip': 'New Group',
								'label':'New Group',
								'canBeDisabled':false,
							},
							{
								'id':'menu-button-new-publisher',
								'event': 'new-publisher',
								/*'icon': 'plus',*/
								'tooltip': 'New Account',
								'label':'New Account',
								'canBeDisabled':false,
							},
							{
								'id':'menu-button-delete-publisher',
								'event': 'delete-publisher',
								/*'icon': 'trash',*/
								'tooltip': 'Delete',
								'label':'Delete',
								'canBeDisabled':false,
								'disabled': true
							}
						]
					},
					{
						'id':'menu-group-standards',
						'type': 'btn-group-title',
						'label': 'Standards',
						'subMenuItems': [
							{
								'id':'menu-button-standards',
								'event': 'show-standards',
								/*'icon': 'plus',*/
								'tooltip': 'Standards',
								'label':'Standards',
								'canBeDisabled':false
							}
						]
					}
				]
			}
		]
	}
});
