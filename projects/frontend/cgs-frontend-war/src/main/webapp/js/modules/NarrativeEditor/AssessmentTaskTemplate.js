define({ template:'[	{	"id":"{{id1}}",\
							"type": "narrative",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}"],\
							"data": {"title": "New narrative" , "task_check_type" : "none"}\
						}, \
						{	"id":"{{id2}}",\
							"type": "assessment_question",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Question", "disableDelete":true}\
						}]'
});