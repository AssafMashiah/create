define({
	menuItems:[
		{
			'label' : '((Dialog))',
			'id':'menu-button-task',
			'type':'button',
			'icon':'',
			'canBeDisabled':false,
			'subMenuItems':[]
		}
	],
	menuInitFocusId:'menu-button-task',
	sortChildren: true,
	notSelectableInStage:true,
	displayTaskDropdown:false,
	childrenTypesToExcludeFromShowInStage: 'pluginHidden,help'
});