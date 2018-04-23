define({ template:'[	{	"id":"{{id1}}",\
							"type": "mtqSubAnswer",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}"],\
							"data": {"title": "mtqSubAnswer", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id2}}",\
							"type": "{{subAnswerType}}",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {}\
						}]',		
		subAnswerChildIndex: 1
});