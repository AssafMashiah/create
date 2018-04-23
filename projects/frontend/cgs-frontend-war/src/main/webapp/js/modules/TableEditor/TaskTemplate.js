define({ template:'[	{	"id":"{{id1}}",\
							"type": "tableRow",\
							"parent": "{{parentId}}",\
							"children": ["{{id3}}","{{id4}}"],\
							"data": {"disableDelete":true, "stageReadOnlyMode": true}\
						},\
						{	"id":"{{id3}}",\
							"type": "tableCell",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"disableDelete":true, "childType": "None"}\
						},\
						{	"id":"{{id4}}",\
							"type": "tableCell",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"disableDelete":true, "childType": "None"}\
						},\
						{	"id":"{{id2}}",\
							"type": "tableRow",\
							"parent": "{{parentId}}",\
							"children": ["{{id5}}","{{id6}}"],\
							"data": {"disableDelete":true, "stageReadOnlyMode": true}\
						},\
						{	"id":"{{id5}}",\
							"type": "tableCell",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"disableDelete":true, "childType": "None"}\
						},\
						{	"id":"{{id6}}",\
							"type": "tableCell",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"disableDelete":true, "childType": "None"}\
						}]'
});