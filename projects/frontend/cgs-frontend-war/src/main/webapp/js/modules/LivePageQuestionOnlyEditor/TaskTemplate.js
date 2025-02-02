define({ template:'[	{	"id":"{{id1}}",\
							"type": "livePageQuestionOnly",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id5}}" ],\
							"data": {"title": "New Question Only" , "task_check_type" : "none", "layoutStyle": "layoutIcon", "top": "0px", "left": "0px", "width": "44px", "height": "44px" }\
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
							"data": {"title": "((Click to edit the instruction))", "disableDelete":true, "stageReadOnlyMode":false, "width":"100%"}\
						},\
						{	"id":"{{id5}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}"],\
							"data": {"ignore_defaults" : "true", "title": "Progress", \
							        "show_hint" : false, "num_of_attempts" : "0", "score": 1,\
									"hint_timing" : "1", "feedback_type" : "none",\
									"button_label" : "Continue", "disableDelete":true}\
						},\
						{	"id":"{{id6}}",\
							"type": "hint",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Hint"}\
						}]'
});