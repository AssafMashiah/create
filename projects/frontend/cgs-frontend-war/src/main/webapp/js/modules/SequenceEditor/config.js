/**
 * default attributes
 * @'default_display' : 'disabled'  // display the menu item in disabled view.
 */
define({
    cgsHints : [
        {
            "selector" : "#menu-button-new-freeWriting" ,
            "displayWhenSelectorDisabled" : true,
            "parentScroll" : "" ,
            "text" : "coach_marks.sequence_editor.toolbar.add_interactive_tasks" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-left"
            }
        },
        {
            "selector" : ".edit_element:first" ,
            "displayWhenSelectorDisabled" : true,
            "parentScroll" : "#stage_base" ,
            "text" : "coach_marks.sequence_editor.edit_task" ,
            "disableReposition": true,
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

