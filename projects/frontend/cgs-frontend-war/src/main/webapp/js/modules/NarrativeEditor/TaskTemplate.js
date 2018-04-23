define({ template:'[	{	"id":"{{id1}}",\
							"type": "narrative",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}", "{{id3}}"],\
							"data": {"title": "New narrative" , "task_check_type" : "none"}\
						}, \
						{	"id":"{{id2}}",\
							"type": "question",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Question", "disableDelete":true}\
						},\
						{	"id":"{{id3}}",\
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