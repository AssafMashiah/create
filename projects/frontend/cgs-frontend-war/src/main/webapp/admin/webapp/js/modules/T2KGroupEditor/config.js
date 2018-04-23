define({
	treeComponentTitle: "Cloud/Server Name",
	menuConfig: {
			menuInitFocusId:'menu-button-publishers',
			menuItems: [
			{
				'label': 'Group Admin',
				'id': 'menu-button-publishers',
				'type': 'button',
				'icon': '',
				'canBeDisabled' : false,
				'subMenuItems': [
					{
						'id':'menu-group-publisher',
						'type': 'btn-group',
						'label': 'Accounts',
						'subMenuItems': [
							{
								'id':'menu-button-new-publisher',
								'event': 'new-publisher',
								'icon': 'plus',
								'tooltip': 'New Publisher',
								'label':'New Publisher',
								'canBeDisabled':false,
							},
							{
								'id':'menu-button-delete-publisher',
								'event': 'delete-publisher',
								'icon': 'trash',
								'tooltip': 'Delete',
								'label':'Delete Publisher',
								'canBeDisabled':false,
								'disabled': true
							}
						]
					}						
				]
			}
		]
	}
});
