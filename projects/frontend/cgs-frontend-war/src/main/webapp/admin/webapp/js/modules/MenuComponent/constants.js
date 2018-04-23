define({

	templates: {
		'btn-group': 
			'<div id="{{id}}-btn-group" class="btn-group">'+
				'{{#tab}}'+
					'<a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn" id="{{id}}" title="(({{tooltip}}))"><i class="icon-{{icon}}"></i></a>'+
				'{{/tab}}'+
				'<p class="divider-horizontal">{{label}}</p>'+
			'</div>',
		'btn-group-title': 
			'<div id="{{id}}-btn-group" class="btn-group">'+
				'{{#tab}}'+
					'<a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn btn-link-title" id="{{id}}" title="(({{tooltip}}))"><span class="btn-span-title">{{label}}</span></a>'+
				'{{/tab}}'+
				'<p class="divider-horizontal">{{label}}</p>'+
			'</div>',
		'btn-group-scroll': 
			'<div id="{{id}}" class="btn-group btn-group-scroll"><ul id="ul_{{id}}">'+
				'{{#tab}}'+
					'<li><a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn btn-link-title" id="{{id}}" title="(({{tooltip}}))"><i class="icon-{{icon}}"></i><span class="btn-span-title" title="(({{tooltip}}))">{{label}}</span></a></li>'+
				'{{/tab}}'+
				'</ul><p class="divider-horizontal">{{label}}<i class="btn-group-scroll-open white-caret"></i></p>'+
			'</div>',
		'button': 
			'<a href="javascript:;" {{#disabled}}disabled{{/disabled}} class="btn" id="{{id}}" title="(({{tooltip}}))"><i class="icon-{{icon}}"></i><label>{{label}}</label></a>',
		'button_dropdown' :
			'<div id="{{id}}-btn-group" class="btn-group">' +
			'{{#tab}}' +
			'<a href="javascript:void(0)" class="btn" id="{{id}}" {{#disabled}}disabled{{/disabled}}{{^disabled}}data-toggle="dropdown"{{/disabled}} title="(({{tooltip}}))">' +
				'<i class="icon-{{icon}}"></i><b class="caret white-caret"></b></a>' +
			'{{/tab}}' +
			'<p class="divider-horizontal">&nbsp;</p><ul class="dropdown-menu" role="menu" id="course_reference_menu"></ul></div>',
		'btn_dropdown':
			'<div id="{{id}}-btn-group" class="btn-group">\
			{{#tab}}' +
				'<div class="btn-group">' +
                '<a href="javascript:void(0)" id="{{id}}" class="btn" {{#disabled}}class="disabled" disabled="true"{{/disabled}}{{^disabled}}{{#numOfDropDowns}} data-toggle="dropdown" {{/numOfDropDowns}}{{/disabled}} title="(({{tooltip}}))">{{#icon}}<i class="icon-{{icon}}"></i>{{#numOfDropDowns}}<b class="caret white-caret"></b>{{/numOfDropDowns}}{{/icon}}{{^icon}}<label class="ellipsis">{{label}}{{#numOfDropDowns}}<b class="caret white-caret"></b>{{/numOfDropDowns}}</label>{{/icon}}</a>\
                {{^disabled}}{{#numOfDropDowns}}' +
                '<ul class="dropdown-menu marginTop19" role="menu">\
                {{#dropDownArr}}' +
                  '<li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}" {{#numOfDropDownsLevel2}}class="dropdown-submenu"{{/numOfDropDownsLevel2}}><a {{#disabled}}class="disabled" disabled="true"{{/disabled}} >{{label}}</a>' +
					'<ul class="dropdown-menu" role="menu">\
					 {{#dropDownArrLevel2}}\
						<li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}"><a href="javascript:void(0)" {{#disabled}}class="disabled" disabled="true"{{/disabled}}><label>{{label}}</label></a></li>\
					 {{/dropDownArrLevel2}}\
					</ul>' +
				'</li>' +
				'{{/dropDownArr}}' +
                '</ul>\
	            {{/numOfDropDowns}}{{/disabled}}\
	            </div>\
			{{/tab}}\
			<p class="divider-horizontal">{{label}}</p>\
			</div>',
		'btn_split':
			'<div id="{{id}}-btn-group" class="btn-group">\
			{{#tab}}' +
				'<div class="btn-group {{#numOfDropDowns}}split{{/numOfDropDowns}}">' +
				'<a href="javascript:void(0)" id="{{id}}" class="btn" {{#disabled}}class="disabled" disabled="true"{{/disabled}}{{^disabled}}{{#numOfDropDowns}} data-toggle="dropdown" {{/numOfDropDowns}}{{/disabled}} title="(({{tooltip}}))">{{#icon}}<i class="icon-{{icon}}"></i>{{/icon}}{{^icon}}<label>{{label}}</label>{{/icon}}</a>\
				{{^disabled}}{{#numOfDropDowns}}' +
				'<a class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret white-caret"></span></a>\
				<ul class="dropdown-menu marginTop19" role="menu">\
				{{#dropDownArr}}' +
				'<li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}" {{#numOfDropDownsLevel2}}class="dropdown-submenu"{{/numOfDropDownsLevel2}}><a {{#disabled}}class="disabled" disabled="true"{{/disabled}} >{{label}}</a>' +
				'<ul class="dropdown-menu" role="menu">\
						 {{#dropDownArrLevel2}}\
							<li {{#disabled}}class="disabled" disabled="true"{{/disabled}} id="{{id}}"><a href="javascript:void(0)" {{#disabled}}class="disabled" disabled="true"{{/disabled}}><label>{{label}}</label></a></li>\
						 {{/dropDownArrLevel2}}\
						</ul>' +
				'</li>' +
				'{{/dropDownArr}}' +
				'</ul>\
					{{/numOfDropDowns}}{{/disabled}}\
					</div>\
				{{/tab}}\
				<p class="divider-horizontal">{{label}}</p>\
			</div>'
	},

	menuRight: {

	},
	
	activeTabClass : 'btn-primary',
	menuItemWidth: 60,
	marginFactor: 125,
	menuScrollItemWidth: 170

});