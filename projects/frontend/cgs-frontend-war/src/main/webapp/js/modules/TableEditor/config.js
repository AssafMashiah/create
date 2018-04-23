define({
	menuItems:[{
		'label' : '((table))',
		'id': 'menu-button-table-editor',
		'type': 'button',
		'icon': '',
		'canBeDisabled' : false,
		subMenuItems:[{
			'label' : '((layout))',
			'type':'btn-group',
			'subMenuItems':[
				{
					'id':'table-button-insert-row',
					'icon':'star',
					'label' : '((insert row))',
					'event':'insertRow',
					'args' :{},
					'canBeDisabled' : true,
					'dontStealFocus' : true
				},
				{
					'id':'table-button-insert-column',
					'icon':'star-empty',
					'label' : '((insert column))',
					'event':'insertColumn',
					'args' :{},
					'canBeDisabled' : true,
					'dontStealFocus' : true
				},
				{
					'id':'table-button-delete',
					'icon':'trash',
					'label' : '((delete))',
					'event':'deleteTableItem',
					'args' :{},
					'canBeDisabled' : true,
					'dontStealFocus' : true
				}]
		}]
	}],
	menuInitFocusId:"menu-button-table-editor"
});