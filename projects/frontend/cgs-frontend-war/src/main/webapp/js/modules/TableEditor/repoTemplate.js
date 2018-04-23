define({ rowTemplate: '[{	"id":"{{id1}}",\
							"type": "tableRow",\
							"parent": "{{parentId}}",\
							"children": [],\
							"data": {"disableDelete":true, "stageReadOnlyMode": true}\
						}]',
		cellTemplate: '[{	"id":"{{id1}}",\
							"type": "tableCell",\
							"parent": "{{parentId}}",\
							"children": [],\
							"data": {"disableDelete":true, "childType": "None"}\
						}]'


});