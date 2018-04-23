define({ template:'[	{	"id":"{{id1}}",\
							"type": "mc",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id5}}","{{id10}}" ],\
							"data": {"title": "New Multiple Choice", "task_check_type" : "auto" }\
						},\
						{	"id":"{{id2}}",\
							"type": "instruction",\
							"parent": "{{id1}}",\
							"children": ["{{id4}}"],\
							"data": {"title": "Instruction", "show":"true", "disableDelete":true}\
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
							"data": {"title": "{{{mcInstruction}}}", "styleOverride": "instruction", "disableDelete":true, "stageReadOnlyMode":true}\
						},\
						{	"id":"{{id5}}",\
							"type": "mcAnswer",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}","{{id8}}"],\
							"data": {"title": "Answer", "disableDelete":true, "answerMode": "mc",\
								"optionsType": "textViewer"}\
						},\
						{	"id":"{{id6}}",\
							"type": "option",\
							"parent": "{{id5}}",\
							"children": ["{{id7}}"],\
							"data": {"title": "option", "correct" : false}\
						},\
						{	"id":"{{id7}}",\
							"type": "textViewer",\
							"parent": "{{id6}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "mode" : "singleStyle",\
										"availbleNarrationTypes" :[{"name": "None", "value": ""},\
																{"name":"General", "value": "1"}]}\
						},\
						{	"id":"{{id8}}",\
							"type": "option",\
							"parent": "{{id5}}",\
							"children": ["{{id9}}"],\
							"data": {"title": "option", "correct":false}\
						},\
						{	"id":"{{id9}}",\
							"type": "textViewer",\
							"parent": "{{id8}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "mode" : "singleStyle",\
										"availbleNarrationTypes" :[{"name": "None", "value": ""},\
																{"name":"General", "value": "1"}]}\
						},\
						{	"id":"{{id10}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {	"title": "Progress",\
										"button_label" : "Continue", "disableDelete":true, "score":1}\
						}]'
});