define({ template:'[	{	"id":"{{id1}}",\
							"type": "appletWrapper",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}" ],\
							"data": {"title": "New applet Wrapper", "thumbnail": "{{thumbnail}}"}\
						},\
						{	"id":"{{id2}}",\
							"type": "applet",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"appletId": "{{appletId}}", "appletPath": "{{{appletPath}}}" }\
						}]'
});
