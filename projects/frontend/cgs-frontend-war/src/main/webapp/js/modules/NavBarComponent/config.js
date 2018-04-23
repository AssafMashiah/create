define({
	maxNumOfAncestorsInNavBar : 3,
	navbar: {
		modName: 'NavBarComponent',
		config:{
			showTaskBar: true,
			subMenuEvents : {
				'navbar_base_sub_back':'task_backToSequence',
				'select_TaskType':'task_TypeChange'
			}
		}
	}
});
