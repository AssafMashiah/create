define({
    cgsHints : [
        {
            "selector" : "#menu-button-new-lo" ,//in case of lesson with lo
            "parentScroll" : "" ,
            "text" : "coach_marks.lesson_editor.toolbar.new_learning_object" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : "#menu-button-new-sequence" , // in case of assesment
            "text" : "coach_marks.lo_editor.toolbar.new_sequence" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : "#menu-button-new-sequence_group" , // in case of course without lo
            "text" : "coach_marks.lo_editor.toolbar.new_sequence.splitButton" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        }
    ] ,
	menuItems:[],
	menuInitFocusId: 'menu-button-course'
});

