define({ template:'[	{	"id":"{{id1}}",\
							"type": "livePageAppletTask",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id5}}", "{{id6}}" ],\
							"data": {"title": "New applet task" , "task_check_type" : "manual", "layoutStyle": "layoutIcon", "top": "0px", "left": "0px", "width": "44px", "height": "44px", "icon": "icon1" }\
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
						{	"id":"{{id4}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "{{appletInstruction}}", "disableDelete":true, "stageReadOnlyMode":true, "width":"100%"}\
						},\
						{	"id":"{{id5}}",\
							"type": "appletAnswer",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": { "disableDelete":true, "isDataCheckable": false}\
						},\
						{	"id":"{{id6}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": ["{{id7}}"],\
							"data": {	"title": "Progress", "num_of_attempts" : "2", "show_hint" : false,\
										"hint_timing" : "1", "on_attempt" : 2, "feedback_type" : "none",\
										"button_label" : "Continue", "disableDelete":true, "score": 1,\
										"feedbacksToDisplay":["all_correct", "partly_correct", "all_incorrect"],\
										"availbleProgressTypes" : [ {"name": "Local", "value": "local"},\
																	{"name":"Generic", "value": "generic"}]}\
						},\
						{	"id":"{{id7}}",\
							"type": "hint",\
							"parent": "{{id6}}",\
							"children": [],\
							"data": {"title": "Hint"}\
						}]'
});