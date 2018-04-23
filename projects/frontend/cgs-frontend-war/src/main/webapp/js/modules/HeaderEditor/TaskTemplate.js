define({ template:'[	{	"id":"{{id1}}",\
							"type": "header",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id4}}"],\
							"data": {"title": "New header" , "task_check_type" : "none", "showGenericTitle":true, "showGenericSubTitle" : true}\
						}, \
						{	"id":"{{id2}}",\
							"type": "genericTitle",\
							"parent": "{{id1}}",\
							"children": ["{{id3}}"],\
							"data": {"title": "title", "disableDelete":true}\
						},\
						{	"id":"{{id3}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "((Enter a title))", "disableDelete":true, "mode" : "singleStyleNoInfoBaloon", "styleOverride": "sequenceTitle", "availbleNarrationTypes" :[ {"name": "None", "value": ""},{"name":"General", "value": "1"}]}\
						},\
						{	"id":"{{id4}}",\
							"type": "genericSubTitle",\
							"parent": "{{id1}}",\
							"children": ["{{id5}}"],\
							"data": {"title": "title", "disableDelete":true}\
						},\
						{	"id":"{{id5}}",\
							"type": "textViewer",\
							"parent": "{{id4}}",\
							"children": [],\
							"data": {"title": "((Enter instructions))", "disableDelete":true, "mode" : "singleStyleNoInfoBaloon", "styleOverride": "sequenceSubTitle", "availbleNarrationTypes" :[ {"name": "None", "value": ""},{"name":"General", "value": "1"}]}\
						}]'
});