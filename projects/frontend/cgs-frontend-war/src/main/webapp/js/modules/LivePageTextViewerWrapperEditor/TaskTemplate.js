define({ template:'[	{	"id":"{{id1}}",\
							"type": "livePageTextViewerWrapper",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}" ],\
							"data": { "title": "New textviewer Wrapper", "top": "0px", "left": "0px" }\
						},\
						{	"id":"{{id2}}",\
							"type": "textViewer",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": { "title": "", "showNarrationType": true, "textEditorStyle": "texteditor", "width": "100%", "mode": "noInfoBaloon", "disableDelete": true}\
						}]'
});
