define({ template:'[\
	{	"id":"{{id1}}",\
		"type": "linking_area",\
		"parent": "{{parentId}}",\
		"children": ["{{id2}}", "{{id3}}"],\
		"data": {"disableDelete": true , "stageReadOnlyMode": true}\
	}, \
	{	"id":"{{id2}}",\
		"type": "linking_pair",\
		"parent": "{{id1}}",\
		"children": ["{{id4}}", "{{id5}}"],\
		"data": {"definitionTypeId": "{{id4}}", "answerTypeId": "{{id5}}", "disableDelete": true , "stageReadOnlyMode": true}\
	}, \
	{	"id":"{{id3}}",\
		"type": "linking_pair",\
		"parent": "{{id1}}",\
		"children": ["{{id6}}", "{{id7}}"],\
		"data": {"definitionTypeId": "{{id6}}", "answerTypeId": "{{id7}}", "disableDelete": true, "stageReadOnlyMode": true}\
	}, \
	{	"id":"{{id4}}",\
		"type": "textViewer",\
		"parent": "{{id1}}",\
		"children": [],\
		"data": {"title": "", "disableDelete":true, "width":"99%"}\
	}, \
	{	"id":"{{id5}}",\
		"type": "textViewer",\
		"parent": "{{id1}}",\
		"children": [],\
		"data": {"title": "", "disableDelete":true, "width":"99%"}\
	}, \
	{	"id":"{{id6}}",\
		"type": "textViewer",\
		"parent": "{{id2}}",\
		"children": [],\
		"data": {"title": "", "disableDelete":true, "width":"99%"}\
	}, \
	{	"id":"{{id7}}",\
		"type": "textViewer",\
		"parent": "{{id2}}",\
		"children": [],\
		"data": {"title": "", "disableDelete":true, "width":"99%"}\
	}]'
});