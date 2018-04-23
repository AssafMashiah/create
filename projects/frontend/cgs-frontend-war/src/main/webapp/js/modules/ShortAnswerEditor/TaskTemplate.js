define({ template:'[	{	"id":"{{id1}}",\
							"type": "ShortAnswer",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id4}}","{{id5}}" ],\
							"data": {"title": "New Short Answer" , "task_check_type" : "manual" }\
						},\
						{	"id":"{{id2}}",\
							"type": "instruction",\
							"parent": "{{id1}}",\
							"children": ["{{id7}}"],\
							"data": {"title": "Instruction", "show":false, "disableDelete":true}\
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
							"children": ["{{id8}}"],\
							"data": {"title": "Short Answer Answer", "disableDelete":true, "isSubTask": false, "fieldsNum": "SingleAnswerMode", "answer_type": "student", "mathfield_height":"firstLevel", "has_questions": true, "checkingEnabled": false}\
						},\
						{	"id":"{{id5}}",\
							"type": "advancedProgress",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}", "{{id9}}"],\
							"data": {"title": "Progress", "num_of_attempts" : "2", "show_hint" : false,\
									"hint_timing" : "1", "feedback_type" : "local",\
									"checking_enabled": false,\
									"button_label" : "Continue", "disableDelete":true,\
									"feedbacksToDisplay" : { "single" :["all_correct", "all_incorrect", "partly_correct"],\
															 "multiple" : ["all_correct", "all_incorrect", "partly_correct"]},\
									"AdvancedFeedbacksToDisplay": {"multiple" : ["all_correct", "missing_item", "partly_correct_more_80", "partly_correct_less_80", "partly_correct_missing_item", "all_incorrect"]},\
									"availbleProgressTypes" : [	{"name": "Local", "value": "local"},\
																{"name":"Generic", "value": "generic"}]}\
						},\
						{	"id":"{{id6}}",\
							"type": "hint",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Hint"}\
						},\
						{	"id":"{{id7}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "{{{shortAnswerInstruction}}}", "styleOverride": "instruction",\
								"disableDelete":true, "stageReadOnlyMode":true}\
						},\
						{	"id":"{{id8}}",\
							"type": "textEditor",\
							"parent": "{{id4}}",\
							"children": [],\
							"data": {"ignore_defaults": true, "title": "","MaxChars": 15, "ShowToolbar": false, "disabledMaxChars": true,\
									"disabledShowToolbar": true, "MathFieldKeyboard": false, "disableDelete":true,\
									"answer_size": "Word","displayFieldSize":true,\
									"allowedSizes": [{ "value": "Letter", "text": "Letter" },\
                    								 { "value": "Word", "text": "Word" },\
                    								 { "value": "Line", "text": "Line" }]\
                			}\
                		},\
                		{	"id":"{{id9}}",\
							"type": "feedback",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Feedback", "show_partly_correct" : true,\
								"feedbacksToDisplay" :\
									["all_correct", "all_incorrect", "partly_correct"],\
								"taskType" : "single"}\
                		}]'
});