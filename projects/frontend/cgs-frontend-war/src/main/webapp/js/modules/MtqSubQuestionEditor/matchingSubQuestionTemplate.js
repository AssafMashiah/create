define({ template:'[{	"id":"{{id1}}",\
						"type": "mtqSubQuestion",\
						"parent": "{{parentId}}",\
						"children": ["{{id2}}","{{id4}}"],\
						"data": {"title": "mtqSubQuestion", "stageReadOnlyMode":false, "width":"100%"}\
					},\
					{	"id":"{{id2}}",\
						"type": "definition",\
						"parent": "{{id1}}",\
						"children": ["{{id3}}"],\
						"data": {"title": "definition", "disableDelete":true, "width":"100%"}\
					},\
					{	"id":"{{id3}}",\
						"type": "{{definitionType}}",\
						"parent": "{{id2}}",\
						"children": [],\
						"data": {}\
					},\
					{	"id":"{{id4}}",\
						"type": "mtqSubAnswer",\
						"parent": "{{id1}}",\
						"children": ["{{id5}}"],\
						"data": {"title": "mtqSubAnswer", "disableDelete":true, "width":"100%"}\
					},\
					{	"id":"{{id5}}",\
						"type": "{{subAnswerType}}",\
						"parent": "{{id4}}",\
						"children": [],\
						"data":  {}\
					}]',
		definitionChildIndex: 2,
		subAnswerChildIndex: 4

});