define({ template:'[	{	"id":"{{id1}}",\
							"type": "mc",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id8}}","{{id5}}" ],\
							"data": {"title": "New Multiple Choice" , "task_check_type" : "auto" }\
						},\
						{	"id":"{{id2}}",\
							"type": "instruction",\
							"parent": "{{id1}}",\
							"children": ["{{id4}}"],\
							"data": {"title": "Instruction", "show":false, "disableDelete":true}\
						},\
						{	"id":"{{id3}}",\
							"type": "question",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Question", "disableDelete":true}\
						},\
						{	"id":"{{id8}}",\
							"type": "mcAnswer",\
							"parent": "{{id1}}",\
							"children": ["{{id9}}","{{id11}}"],\
							"data": {"title": "Answer", "disableDelete":true, "answerMode": "mc", "optionsType": "textViewer"}\
						},\
						{	"id":"{{id9}}",\
							"type": "option",\
							"parent": "{{id8}}",\
							"children": ["{{id10}}"],\
							"data": {"title": "option", "correct" : false}\
						},\
						{	"id":"{{id10}}",\
							"type": "textViewer",\
							"parent": "{{id9}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "mode" : "singleStyle",\
									 "availbleNarrationTypes" :[{"name": "None", "value": ""},\
																{"name":"General", "value": "1"}]}\
						},\
						{	"id":"{{id11}}",\
							"type": "option",\
							"parent": "{{id8}}",\
							"children": ["{{id12}}"],\
							"data": {"title": "option", "correct":false}\
						},\
						{	"id":"{{id12}}",\
							"type": "textViewer",\
							"parent": "{{id11}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "mode" : "singleStyle",\
									 "availbleNarrationTypes" :[{"name": "None", "value": ""},\
																{"name":"General", "value": "1"}]}\
						},\
						{	"id":"{{id4}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "{{{mcInstruction}}}", "styleOverride": "instruction", "disableDelete":true, "stageReadOnlyMode":true}\
						},\
						{	"id":"{{id5}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}","{{id7}}"],\
							"data": {	"title": "Progress", "num_of_attempts" : "2", "show_hint" : false, "hint_timing" : "1",\
										"on_attempt" : 2, "feedback_type" : "local", "button_label" : "Check", "disableDelete":true,\
										"feedbacksToDisplay" : {"mc" :["all_correct", "all_incorrect"], "mmc" : ["all_correct", "all_incorrect", "partly_correct"]} ,\
										"AdvancedFeedbacksToDisplay": {"mc" : ["all_correct", "all_incorrect"], \
																	   "mmc" : ["all_correct", "missing_item", "partly_correct_missing_item",\
																	   "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong", "all_incorrect"]},\
										"availbleProgressTypes" : [	{"name": "Local", "value": "local"},\
																	{"name":"Generic", "value": "generic"},\
																	{"name": "Generic and Specific", "value" : "advanced"}]}\
						},\
						{	"id":"{{id6}}",\
							"type": "hint",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Hint"}\
						},\
						{	"id":"{{id7}}",\
							"type": "feedback",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Feedback", "show_partly_correct" : true, "feedbacksToDisplay" : ["all_correct", "all_incorrect"], "taskType" : "mc"}\
						}]'
});