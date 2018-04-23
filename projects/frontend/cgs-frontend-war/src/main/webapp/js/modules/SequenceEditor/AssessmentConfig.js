/**
 * default attributes
 * @'default_display' : 'disabled'  // display the menu item in disabled view.
 */
define({
	cgsHints : [
        {
            "selector" : "#sequence-insert-menu-btn-group" ,
            "displayWhenSelectorDisabled" : true,
            "parentScroll" : "" ,
            "text" : "coach_marks.sequence_editor.toolbar.add_interactive_tasks" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : ".edit_element:first" ,
            "displayWhenSelectorDisabled" : true,
            "parentScroll" : "#stage_base" ,
            "text" : "coach_marks.sequence_editor.edit_task" ,
            "position" : {
                verticalAlign : "middle" ,
                horizontalAlign : "left"
            }
        }
    ] ,
	menuItems:[],
	menuInitFocusId: 'menu-button-course',
	menuHeaderInsertId: 'menu-button-new-header',
	sortChildren: true,
    childrenTypesToExcludeFromShowInStage: 'help'
});