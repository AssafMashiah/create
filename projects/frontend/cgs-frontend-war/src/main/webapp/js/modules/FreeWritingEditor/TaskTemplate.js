define({ template:'[	{	"id":"{{id1}}",\
							"type": "FreeWriting",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id4}}","{{id5}}" ],\
							"data": {"title": "New Free Writing" , "task_check_type" : "manual"}\
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
							"type": "FreeWritingAnswer",\
							"parent": "{{id1}}",\
							"children": ["{{id8}}"],\
							"data": {"title": "Free Writing Answer", "disableDelete":true, "has_questions": true}\
						},\
						{	"id":"{{id5}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}"],\
							"data": {"ignore_defaults": "true", "title": "Progress", "show_hint" : false, "button_label" : "Continue",\
									"feedback_type" : "none", "disableDelete":true, "hint_timing": 1, "showOnlyAlways": true	}\
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
							"data": {"title": "{{{freeWritingInstruction}}}", "styleOverride": "instruction", "disableDelete":true, "stageReadOnlyMode":true}\
						},\
						{	"id":"{{id8}}",\
							"type": "textEditor",\
							"parent": "{{id4}}",\
							"children": [],\
							"data": {\
								"title": "Free Writing Answer TextViewer",\
								"disableDelete":true,\
								"answer_size": "Paragraph",\
								"MaxChars": "150",\
								"ShowToolbar": "true",\
								"allowedSizes": [ \
	                    			{ "value": "Line", "text": "Line" },\
	                    			{ "value": "Paragraph", "text": "Paragraph" },\
	                    			{ "value": "FullText", "text": "Full Text" }\
	                			]}\
						}]'
});