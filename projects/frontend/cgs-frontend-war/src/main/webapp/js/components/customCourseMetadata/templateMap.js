define({

	'text' :'<div class="control-group" >\
				<label class="control-label {{#options.required}}required-field{{/options.required}}"> (({{options.name}})): </label>\
				<input type="text" maxlength="{{options.value}}" data-value="obj.courseValue"></input>\
			</div>',
	'integer' :'<div class="control-group">\
					<label class="control-label {{#options.required}}required-field{{/options.required}}"> (({{options.name}})): </label>\
					<input id="input_number" type="number" min="{{options.value_from}}" max={{options.value_to}} data-value="obj.courseValue"></input>\
				</div>',
	
	'freeText':'<div class="control-group">\
					<label class="control-label {{#options.required}}required-field{{/options.required}}"> (({{options.name}})): </label>\
					<textarea rows="{{options.value}}"" maxlength="{{options.maxLength}}" data-value="obj.courseValue"></textarea>\
				</div>',
	
	'tags': '<div class="control-group">\
				<label class="control-label {{#options.required}}required-field{{/options.required}}"> (({{options.name}})): </label>\
				<textarea placeholder="((use)) (({{options.value}})) ((to seperate between tags))" data-value="obj.courseValue"></textarea>\
			</div>',
	
	'url':  '<div class="control-group">\
				<label class="control-label {{#options.required}}required-field{{/options.required}}"> (({{options.name}})): </label>\
				<input type="url" data-value="obj.courseValue"></input>\
			</div>',
	
	'date': '<div class="control-group">\
				<label class="control-label {{#options.required}}required-field{{/options.required}}">(({{options.name}})): </label>\
				<div class="date-wrapper">\
				<input data-value="obj.courseValue" type="text" id="datePicker_{{id}}" class="date" ></input>\
				<button class="date-clear"></button>\
				</div>\
			</div>',
	
	'time': '<div class="control-group">\
				<label class="control-label {{#options.required}}required-field{{/options.required}}">(({{options.name}})): </label>\
				<div class="input-append bootstrap-timepicker">\
					<input data-value="obj.courseValue" id="timePicker_{{id}}" type="text" class="input-small">\
					<span class="add-on"><i class="icon-time"></i></span>\
				</div>\
			</div>',

	'list': '<div class="control-group">\
				<label class="control-label {{#options.required}}required-field{{/options.required}}">(({{options.name}})): </label>\
				<select data-value="obj.courseValue">\
					{{#listValues}}\
						<option value="{{key}}">{{name}}</option>\
					{{/listValues}}\
				</select>\
			</div>',
	
	'boolean': '<div class="control-group">\
					<input type="checkbox" data-checked="obj.courseValue">\
					<span>{{options.name}}</span>\
				</div>',

    'packageName': '<h5>Package: {{options.name}}</h5>',

    "multiselect_large" : '<div class="control-group">'+
			'<label class="control-label {{#options.required}}required-field{{/options.required}}">{{options.name}}: </label>'+
				'<input type="button" id="multiSelection_{{id}}" class="openMultiSelectDialog btn" value="((customMetadata.multiselect.open.dialog))"/>'+
			'</div>',
	"multiselect" :
		'<div class="control-group">'+
			'<label class="control-label {{#options.required}}required-field{{/options.required}}">{{options.name}}: </label>'+
			'<div class="multiselect">'+
			"{{#multiSelectValues}}"+
				"<div class='multiselectRow'>"+
					"<input type='checkbox' {{#checked}}checked{{/checked}} class='selection' id='{{id}}'/>"+
					"{{name}}"+
				"</div>"+
			"{{/multiSelectValues}}"+
			"</div>"+
		'</div>'

});