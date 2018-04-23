define({ template:'[	{	"id":"{{id1}}",\
							"type": "livePageAppletWrapper",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}" ],\
							"data": { "title": "New applet Wrapper", "thumbnail": "{{thumbnail}}", "layoutStyle": "layoutIcon", "top": "0px", "left": "0px", "width": "44px", "height": "44px", "icon": "icon1" }\
						},\
						{	"id":"{{id2}}",\
							"type": "applet",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"appletId": "{{appletId}}", "appletPath": "{{{appletPath}}}" }\
						}]'
});
