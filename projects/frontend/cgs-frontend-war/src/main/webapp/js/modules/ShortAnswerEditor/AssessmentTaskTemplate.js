define({ template:'[	{	"id":"{{id1}}",\
							"type": "ShortAnswer",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id4}}","{{id5}}" ],\
							"data": {"title": "New Short Answer" , "task_check_type" : "auto"}\
						},\
						{	"id":"{{id2}}",\
							"type": "instruction",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}"],\
							"data": {"title": "Instruction", "show":"true", "disableDelete":true}\
						},\
						{	"id":"{{id3}}",\
							"type": "question",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Question", "disableDelete":true}\
						},\
						{	"id":"{{id4}}",\
							"type": "ShortAnswerAnswer",\
							"parent": "{{id1}}",\
							"children": ["{{id7}}"],\
							"data": {"title": "Short Answer Answer", "disableDelete":true, "isSubTask": false, "fieldsNum": "SingleAnswerMode", "answer_type": "student", "mathfield_height":"secondLevel", "has_questions": true, "checkingEnabled": true}\
						},\
						{	"id":"{{id5}}",\
							"type": "advancedProgress",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Progress", "score":1, "checking_enabled": true,\
									"button_label" : "Continue", "disableDelete":true}\
						},\
						{	"id":"{{id6}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "{{{shortAnswerInstruction}}}","styleOverride": "instruction",\
								"disableDelete":true, "stageReadOnlyMode":true}\
						},\
						{	"id":"{{id7}}",\
							"type": "AnswerFieldTypeText",\
							"parent": "{{id4}}",\
							"children": [],\
							"data":{ "title": "", "hideFieldHint" : true, "MaxChars": 15,\
									 "ShowToolbar": false, "disabledMaxChars": true,\
									"disabledShowToolbar": true, "MathFieldKeyboard": false,\
									"disableDelete":true, "answer_size": "Word", "displayFieldSize":true,\
									"mode": "plain",\
									"allowedSizes":[{ "value": "Letter", "text": "Letter" },\
										{ "value": "Word", "text": "Word" },\
										{ "value": "Line", "text": "Line" }\
									]}\
                		}]'
});