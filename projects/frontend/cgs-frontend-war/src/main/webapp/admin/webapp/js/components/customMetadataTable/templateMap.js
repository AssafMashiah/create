define({

	'text' : {

		'template': '<span >Size: </span>\
			<select id="textSize" rv-value="obj:value" class="span2">\
				<option value="3">3</option>\
				<option value="4">4</option>\
				<option value="5">5</option>\
				<option value="6">6</option>\
				<option value="7">7</option>\
				<option value="8">8</option>\
				<option value="9">9</option>\
			</select>\
			<span > Characters</span>',
		'defaultData': {'value': '3'}
	},

	'integer' : {
		'template':'<span  > From: </span>\
				<input class="span2" type="number" rv-value="obj:value_from"></input>\
				<span> To: </span>\
				<input class="span2" type="number" rv-value="obj:value_to"></input>',
		'defaultData': {'value_from': 1, 'value_to': 10}
	},		
	
	'freeText': {
		'template': '<span >Number of visible lines </span>\
				<select id="freeTextSize" rv-value="obj:value"  class="span2">\
			        <option value="3">3</option>\
			        <option value="4">4</option>\
			        <option value="5">5</option>\
			        <option value="6">6</option>\
			        <option value="7">7</option>\
			        <option value="8">8</option>\
			        <option value="9">9</option>\
		   		</select>',
		'defaultData': {'value': '3'}
	},
	
	'tags':{
		'template': '<span>Separate tags by </span>\
			<select id="tagSeperator" rv-value="obj:value"  class="span2">\
				<option value="space">space</option>\
				<option value="comma">comma</option>\
				<option value="semicolon">semicolon</option>\
			</select>',
		'defaultData': {'value': 'space'}	
	},
	
	'url':{
		'template': '',
		'defaultData': {}
	},
	
	'date': {
		'template':'<span>Format: </span>\
			<select id="dateFormat" rv-value="obj:value" class="span2">\
				<option value="mm/dd/yy">MM/DD/YYYY</option>\
				<option value="dd/mm/yy">DD/MM/YYYY</option>\
				<option value="M. dd, yy">Mon. DD, YYYY</option>\
				<option value="D, M. dd,yy">Day, Mon. DD,YYYY</option>\
			</select>',
		'defaultData': {'value': 'mm/dd/yy'}
	},
	
	'time':{
		'template': '<span>Format: </span>\
		<select id="timeFormat" rv-value="obj:value_format"  class="span2">\
		        <option value="24hours">24 hours</option>\
		        <option value="12hours">12 hours</option>\
		    </select>\
		    <div>\
	        	<input type="checkbox" rv-checked="obj:value_includeSeconds" id="includeSeconds">Include seconds:</input>\
			</div>',
		'defaultData': {'value_format': '24hours','value_includeSeconds':false }

	},
	'list': {
		'template':'<input type="text" placeholder="Enter items separated by a comma" rv-value="obj:value"></input>',
		'defaultData': {'value': ''}
	},

	'boolean':{
		'template':'<span >True = {obj:name} </span>',
		'defaultData': {}
	}

});