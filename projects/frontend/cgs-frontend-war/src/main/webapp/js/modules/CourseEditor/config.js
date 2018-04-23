define({

    cgsHints : [
        {
            "selector" : "#menu-button-new-level" ,
            "parentScroll" : "" ,
            "text" : "coach_marks.course_editor.toolbar.add_new_level" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : ".view_lesson" ,
            "parentScroll" : "#props_base" ,
            "text" : "coach_marks.course_editor.settings.open_lesson" ,
            "position" : {
                verticalAlign : "top" ,
                horizontalAlign : "middle-right"
            }
        },
        {
            "selector" : "#new_lesson_component" ,
            "parentScroll" : "#props_base" ,
            "text" : "coach_marks.toc_editor.properties.new_toc_lesson" ,
            "position" : {
                verticalAlign : "bottom" ,
                horizontalAlign : "left"
            }
        }

    ] ,

	menuItems:[],

	menuInitFocusId: 'menu-button-course',

	course_reference_template : '<li class="{{fileType}}"><a href="{{path}}" target="_blank">{{fileName}}</a>\n' +
	'<button class="btn btn-link delete_reference"><span class="base-icon icon-remove"></span></button></li>'
});
