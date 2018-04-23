define({ template:'[	{	"id":"{{id1}}",\
							"type": "selfCheck",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id4}}","{{id5}}"],\
							"data": {"title": "New Self Check" , "task_check_type" : "none"}\
						}, \
						{	"id":"{{id2}}",\
							"type": "title",\
							"parent": "{{id1}}",\
							"children": ["{{id3}}"],\
							"data": {"title": "title", "disableDelete":true, "show": true}\
						},\
						{	"id":"{{id3}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "((Add a title))", "styleOverride": "selfcheckTitle", "disableDelete":true, "mode": "singleStyle"}\
						},\
						{	"id":"{{id4}}",\
							"type": "question",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Question", "disableDelete":true}\
						},\
						{	"id":"{{id5}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {\
							    "ignore_defaults" : "true",\
								"title": "Progress",\
								"show_hint": false,\
								"button_label": "Continue",\
								"disableDelete": true,\
								"num_of_attempts" : "0",\
								"hint_timing": 1 }\
						}]'
});