define({ template:'[	{	"id":"{{id1}}",\
							"type": "cloze",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}", "{{id8}}", "{{id5}}"],\
							"data": {"title": "((Fill in the gaps))" , "task_check_type" : "auto"}\
						},\
						{	"id":"{{id2}}",\
							"type": "instruction",\
							"parent": "{{id1}}",\
							"children": ["{{id4}}"],\
							"data": {"title": "", "show":false, "disableDelete":true}\
						},\
						{	"id":"{{id3}}",\
							"type": "question",\
							"parent": "{{id1}}",\
							"children": [],\
							"data": {"title": "Question", "disableDelete":true}\
						},\
						{	"id":"{{id4}}",\
							"type": "textViewer",\
							"parent": "{{id2}}",\
							"children": [],\
							"data": {"title": "{{{clozeInstruction}}}", "styleOverride": "instruction", "disableDelete":true, "stageReadOnlyMode":true, "width":"100%"}\
						},\
						{	"id":"{{id7}}",\
							"type": "cloze_text_viewer",\
							"parent": "{{id8}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "stageReadOnlyMode":false, "width":"100%"}\
						},\
						{	"id":"{{id5}}",\
							"type": "advancedProgress",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}", "{{id9}}"],\
							"data": {"title": "Progress", "num_of_attempts" : "2", "show_hint" : false,\
									"hint_timing" : "1", "feedback_type" : "local",\
									"checking_enabled": true, "score": 1,\
									"button_label" : "Continue", "disableDelete":true,\
									"feedbacksToDisplay" : { "with_bank" : ["all_correct", "all_incorrect", "partly_correct"],\
															 "no_bank" : ["all_correct", "all_incorrect", "partly_correct"]} ,\
									"AdvancedFeedbacksToDisplay": {"with_bank" : ["all_correct", "all_incorrect", "partly_correct"], \
																"no_bank" : ["all_correct", "all_incorrect", "partly_correct"]},\
									"availbleProgressTypes" : [	{"name": "Local", "value": "local"},\
												                {"name":"Basic", "value": "generic"},\
										                        {"name": "Advanced", "value" : "advanced"}]}\
																},\
						{	"id":"{{id6}}",\
							"type": "hint",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Hint"}\
						},\
						{	"id":"{{id9}}",\
							"type": "feedback",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Feedback", "show_partly_correct" : true, "feedbacksToDisplay" : ["all_correct", "all_incorrect", "partly_correct"], "taskType" : "no_bank"}\
						},\
							{"id":"{{id8}}",\
							"type": "cloze_answer",\
							"parent": "{{id1}}",\
							"children": ["{{id7}}"],\
							"data": {\
                                "title": "Answer",\
                                "interaction":"write",\
                                "answerType":"cloze_text_viewer",\
                                "fieldsNum":"multiple",\
                                "fieldsWidth":"longest",\
                                "maxHeight":"firstLevel",\
						        "disableDelete":true}}]'
});