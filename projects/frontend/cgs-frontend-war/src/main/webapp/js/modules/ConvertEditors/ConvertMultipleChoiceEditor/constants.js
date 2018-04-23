define({
	fields: [
		{
			'name': 'mode',
			'value': 'single_answer'
		},
		{
			'name': 'type',
			'value': 'text'
		},
		{
			'name': 'randomize',
			'value': false
		}
	],

	modes: {
		'single_answer': 'radio',
		'multiple_answers': 'checkbox'
	},

	single_answers_size: 2,
	multiple_answers_size: 3
});