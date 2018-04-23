define(function() {

	return function f557() {
		return {
			new_course: {
				'type': 'course',
				'parent': null,
				'children': [],
				'data': {
					'title': require('translate').tran('New Course'),
					'maxDepth': '3',
					'references': [],
					// required
					'author': '',
					'cgsVersion': '0.1.23',
					'publisher': '1',
					'version': '1.0.0',
					'includeLo': true,
					'format': 'NATIVE'

				}
			},

			reference_template: '<li><a href="{{path}}" target="_blank">{{fileName}}</a></li>'
		};
	}
});
