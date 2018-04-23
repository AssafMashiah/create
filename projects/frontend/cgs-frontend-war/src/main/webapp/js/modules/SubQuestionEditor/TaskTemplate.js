define({ template:'[{	"id":"{{id1}}",\
						"type": "textViewer",\
						"parent": "{{parentId}}",\
						"children": [],\
						"data": {"title": "", "styleOverride": "subQuestion", "disableDelete":true,\
						"availbleNarrationTypes" :[{"name": "None", "value": ""},\
												{"name":"General", "value": "1"}]}\
					},\
					{	"id":"{{id2}}",\
						"type": "{{subAnswerType}}",\
						"parent": "{{parentId}}",\
						"children": [],\
						"data":{}\
					}]'
});