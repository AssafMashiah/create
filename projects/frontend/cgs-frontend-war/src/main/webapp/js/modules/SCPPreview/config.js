define({
	refSequenceTemplate: [
		{
			"type": "sequence",
			"parent": "{{parent}}",
			"children": [
				"{{id2}}"
			],
			"data": {
				"title": "{{seqName}}",
				"type": "simple",
				"exposure": "one_by_one",
				"sharedBefore": false,
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": [],
					"bubbleUp": true
				},
				"selectedStandards": [],
			},
			"id": "{{id1}}",
			"is_modified": false,
			"isCourse": false,
			"convertedData": "<sequence type=\"simple\" id=\"{{id1}}\" cgsversion=\"7.0.27.48\">\n\t\n\n    \n<task exposureid=\"0\" type=\"questionOnly\" id=\"{{id2}}\" check_type=\"manual\" sha1=\"7d640a7a0d0b1e10f24bac7ebe4aad7fff261670\">\n    \n\n    \n<question id=\"{{id5}}\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"{{id6}}\">\n\t    <paragraph><span class=\"normal\">{{breadcrumb}}</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<progress id=\"{{id7}}\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>0</attempts>\n\t<checkable>true</checkable>\n    \n\n\n</progress>\n\n</task>\n</sequence>"
		},
		{
			"id": "{{id2}}",
			"type": "questionOnly",
			"parent": "{{id1}}",
			"children": [
				"{{id3}}",
				"{{id5}}",
				"{{id7}}"
			],
			"data": {
				"title": "New Question Only",
				"task_check_type": "none",
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": []
				},
				"selectedStandards": []
			},
			"isCourse": false,
			"toggleButton": true
		},
		{
			"id": "{{id3}}",
			"type": "instruction",
			"parent": "{{id2}}",
			"children": [
				"{{id4}}"
			],
			"data": {
				"title": "Instruction",
				"show": false,
				"disableDelete": true,
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": [],
					"dontAllowChildren": true,
					"upperComponentMessage": []
				}
			}
		},
		{
			"id": "{{id4}}",
			"type": "textViewer",
			"parent": "{{id3}}",
			"children": [],
			"data": {
				"title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">Click to edit the instruction</div>",
				"mode": "singleStylePlainText",
				"styleOverride": "instruction",
				"disableDelete": true,
				"stageReadOnlyMode": false,
				"width": "100%",
				"availbleNarrationTypes": [
					{
						"name": "None",
						"value": ""
					},
					{
						"name": "General",
						"value": "1"
					}
				],
				"mathfieldArray": {},
				"textEditorStyle": "texteditor cgs",
				"showNarrationType": true
			}
		},
		{
			"id": "{{id5}}",
			"type": "question",
			"parent": "{{id2}}",
			"children": [
				"{{id6}}"
			],
			"data": {
				"title": "Question",
				"disableDelete": true,
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": []
				}
			}
		},
		{
			"type": "textViewer",
			"parent": "{{id5}}",
			"children": [],
			"data": {
				"title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">{{breadcrumb}}</div>",
				"showNarrationType": true,
				"textEditorStyle": "texteditor cgs",
				"width": "100%",
				"mathfieldArray": {},
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": []
				}
			},
			"id": "{{id6}}"
		},
		{
			"id": "{{id7}}",
			"type": "progress",
			"parent": "{{id2}}",
			"children": [
				"{{id8}}"
			],
			"data": {
				"ignore_defaults": "true",
				"title": "Progress",
				"show_hint": false,
				"num_of_attempts": "0",
				"score": 1,
				"hint_timing": "1",
				"feedback_type": "none",
				"button_label": "Continue",
				"disableDelete": true,
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": []
				}
			}
		},
		{
			"id": "{{id8}}",
			"type": "hint",
			"parent": "{{id7}}",
			"children": [],
			"data": {
				"title": "Hint",
				"isValid": true,
				"invalidMessage": {
					"valid": true,
					"report": []
				}
			}
		}
]});