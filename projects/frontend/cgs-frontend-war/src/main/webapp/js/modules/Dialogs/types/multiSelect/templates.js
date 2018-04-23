define({
	
	"selection_options_area":
		"{{#items}}"+
			"{{#display}}"+
				"<div class='multiselect-row'>"+
					"<input type='checkbox' {{#checked}}checked{{/checked}} class='selection' value='{{id}}'/>"+
					"<div class='item-name'>{{name}}</div>"+
				"</div>"+
			"{{/display}}"+
		"{{/items}}",

	"selected_area":
		'<div class="selectedItemsArea">((customMetadata.multiselect.dialog.selectedItems.title)):</div>'+
			"<ul>"+
				"{{#items}}"+
					"{{#checked}}"+
						"<li class='selected-row'>{{name}}</li>"+
					"{{/checked}}"+
				"{{/items}}"+
			"</ul>"
	
	
});