define({ template:'[	{	"id":"{{id1}}",\
							"type": "separator",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id5}}"],\
							"data": {"title": "((New separator))" ,"showImage" : true, "showTitle":true, "showSubTitle" : true}\
						}, \
						{	"id":"{{id2}}",\
							"type": "imageViewer",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"disableDelete":true, "dontInputCaption" : true, "dontInputSound": true}\
						},\
						{	"id":"{{id3}}",\
							"type": "genericTitle",\
							"parent": "{{id1}}",\
							"children": ["{{id4}}"],\
							"data": {"title": "title", "disableDelete":true}\
						},\
						{	"id":"{{id4}}",\
							"type": "textViewer",\
							"parent": "{{id3}}",\
							"children": [],\
							"data": {"title": "((Enter a title))", "disableDelete":true, "mode" : "singleStylePlainText", "styleOverride": "separatorTitle", "availbleNarrationTypes" :[ {"name": "None", "value": ""},{"name":"General", "value": "1"}]}\
						},\
						{	"id":"{{id5}}",\
							"type": "genericSubTitle",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}"],\
							"data": {"title": "title", "disableDelete":true}\
						},\
						{	"id":"{{id6}}",\
							"type": "textViewer",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "((Enter a subtitle))", "disableDelete":true, "mode" : "singleStylePlainText", "styleOverride": "separatorSubTitle", "availbleNarrationTypes" :[ {"name": "None", "value": ""},{"name":"General", "value": "1"}]}\
						}]'
});