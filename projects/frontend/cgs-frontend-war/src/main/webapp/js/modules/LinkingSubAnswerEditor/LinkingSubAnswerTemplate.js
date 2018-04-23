define({ template:'[	{	"id":"{{id1}}",\
							"type": "linkingSubAnswer",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}"],\
							"data": {"title": "linkingSubAnswer", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id2}}",\
							"type": "{{subAnswerType}}",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {}\
						}]',		
		subAnswerChildIndex: 1
});