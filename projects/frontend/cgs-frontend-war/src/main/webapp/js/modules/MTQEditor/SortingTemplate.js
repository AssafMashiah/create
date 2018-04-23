define({ template:'[	{	"id":"{{id1}}",\
							"type": "sorting",\
							"parent": "{{parentId}}",\
							"children": ["{{id2}}","{{id3}}","{{id8}}","{{id5}}"],\
							"data": {"title": "New mtq sorting editor" , "task_check_type" : "auto"}\
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
							"data": {"title": "{{{sortingInstruction}}}", "styleOverride": "instruction", "disableDelete":true, "stageReadOnlyMode":true, "width":"100%"}\
						},\
						{	"id":"{{id5}}",\
							"type": "progress",\
							"parent": "{{id1}}",\
							"children": ["{{id6}}", "{{id7}}"],\
							"data": {"title": "Progress", "num_of_attempts" : "2", "show_hint" : false, "hint_timing" : "1", "score": 1,\
									 "on_attempt" : 2, "feedback_type" : "local", "button_label" : "Check", "disableDelete":true,\
									"feedbacksToDisplay" : ["all_correct", "all_incorrect", "partly_correct"],\
									"AdvancedFeedbacksToDisplay" : ["all_correct", "all_incorrect", "missing_item", "partly_correct_missing_item",\
									"partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong"],\
									"availbleProgressTypes" : [	{"name": "Local", "value": "local"},\
																{"name":"Basic", "value": "generic"},\
																{"name": "Advanced", "value" :"advanced"}]}\
						},\
						{	"id":"{{id6}}",\
							"type": "hint",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Hint"}\
						},\
						{	"id":"{{id7}}",\
							"type": "feedback",\
							"parent": "{{id5}}",\
							"children": [],\
							"data": {"title": "Feedback", "show_partly_correct" : true,\
							 "feedbacksToDisplay" : ["all_correct", "all_incorrect", "partly_correct"]}\
						},\
						{	"id":"{{id8}}",\
							"type": "sortingAnswer",\
							"parent": "{{id1}}",\
							"children": ["{{id9}}"],\
							"data": {"title": "sortingAnswer", "useBank":false, "mtqMode": "one_to_one", "placeHolder": true, "answerType":"textViewer", "definitionType":"textViewer", "disableDelete":true, "stageReadOnlyMode":false, "width":"100%" , "interaction_type": "drag_and_drop"}\
						},\
						{	"id":"{{id9}}",\
							"type": "mtqArea",\
							"parent": "{{id8}}",\
							"children": ["{{id10}}","{{id16}}"],\
							"data": {"title": "MtqArea", "useBank":false, "mtqAnswerType":"sortingAnswer", "hasMultiSubAnswers":true, "disableDelete":true, "width":"100%" , "answerType":"textViewer", "definitionType":"textViewer"}\
						},\
						{	"id":"{{id10}}",\
							"type": "mtqSubQuestion",\
							"parent": "{{id9}}",\
							"children": ["{{id11}}","{{id13}}"],\
							"data": {"title": "mtqSubQuestion", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id11}}",\
							"type": "definition",\
							"parent": "{{id10}}",\
							"children": ["{{id12}}"],\
							"data": {"title": "definition", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id12}}",\
							"type": "textViewer",\
							"parent": "{{id11}}",\
							"children": [],\
							"data": {"title": "", "styleOverride": "definition", "disableDelete":true, "disableSelect":false, "width":"100%", "mode" : "singleStyle"}\
						},\
						{	"id":"{{id13}}",\
							"type": "mtqMultiSubAnswer",\
							"parent": "{{id10}}",\
							"children": ["{{id14}}"],\
							"data": {"title": "mtqMultiSubAnswer", "mtqAnswerType": "sortingAnswer", "disableDelete":true, "width":"100%", "answerType":"textViewer"}\
						},\
						{	"id":"{{id14}}",\
							"type": "mtqSubAnswer",\
							"parent": "{{id13}}",\
							"children": ["{{id15}}"],\
							"data": {"title": "mtqSubAnswer", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id15}}",\
							"type": "textViewer",\
							"parent": "{{id14}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "stageReadOnlyMode":false, "width":"100%", "mode" : "singleStyle"}\
						},\
						{	"id":"{{id16}}",\
							"type": "mtqSubQuestion",\
							"parent": "{{id9}}",\
							"children": ["{{id17}}","{{id19}}"],\
							"data": {"title": "mtqSubQuestion", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id17}}",\
							"type": "definition",\
							"parent": "{{id16}}",\
							"children": ["{{id18}}"],\
							"data": {"title": "definition", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id18}}",\
							"type": "textViewer",\
							"parent": "{{id17}}",\
							"children": [],\
							"data": {"title": "", "styleOverride": "definition", "disableDelete":true, "disableSelect":false, "width":"100%", "mode" : "singleStyle"}\
						},\
						{	"id":"{{id19}}",\
							"type": "mtqMultiSubAnswer",\
							"parent": "{{id16}}",\
							"children": ["{{id20}}"],\
							"data": {"title": "mtqMultiSubAnswer", "mtqAnswerType": "sortingAnswer", "disableDelete":true, "width":"100%", "answerType":"textViewer"}\
						},\
						{	"id":"{{id20}}",\
							"type": "mtqSubAnswer",\
							"parent": "{{id19}}",\
							"children": ["{{id21}}"],\
							"data": {"title": "mtqSubAnswer", "disableDelete":true, "width":"100%"}\
						},\
						{	"id":"{{id21}}",\
							"type": "textViewer",\
							"parent": "{{id20}}",\
							"children": [],\
							"data": {"title": "", "disableDelete":true, "stageReadOnlyMode":false, "width":"100%", "mode" : "singleStyle"}\
						}]'
});