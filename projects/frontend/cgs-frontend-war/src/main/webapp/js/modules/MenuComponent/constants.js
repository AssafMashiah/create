define({

	templates: {
		'btn-group': 
			'<div id="{{id}}-btn-group" class="btn-group">\
				{{#tab}}\
					<a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn" id="{{id}}" title="{{tooltip}}"><i class="base-icon icon-{{icon}}"></i></a>\
				{{/tab}}\
				<p class="divider-horizontal">{{label}}</p>\
			</div>',
		'btn-group-title': 
			'<div id="{{id}}-btn-group" class="btn-group">\
				{{#tab}}\
					<a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn btn-link-title" id="{{id}}" title="{{tooltip}}"><span class="btn-span-title">{{label}}</span></a>\
				{{/tab}}\
				<p class="divider-horizontal">{{label}}</p>\
			</div>',
		'btn-group-scroll': 
			'<div id="{{id}}" class="btn-group btn-group-scroll"><ul id="ul_{{id}}">\
				{{#tab}}\
					<li>\
						<div {{#disabled}}disabled{{/disabled}} class="btn-link-title" id="{{id}}" title="{{tooltip}}">\
							{{#icon}}<i class="base-icon icon-{{icon}}"></i>{{/icon}}\
							{{^icon}}<div class="divIcon">&#x57</div>{{/icon}}\
							<span title="{{tooltip}}">{{label}}</span>\
						</div>\
					</li>\
				{{/tab}}\
				</ul><p class="divider-horizontal">{{label}}<i class="btn-group-scroll-open white-caret"></i></p>\
			</div>',
		'button': 
			'<a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn" id="{{id}}" title="{{tooltip}}"><i class="base-icon icon-{{icon}}"></i><label>{{label}}</label></a>',
		'button_dropdown' :
			'<div id="{{id}}-btn-group" class="btn-group">\
			{{#tab}}\
			<a href="javascript:void(0)" class="btn" id="{{id}}" {{#disabled}}disabled{{/disabled}}{{^disabled}}data-toggle="dropdown"{{/disabled}} title="{{tooltip}}">\
				<i class="base-icon icon-{{icon}}"></i><b class="caret white-caret"></b></a>\
			{{/tab}}\
			<p class="divider-horizontal">{{label}}</p><ul class="dropdown-menu" role="menu" id="course_reference_menu"></ul></div>',
        'button_dropdown_title' :
            '<div class="btn-group">\
            {{#tab}}\
            <a href="javascript:void(0)" class="btn btn-link-title btn-dropdown" id="{{id}}" {{#disabled}}disabled{{/disabled}}{{^disabled}}data-toggle="dropdown"{{/disabled}} title="{{label}}">\
            <span class="btn-span-title">{{label}}</span><b class="caret white-caret"></b></a>\
            {{/tab}}\
            <p class="divider-horizontal">{{label}}</p><ul class="dropdown-menu" role="menu" id="course_reference_menu"></ul></div>',
		'btn_dropdown':
			'<div id="{{id}}-btn-group" class="btn-group">\
			{{#tab}}\
				<div class="btn-group btn-group-member">\
                <a href="javascript:void(0)" id="{{id}}" class="btn foldedLabel" {{#disabled}}class="disabled" disabled="true"{{/disabled}}{{^disabled}}{{#numOfDropDowns}} data-toggle="dropdown" {{/numOfDropDowns}}{{/disabled}} title="{{tooltip}}">\
                    {{#icon}}<i class="base-icon icon-{{icon}}"></i>\
                    {{#numOfDropDowns}}<b class="caret white-caret"></b>{{/numOfDropDowns}}\
                    {{/icon}}\
                    {{^icon}}<label>{{label}}</label>\
                    {{#numOfDropDowns}}<b class="caret white-caret"></b>{{/numOfDropDowns}}\
                    {{/icon}}\
                </a>\
                {{^disabled}}{{#numOfDropDowns}}\
                <ul class="dropdown-menu marginTop19" role="menu">\
                {{#dropDownArr}}\
                  <li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}" {{#numOfDropDownsLevel2}}class="dropdown-submenu"{{/numOfDropDownsLevel2}}>\
                  <a {{#disabled}}class="disabled" disabled="true"{{/disabled}} >{{label}}</a>\
                    <ul class="dropdown-menu" role="menu">\
                     {{#dropDownArrLevel2}}\
                        <li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}"><a href="javascript:void(0)" {{#disabled}}class="disabled" disabled="true"{{/disabled}}><label>{{label}}</label></a></li>\
                     {{/dropDownArrLevel2}}\
                    </ul>\
				</li>\
				{{/dropDownArr}}\
                </ul>\
	            {{/numOfDropDowns}}{{/disabled}}\
	            </div>\
			{{/tab}}\
			<p class="divider-horizontal">{{label}}</p>\
			</div>',
		'btn_split':
			'<div id="{{id}}-btn-group" class="btn-group">\
			{{#tab}}\
				<div class="btn-group btn-group-member {{#numOfDropDowns}}split{{/numOfDropDowns}}">\
				<a href="javascript:void(0)" id="{{id}}" class="btn btn-link-title {{#icon}}split_icon{{/icon}}" {{#disabled}}class="disabled" disabled="true"{{/disabled}}{{^disabled}}{{#numOfDropDowns}} data-toggle="dropdown" {{/numOfDropDowns}}{{/disabled}} title="{{tooltip}}">\
					{{#icon}}<i class="base-icon icon-{{icon}}"></i>{{/icon}}\
					{{^icon}}<div class="btn-span-title" title="{{label}}">{{label}}</div>{{/icon}}\
				</a>\
				{{^disabled}}{{#numOfDropDowns}}\
				<a class="btn dropdown-toggle split_caret" data-toggle="dropdown"><span class="caret white-caret"></span></a>\
				<ul class="dropdown-menu marginTop19" role="menu">\
				{{#dropDownArr}}\
				<li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}" {{#numOfDropDownsLevel2}}class="dropdown-submenu"{{/numOfDropDownsLevel2}}>\
					<a {{#disabled}}class="disabled" disabled="true"{{/disabled}} >{{label}}</a>\
					<ul class="dropdown-menu" role="menu">\
						{{#dropDownArrLevel2}}\
							<li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}"><a href="javascript:void(0)" {{#disabled}}class="disabled" disabled="true"{{/disabled}}><label title="{{label}}">{{label}}</label></a></li>\
						{{/dropDownArrLevel2}}\
					</ul>\
				</li>\
				{{/dropDownArr}}\
				</ul>\
					{{/numOfDropDowns}}{{/disabled}}\
					</div>\
				{{/tab}}\
				<p class="divider-horizontal">{{label}}</p>\
			</div>'
	},

	menuRight: {
			'Notifications': {
				'id': 'btn_notifications',
				'event': 'showNotifications',
				'canBeDisabled' : false
			},
			'Preview': {
				'id': 'btn_Preview',
				'event': 'cgs_preview',
				'canBeDisabled' : true
			},
			'CGSHelp': {
				'id': 'userFirstName_menu_help',
				'event': 'cgs_help'
			},
			'About': {
				'id': 'userFirstName_menu_about',
				'event': 'cgs_about'
			},
			'Logout': {
				'id': 'userFirstName_menu_Logout',
				'event': 'cgs_logout'
			},
			'Settings': {
				'id': 'userFirstName_menu_Settings',
				'event': 'cgs_settings'
			}
	},
	
	activeTabClass : 'btn-primary',
	menuItemWidth: 60,
	marginFactor: 125,
	menuScrollItemWidth: 310,
	textualMenuWidths: {
		'default': {
		    sequenceTasksMenuWidth: 1083,
		    assessmentSequenceTasksMenuWidth: 851,
		    addLo : 111,
		    addLoAndQuiz: 152
		},
		'fr_FR': {
			sequenceTasksMenuWidth: 1100,
		    assessmentSequenceTasksMenuWidth: 900,
		    addLo : 148,
		    addLoAndQuiz: 188
		},
		'pt_BR':{
			sequenceTasksMenuWidth: 1261,
		    assessmentSequenceTasksMenuWidth: 949,
		    addLo : 156,
		    addLoAndQuiz: 247
		}
	}

});