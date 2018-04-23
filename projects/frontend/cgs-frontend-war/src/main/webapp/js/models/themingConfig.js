define({
	'iw_IL' :{
		'interactive_sequence':
			[
				{
					'area': 'task',
					'properties':[
						{
							'label': 'number_position',
							'type': 'dropDown',
							'values': ["line_side", "below_line"],
							'default': "line_side"
						},
						{
							'label': 'number_font',
							'type':'font',
							'default':"defaultLocaleFont"
						},
						{
							'label' : 'numbering_color',
							'type': 'color',
							'default' : '#6A597A'
						},
						{
							'label': 'number_shape',
							'type': 'dropDown',
							'values': ["none","circle", "rectangle"],
							'default': "none",
							'binding':[{	'labels' : ['numbering_background'],
											'action':'hide',
											'value' :['none']
										},
										{	'labels' : ['numbering_background'],
											'action':'show',
											'value' :["circle", "rectangle"]
										}]
						},
						{
							'label' : 'numbering_background',
							'type': 'color',
							'default' : '#FFFFFF'
						},
						{
							'label': 'numbering_size',
							'type' : 'number',
							'values' : { 'min': 12, 'max' : 32},
							'default' : 27
						},
						{
							'label': 'children_order',
							'type': 'dropDown',
							'values': [["title", "instruction", "question", "answer", "progress"], ["title", "question", "instruction", "answer", "progress"]],
							'default': ["title", "instruction", "question", "answer", "progress"]
						},
						{
							'label': 'unexposed_style',
							'type': 'dropDown',
							'values': ["regular", "none"],
							'default': "regular",
							'binding':[{	'labels' : ['unexposed_color','unexposed_opacity'],
											'action':'hide',
											'value' :['regular']
										},
										{	'labels' : ['unexposed_color','unexposed_opacity'],
											'action':'show',
											'value' :['none']
										}]
						},
						{
							'label': 'unexposed_color',
							'type': 'color',
							'default': "#FFFFFF"
						},
						{
							'label': 'unexposed_opacity',
							'type': 'range',
							'values': {'min':0, 'max':1, 'step':0.1, 'startLabel':'transparent','endLabel':'opaque'},
							'default': 1
						}
					]
				},
				{
					'area' : 'progress',
					'properties' : [
						{
							'label': 'feedback_font',
							'type': 'font',
							'default': 'defaultLocaleFont'
						},
						{
							'label': 'hint_font',
							'type': 'font',
							'default': 'defaultLocaleFont'
						},
						{
							'label': 'progress_background',
							'type': 'color',
							'default': '#6A597A'
						},
						{
							'label': 'progress_font',
							'type': 'font',
							'default': 'Arial'
						}
					]
				},
				{
					'area':'header',
					'properties' :[
						{
							'label': 'internal_spcaing',
							'type': 'number',
							'values': {'min':0, 'max':99},
							'default': 10
						}
					]
				},
				{
					'area':'mc',
					'properties' :[
						{
							'label': 'option_template',
							'type': 'dropDown',
							'values': ["normal", "center"],
							'default': "normal"
						},
						{
							'label': 'option_color',
							'type': 'color',
							'default': "#5183AB"
						},
						{
							'label': 'active_color',
							'type': 'color',
							'default': "#EB7A1A"
						},
						{
							'label': 'correct_color',
							'type': 'color',
							'default': "#20B747"
						},
						{
							'label': 'incorrect_color',
							'type': 'color',
							'default': "#F7374A"
						},
						{
							'label': 'disabled_color',
							'type': 'color',
							'default': "#CCCCCC"
						},
						{
							'label': 'hover_color',
							'type': 'color',
							'default': "#4CC4FF"
						},
						{
							'label': 'show_answer_color',
							'type': 'color',
							'default': "#20B747"
						}
					]
				},
				{
					'area':'mtq',
					'properties' :[
						{
							'label': 'answer_color',
							'type': 'color',
							'default': "#5488AD"
						},
						{
							'label': 'active_color',
							'type': 'color',
							'default': "#EB7A1A"
						},
						{
							'label': 'correct_color',
							'type': 'color',
							'default': "#20B747"
						},
						{
							'label': 'incorrect_color',
							'type': 'color',
							'default': "#F7374A"
						},
						{
							'label': 'disabled_color',
							'type': 'color',
							'default': "#CCCCCC"
						},
						{
							'label': 'hover_color',
							'type': 'color',
							'default': "#4CC4FF"
						},
						{
							'label': 'show_answer_color',
							'type': 'color',
							'default': "#20B747"
						},
						{
							'label':'answer_area_background',
							'type' : 'color',
							'default': '#DFE7F0'
						},
						{
							'label': 'bank_style',
							'type': 'dropDown',
							'values': ["regular", "none"],
							'default': "regular",
							'binding':[{	'labels' : ['bank_background','bank_border'],
											'action':'hide',
											'value' :['regular']
										},
										{	'labels' : ['bank_background','bank_border'],
											'action':'show',
											'value' :['none']
										}]
						},
						{
							'label':'bank_border',
							'type':'color',
							'default':"#CFCFCF"
						},
						{
							'label':'bank_background',
							'type':'color',
							'default' : '#DEEEF5'
						}
					]
				},
				{
					'area':'cloze',
					'properties' :[
						{
							'label': 'answer_field_border_color',
							'type': 'color',
							'default': "#cfcfcf"
						},
						{
							'label': 'bank_style',
							'type': 'dropDown',
							'values': ["regular", "none"],
							'default': "regular",
							'binding':[{	'labels' : ['bank_background','bank_border'],
											'action':'hide',
											'value' :['regular']
										},
										{	'labels' : ['bank_background','bank_border'],
											'action':'show',
											'value' :["none"]
										}]
						},
						{
							'label':'bank_border',
							'type':'color',
							'default':"#CFCFCF"
						},
						{
							'label':'bank_background',
							'type':'color',
							'default' : '#DEEEF5'
						}
					]
				},
				{
					'area':'open_question',
					'properties':[
						{
							'label':'opq_border',
							'type':'color',
							'default': '#B3B3B3'
						},
						{
							'label':'opq_background',
							'type':'color',
							'default':'#FFFFFF'
						}
					]

				}
			]
	},
	'default':{
		'interactive_sequence':
			[
				{
					'area': 'task',
					'properties':[
						{
							'label': 'number_position',
							'type': 'dropDown',
							'values': ["line_side", "below_line"],
							'default': "line_side"
						},
						{
							'label': 'number_font',
							'type':'font',
							'default':"defaultLocaleFont"
						},
						{
							'label' : 'numbering_color',
							'type': 'color',
							'default' : '#6A597A'
						},
						{
							'label': 'number_shape',
							'type': 'dropDown',
							'values': ["none","circle", "rectangle"],
							'default': "none",
							'binding':[{	'labels' : ['numbering_background'],
											'action':'hide',
											'value' :['none']
										},
										{	'labels' : ['numbering_background'],
											'action':'show',
											'value' :["circle", "rectangle"]
										}]
						},
						{
							'label' : 'numbering_background',
							'type': 'color',
							'default' : '#FFFFFF'
						},
						{
							'label': 'numbering_size',
							'type' : 'number',
							'values' : { 'min': 12, 'max' : 32},
							'default' : 27
						},
						{
							'label': 'children_order',
							'type': 'dropDown',
							'values': [["title", "instruction", "question", "answer", "progress"], ["title", "question", "instruction", "answer", "progress"]],
							'default': ["title", "instruction", "question", "answer", "progress"]
						},
						{
							'label': 'unexposed_style',
							'type': 'dropDown',
							'values': ["regular", "none"],
							'default': "regular",
							'binding':[{	'labels' : ['unexposed_color','unexposed_opacity'],
											'action':'hide',
											'value' :['regular']
										},
										{	'labels' : ['unexposed_color','unexposed_opacity'],
											'action':'show',
											'value' :['none']
										}]
						},
						{
							'label': 'unexposed_color',
							'type': 'color',
							'default': "#FFFFFF"
						},
						{
							'label': 'unexposed_opacity',
							'type': 'range',
							'values': {'min':0, 'max':1, 'step':0.1, 'startLabel':'transparent','endLabel':'opaque'},
							'default': 1
						}
					]
				},
				{
					'area' : 'progress',
					'properties' : [
						{
							'label': 'feedback_font',
							'type': 'font',
							'default': 'defaultLocaleFont'
						},
						{
							'label': 'hint_font',
							'type': 'font',
							'default': 'defaultLocaleFont'
						},
						{
							'label': 'progress_background',
							'type': 'color',
							'default': '#6A597A'
						},
						{
							'label': 'progress_font',
							'type': 'font',
							'default': 'defaultLocaleFont'
						}
					]
				},
				{
					'area':'header',
					'properties' :[
						{
							'label': 'internal_spcaing',
							'type': 'number',
							'values': {'min':0, 'max':99},
							'default': 10
						}
					]
				},
				{
					'area':'mc',
					'properties' :[
						{
							'label': 'option_template',
							'type': 'dropDown',
							'values': ["normal", "center"],
							'default': "normal"
						},
						{
							'label': 'option_color',
							'type': 'color',
							'default': "#5183AB"
						},
						{
							'label': 'active_color',
							'type': 'color',
							'default': "#EB7A1A"
						},
						{
							'label': 'correct_color',
							'type': 'color',
							'default': "#20B747"
						},
						{
							'label': 'incorrect_color',
							'type': 'color',
							'default': "#F7374A"
						},
						{
							'label': 'disabled_color',
							'type': 'color',
							'default': "#CCCCCC"
						},
						{
							'label': 'hover_color',
							'type': 'color',
							'default': "#4CC4FF"
						},
						{
							'label': 'show_answer_color',
							'type': 'color',
							'default': "#20B747"
						}
					]
				},
				{
					'area':'mtq',
					'properties' :[
						{
							'label': 'answer_color',
							'type': 'color',
							'default': "#5488AD"
						},
						{
							'label': 'active_color',
							'type': 'color',
							'default': "#EB7A1A"
						},
						{
							'label': 'correct_color',
							'type': 'color',
							'default': "#20B747"
						},
						{
							'label': 'incorrect_color',
							'type': 'color',
							'default': "#F7374A"
						},
						{
							'label': 'disabled_color',
							'type': 'color',
							'default': "#CCCCCC"
						},
						{
							'label': 'hover_color',
							'type': 'color',
							'default': "#4CC4FF"
						},
						{
							'label': 'show_answer_color',
							'type': 'color',
							'default': "#20B747"
						},
						{
							'label':'answer_area_background',
							'type' : 'color',
							'default': '#DFE7F0'
						},
						{
							'label': 'bank_style',
							'type': 'dropDown',
							'values': ["regular", "none"],
							'default': "regular",
							'binding':[{	'labels' : ['bank_background','bank_border'],
											'action':'hide',
											'value' :['regular']
										},
										{	'labels' : ['bank_background','bank_border'],
											'action':'show',
											'value' :['none']
										}]
						},
						{
							'label':'bank_border',
							'type':'color',
							'default':"#CFCFCF"
						},
						{
							'label':'bank_background',
							'type':'color',
							'default' : '#DEEEF5'
						}
					]
				},
				{
					'area':'cloze',
					'properties' :[
						{
							'label': 'answer_field_border_color',
							'type': 'color',
							'default': "#cfcfcf"
						},
						{
							'label': 'bank_style',
							'type': 'dropDown',
							'values': ["regular", "none"],
							'default': "regular",
							'binding':[{	'labels' : ['bank_background','bank_border'],
											'action':'hide',
											'value' :['regular']
										},
										{	'labels' : ['bank_background','bank_border'],
											'action':'show',
											'value' :["none"]
										}]
						},
						{
							'label':'bank_border',
							'type':'color',
							'default':"#CFCFCF"
						},
						{
							'label':'bank_background',
							'type':'color',
							'default' : '#DEEEF5'
						}
					]
				},
				{
					'area':'open_question',
					'properties':[
						{
							'label':'opq_border',
							'type':'color',
							'default': '#B3B3B3'
						},
						{
							'label':'opq_background',
							'type':'color',
							'default':'#FFFFFF'
						}
					]

				}
			]
	}
});