define({
    getRepoData : function(language, type){

        if(this.repoData[language]){
            return this.repoData[language][type];
        }else{
            return this.repoData.defaultLanguage[type];
        }
    },
    'repoData': {
        'defaultLanguage': {
            'task': {
                id: "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                data: {
                    "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6": {
                        "type": "sequence",
                        "parent": "4ab7c59c-1407-4bcb-aa00-b0966f2dcff2",
                        "children": [
                            "740fa155-d9b0-4787-a6c1-e72bdee97fee",
                            "c4941191-f55d-4ca2-bda2-a76b32ef8f0e"
                        ],
                        "data": {
                            "title": "New Sequence 2",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"36da3b8f-0c3d-4ca7-89da-63d5c1455fd6\"> <task exposureid=\"0\" type=\"statement\" id=\"740fa155-d9b0-4787-a6c1-e72bdee97fee\" check_type=\"none\" sha1=\"d47ac8cf7e87acfd1fc4e8ab5ba6262cdb6bda1a\"> <mode>pedagogical</mode> <tasktitle> <textviewer id=\"eb0a7a06-2a8e-41b0-bc99-0c7789c827f7\"> <p><span class=\"pedagogicalTitle\">title</span></p> </textviewer> </tasktitle>\n<question id=\"a1829dab-9d35-4232-96a4-6c3634d84dad\" auto_tag=\"auto_tag\"> <textviewer id=\"8f056010-2930-4dfe-b8de-9cd8d810dc82\"> <p><span class=\"normal\">question</span></p> </textviewer> </question>\n<progress id=\"90cef903-360c-4879-9656-38a5d207802f\"> <ignorechecking> </ignorechecking> <attempts>0</attempts> <checkable>true</checkable> </progress> </task>\n<task exposureid=\"1\" type=\"mc\" id=\"c4941191-f55d-4ca2-bda2-a76b32ef8f0e\" check_type=\"auto\" sha1=\"b918e91097ec51c8ccf7511a5d16af01b765bdf6\"> <question id=\"00b5d09f-97b1-4da5-9eba-c43bc068bce0\" auto_tag=\"auto_tag\"> <textviewer id=\"ac2f7000-61b1-4ce3-9c77-f09aa00a180f\"> <p><span class=\"normal\">question</span></p> </textviewer> </question>\n<answer checkingmode=\"generic\" type=\"mc\"> <options> <option id=\"9c85e6a5-66a3-4cd6-96f7-280a8faece66\" correct=\"true\" auto_tag=\"auto_tag\"> <textviewer id=\"51662cbf-2a03-404c-a11c-07309f8e7f68\"> <p><span class=\"normal\">answer 1</span></p> </textviewer> </option>\n<option id=\"62642904-5c13-4d92-9074-fbbe2eabc614\" correct=\"false\" auto_tag=\"auto_tag\"> <textviewer id=\"356fdc89-f90a-450b-9f56-7272f3b1f302\"> <p><span class=\"normal\">answer 2</span></p> </textviewer> </option> </options>\n</answer> <progress id=\"13054406-7d9d-46a4-ae24-53639b287ba4\"> <ignorechecking> </ignorechecking> <attempts>1</attempts> <checkable>true</checkable> <hint> <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message> <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message> <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message>\n</hint> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"abb07531-09b2-461c-96c0-4c2325402974\"> <p><span class=\"feedback\">Nice work!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"3b589742-ec4d-471f-b241-08058e48edc0\"> <p><span class=\"feedback\">Nice work!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"f84be1d4-24e7-4312-a180-3bfcc105113c\"> <p><span class=\"feedback\">Try again.</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"28a5fe33-a96a-4cb9-bf20-846e2d74699b\"> <p><span class=\"feedback\">Click \"show answer\"</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"407b73cc-63cb-4436-bde0-3400fbf6db2f\"> <textviewer id=\"46311190-dea6-4b71-bcc8-d560a5d4f43b\"> <p><span class=\"instruction\">Select the correct answer.</span></p> </textviewer> </instruction> </progress> </task>\n</sequence>"
                    },
                    "740fa155-d9b0-4787-a6c1-e72bdee97fee": {
                        "id": "740fa155-d9b0-4787-a6c1-e72bdee97fee",
                        "type": "pedagogicalStatement",
                        "parent": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "children": [
                            "d04257d8-ce5c-4d92-973b-019499b3fdac",
                            "a1829dab-9d35-4232-96a4-6c3634d84dad",
                            "90cef903-360c-4879-9656-38a5d207802f"
                        ],
                        "data": {
                            "title": "New Pedagogical Statement",
                            "task_check_type": "none",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "d04257d8-ce5c-4d92-973b-019499b3fdac": {
                        "id": "d04257d8-ce5c-4d92-973b-019499b3fdac",
                        "type": "title",
                        "parent": "740fa155-d9b0-4787-a6c1-e72bdee97fee",
                        "children": [
                            "eb0a7a06-2a8e-41b0-bc99-0c7789c827f7"
                        ],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "show": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "eb0a7a06-2a8e-41b0-bc99-0c7789c827f7": {
                        "id": "eb0a7a06-2a8e-41b0-bc99-0c7789c827f7",
                        "type": "textViewer",
                        "parent": "d04257d8-ce5c-4d92-973b-019499b3fdac",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs pedagogicalTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"pedagogicalTitle\">title</div>",
                            "styleOverride": "pedagogicalTitle",
                            "mode": "singleStyle",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "a1829dab-9d35-4232-96a4-6c3634d84dad": {
                        "id": "a1829dab-9d35-4232-96a4-6c3634d84dad",
                        "type": "question",
                        "parent": "740fa155-d9b0-4787-a6c1-e72bdee97fee",
                        "children": [
                            "8f056010-2930-4dfe-b8de-9cd8d810dc82"
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
                    "8f056010-2930-4dfe-b8de-9cd8d810dc82": {
                        "type": "textViewer",
                        "parent": "a1829dab-9d35-4232-96a4-6c3634d84dad",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "8f056010-2930-4dfe-b8de-9cd8d810dc82"
                    },
                    "90cef903-360c-4879-9656-38a5d207802f": {
                        "id": "90cef903-360c-4879-9656-38a5d207802f",
                        "type": "progress",
                        "parent": "740fa155-d9b0-4787-a6c1-e72bdee97fee",
                        "children": [],
                        "data": {
                            "ignore_defaults": "true",
                            "title": "Progress",
                            "show_hint": false,
                            "button_label": "Continue",
                            "disableDelete": true,
                            "num_of_attempts": "0",
                            "hint_timing": 1,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c4941191-f55d-4ca2-bda2-a76b32ef8f0e": {
                        "id": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "type": "mc",
                        "parent": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "children": [
                            "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                            "35b68885-b1df-409e-92f0-d38cf49eec6f",
                            "13054406-7d9d-46a4-ae24-53639b287ba4"
                        ],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "407b73cc-63cb-4436-bde0-3400fbf6db2f": {
                        "id": "407b73cc-63cb-4436-bde0-3400fbf6db2f",
                        "type": "instruction",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": [
                            "46311190-dea6-4b71-bcc8-d560a5d4f43b"
                        ],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "46311190-dea6-4b71-bcc8-d560a5d4f43b": {
                        "id": "46311190-dea6-4b71-bcc8-d560a5d4f43b",
                        "type": "textViewer",
                        "parent": "407b73cc-63cb-4436-bde0-3400fbf6db2f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Select the correct answer.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "00b5d09f-97b1-4da5-9eba-c43bc068bce0": {
                        "id": "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                        "type": "question",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": [
                            "ac2f7000-61b1-4ce3-9c77-f09aa00a180f"
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
                    "ac2f7000-61b1-4ce3-9c77-f09aa00a180f": {
                        "type": "textViewer",
                        "parent": "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "ac2f7000-61b1-4ce3-9c77-f09aa00a180f"
                    },
                    "35b68885-b1df-409e-92f0-d38cf49eec6f": {
                        "id": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "type": "mcAnswer",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": [
                            "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                            "62642904-5c13-4d92-9074-fbbe2eabc614"
                        ],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "9c85e6a5-66a3-4cd6-96f7-280a8faece66": {
                        "id": "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                        "type": "option",
                        "parent": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "children": [
                            "51662cbf-2a03-404c-a11c-07309f8e7f68"
                        ],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "51662cbf-2a03-404c-a11c-07309f8e7f68": {
                        "id": "51662cbf-2a03-404c-a11c-07309f8e7f68",
                        "type": "textViewer",
                        "parent": "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 1</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "62642904-5c13-4d92-9074-fbbe2eabc614": {
                        "id": "62642904-5c13-4d92-9074-fbbe2eabc614",
                        "type": "option",
                        "parent": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "children": [
                            "356fdc89-f90a-450b-9f56-7272f3b1f302"
                        ],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "356fdc89-f90a-450b-9f56-7272f3b1f302": {
                        "id": "356fdc89-f90a-450b-9f56-7272f3b1f302",
                        "type": "textViewer",
                        "parent": "62642904-5c13-4d92-9074-fbbe2eabc614",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">answer 2</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "13054406-7d9d-46a4-ae24-53639b287ba4": {
                        "id": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "type": "progress",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": [
                            "27231e07-021b-4b67-8cc0-635c82447994",
                            "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                            "407b73cc-63cb-4436-bde0-3400fbf6db2f"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "1",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "missing_item",
                                    "partly_correct_missing_item",
                                    "partly_correct_more_80",
                                    "partly_correct_less_80",
                                    "all_correct_and_wrong",
                                    "all_incorrect"
                                ]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "27231e07-021b-4b67-8cc0-635c82447994": {
                        "id": "27231e07-021b-4b67-8cc0-635c82447994",
                        "type": "hint",
                        "parent": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "children": [
                            "e7ee8659-2b17-4743-b062-945dae963e60"
                        ],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "1"
                        }
                    },
                    "e7ee8659-2b17-4743-b062-945dae963e60": {
                        "type": "textViewer",
                        "parent": "27231e07-021b-4b67-8cc0-635c82447994",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">hint</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "e7ee8659-2b17-4743-b062-945dae963e60"
                    },
                    "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb": {
                        "id": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "type": "feedback",
                        "parent": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "children": [
                            "abb07531-09b2-461c-96c0-4c2325402974",
                            "3b589742-ec4d-471f-b241-08058e48edc0",
                            "f84be1d4-24e7-4312-a180-3bfcc105113c",
                            "28a5fe33-a96a-4cb9-bf20-846e2d74699b"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect"
                            ],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "abb07531-09b2-461c-96c0-4c2325402974",
                                    "final": "3b589742-ec4d-471f-b241-08058e48edc0"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "f84be1d4-24e7-4312-a180-3bfcc105113c",
                                    "final": "28a5fe33-a96a-4cb9-bf20-846e2d74699b"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "Custom"
                    },
                    "abb07531-09b2-461c-96c0-4c2325402974": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Nice work!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "abb07531-09b2-461c-96c0-4c2325402974",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "3b589742-ec4d-471f-b241-08058e48edc0": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Nice work!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "3b589742-ec4d-471f-b241-08058e48edc0",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "f84be1d4-24e7-4312-a180-3bfcc105113c": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Try again.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "f84be1d4-24e7-4312-a180-3bfcc105113c",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "28a5fe33-a96a-4cb9-bf20-846e2d74699b": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Click \"show answer\"</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "28a5fe33-a96a-4cb9-bf20-846e2d74699b",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'header': {
                id: "82de62a6-13af-4863-82dd-29504205d66b",
                data: {
                    "82de62a6-13af-4863-82dd-29504205d66b": {
                        "type": "sequence",
                        "parent": "e33e6857-9ca8-47ce-b0d5-780b8d5992c8",
                        "children": [
                            "c1750854-aabd-46b2-8343-1003a93c6c52",
                            "f884bbc3-198e-4514-8ba2-2dff08d76c5c"
                        ],
                        "data": {
                            "title": "New Sequence 2",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "82de62a6-13af-4863-82dd-29504205d66b",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"82de62a6-13af-4863-82dd-29504205d66b\"> <header id=\"c1750854-aabd-46b2-8343-1003a93c6c52\"> <textviewer id=\"0b299cf5-895b-447a-8d37-715e9fe7a367\"> <p><span class=\"sequenceTitle\">This is title</span></p> </textviewer> </header> <instruction show=\"true\"> <textviewer id=\"66df5d5b-f57e-4f88-a7e8-7ce43070bfd8\"> <p><span class=\"sequenceSubTitle\">This is instruction</span></p> </textviewer> }</instruction> <task exposureid=\"1\" type=\"questionOnly\" id=\"f884bbc3-198e-4514-8ba2-2dff08d76c5c\" check_type=\"manual\" sha1=\"c691835378297addc4f2699b7fea5e2e143489b6\"> <question id=\"179f12e9-5049-4a5c-b4eb-e1cdfb3e2564\" auto_tag=\"auto_tag\"> <textviewer id=\"5754a02c-b62d-44ab-85e8-db7f6dc8995f\"> <p><span class=\"normal\">This is a question</span></p> </textviewer> </question>\n<progress id=\"c3392ae3-fe2a-4ad7-b715-1a19783c8609\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>0</attempts> <checkable>true</checkable> </progress> </task>\n</sequence>"
                    },
                    "c1750854-aabd-46b2-8343-1003a93c6c52": {
                        "id": "c1750854-aabd-46b2-8343-1003a93c6c52",
                        "type": "header",
                        "parent": "82de62a6-13af-4863-82dd-29504205d66b",
                        "children": [
                            "4eed96b2-0b23-4d44-9d3f-80933bc20537",
                            "ab525c3a-0446-4cad-a869-9bce4a647a9f"
                        ],
                        "data": {
                            "title": "New header",
                            "task_check_type": "none",
                            "showGenericTitle": true,
                            "showGenericSubTitle": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "4eed96b2-0b23-4d44-9d3f-80933bc20537": {
                        "id": "4eed96b2-0b23-4d44-9d3f-80933bc20537",
                        "type": "genericTitle",
                        "parent": "c1750854-aabd-46b2-8343-1003a93c6c52",
                        "children": [
                            "0b299cf5-895b-447a-8d37-715e9fe7a367"
                        ],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "0b299cf5-895b-447a-8d37-715e9fe7a367": {
                        "id": "0b299cf5-895b-447a-8d37-715e9fe7a367",
                        "type": "textViewer",
                        "parent": "4eed96b2-0b23-4d44-9d3f-80933bc20537",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs sequenceTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"sequenceTitle\">This is title</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "sequenceTitle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "ab525c3a-0446-4cad-a869-9bce4a647a9f": {
                        "id": "ab525c3a-0446-4cad-a869-9bce4a647a9f",
                        "type": "genericSubTitle",
                        "parent": "c1750854-aabd-46b2-8343-1003a93c6c52",
                        "children": [
                            "66df5d5b-f57e-4f88-a7e8-7ce43070bfd8"
                        ],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "66df5d5b-f57e-4f88-a7e8-7ce43070bfd8": {
                        "id": "66df5d5b-f57e-4f88-a7e8-7ce43070bfd8",
                        "type": "textViewer",
                        "parent": "ab525c3a-0446-4cad-a869-9bce4a647a9f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs sequenceSubTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"sequenceSubTitle\">This is instruction</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "sequenceSubTitle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "f884bbc3-198e-4514-8ba2-2dff08d76c5c": {
                        "id": "f884bbc3-198e-4514-8ba2-2dff08d76c5c",
                        "type": "questionOnly",
                        "parent": "82de62a6-13af-4863-82dd-29504205d66b",
                        "children": [
                            "179f12e9-5049-4a5c-b4eb-e1cdfb3e2564",
                            "c3392ae3-fe2a-4ad7-b715-1a19783c8609"
                        ],
                        "data": {
                            "title": "New Question Only",
                            "task_check_type": "none",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "2684c51e-7485-46ad-953a-6573413dc571": {
                        "id": "2684c51e-7485-46ad-953a-6573413dc571",
                        "type": "instruction",
                        "parent": "f884bbc3-198e-4514-8ba2-2dff08d76c5c",
                        "children": [
                            "ed3a2dfa-172b-4fc1-a5de-753603f25c41"
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
                    "ed3a2dfa-172b-4fc1-a5de-753603f25c41": {
                        "id": "ed3a2dfa-172b-4fc1-a5de-753603f25c41",
                        "type": "textViewer",
                        "parent": "2684c51e-7485-46ad-953a-6573413dc571",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Click to edit the instruction</div>",
                            "mode": "singleStylePlainText",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "showNarrationType": true
                        }
                    },
                    "179f12e9-5049-4a5c-b4eb-e1cdfb3e2564": {
                        "id": "179f12e9-5049-4a5c-b4eb-e1cdfb3e2564",
                        "type": "question",
                        "parent": "f884bbc3-198e-4514-8ba2-2dff08d76c5c",
                        "children": [
                            "5754a02c-b62d-44ab-85e8-db7f6dc8995f"
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
                    "5754a02c-b62d-44ab-85e8-db7f6dc8995f": {
                        "type": "textViewer",
                        "parent": "179f12e9-5049-4a5c-b4eb-e1cdfb3e2564",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">This is a question</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "5754a02c-b62d-44ab-85e8-db7f6dc8995f"
                    },
                    "c3392ae3-fe2a-4ad7-b715-1a19783c8609": {
                        "id": "c3392ae3-fe2a-4ad7-b715-1a19783c8609",
                        "type": "progress",
                        "parent": "f884bbc3-198e-4514-8ba2-2dff08d76c5c",
                        "children": [
                            "1fbe0ea5-86d2-4bba-912e-65dd24abaeef",
                            "2684c51e-7485-46ad-953a-6573413dc571"
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
                    "1fbe0ea5-86d2-4bba-912e-65dd24abaeef": {
                        "id": "1fbe0ea5-86d2-4bba-912e-65dd24abaeef",
                        "type": "hint",
                        "parent": "c3392ae3-fe2a-4ad7-b715-1a19783c8609",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "maxAttempts": "0"
                        }
                    }
                }
            },
            'mc': {
                id: "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                data: {
                    "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6": {
                        "type": "sequence",
                        "parent": "4ab7c59c-1407-4bcb-aa00-b0966f2dcff2",
                        "children": ["c4941191-f55d-4ca2-bda2-a76b32ef8f0e"],
                        "data": {
                            "title": "New Sequence 2",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"36da3b8f-0c3d-4ca7-89da-63d5c1455fd6\"> <task exposureid=\"0\" type=\"mc\" id=\"c4941191-f55d-4ca2-bda2-a76b32ef8f0e\" check_type=\"auto\" sha1=\"22c372fe1ed5f1e00b422c432ce8d245f8486014\"> <question id=\"00b5d09f-97b1-4da5-9eba-c43bc068bce0\" auto_tag=\"auto_tag\"> <textviewer id=\"ac2f7000-61b1-4ce3-9c77-f09aa00a180f\"> <p><span class=\"normal\">question</span></p> </textviewer> </question>\n<answer checkingmode=\"generic\" type=\"mc\"> <options> <option id=\"9c85e6a5-66a3-4cd6-96f7-280a8faece66\" correct=\"true\" auto_tag=\"auto_tag\"> <textviewer id=\"51662cbf-2a03-404c-a11c-07309f8e7f68\"> <p><span class=\"normal\">answer 1</span></p> </textviewer> </option>\n<option id=\"62642904-5c13-4d92-9074-fbbe2eabc614\" correct=\"false\" auto_tag=\"auto_tag\"> <textviewer id=\"356fdc89-f90a-450b-9f56-7272f3b1f302\"> <p><span class=\"normal\">answer 2</span></p> </textviewer> </option> </options>\n</answer> <progress id=\"13054406-7d9d-46a4-ae24-53639b287ba4\"> <ignorechecking> </ignorechecking> <attempts>1</attempts> <checkable>true</checkable> <hint> <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message> <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message> <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message>\n</hint> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"abb07531-09b2-461c-96c0-4c2325402974\"> <p><span class=\"feedback\">Nice work!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"3b589742-ec4d-471f-b241-08058e48edc0\"> <p><span class=\"feedback\">Nice work!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"f84be1d4-24e7-4312-a180-3bfcc105113c\"> <p><span class=\"feedback\">Try again.</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"28a5fe33-a96a-4cb9-bf20-846e2d74699b\"> <p><span class=\"feedback\">Click \"show answer\"</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"407b73cc-63cb-4436-bde0-3400fbf6db2f\"> <textviewer id=\"46311190-dea6-4b71-bcc8-d560a5d4f43b\"> <p><span class=\"instruction\">Select the correct answer.</span></p> </textviewer> </instruction> </progress> </task>\n</sequence>"
                    },
                    "c4941191-f55d-4ca2-bda2-a76b32ef8f0e": {
                        "id": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "type": "mc",
                        "parent": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "children": ["00b5d09f-97b1-4da5-9eba-c43bc068bce0", "35b68885-b1df-409e-92f0-d38cf49eec6f", "13054406-7d9d-46a4-ae24-53639b287ba4"],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "407b73cc-63cb-4436-bde0-3400fbf6db2f": {
                        "id": "407b73cc-63cb-4436-bde0-3400fbf6db2f",
                        "type": "instruction",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["46311190-dea6-4b71-bcc8-d560a5d4f43b"],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "46311190-dea6-4b71-bcc8-d560a5d4f43b": {
                        "id": "46311190-dea6-4b71-bcc8-d560a5d4f43b",
                        "type": "textViewer",
                        "parent": "407b73cc-63cb-4436-bde0-3400fbf6db2f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Select the correct answer.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "00b5d09f-97b1-4da5-9eba-c43bc068bce0": {
                        "id": "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                        "type": "question",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["ac2f7000-61b1-4ce3-9c77-f09aa00a180f"],
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
                    "ac2f7000-61b1-4ce3-9c77-f09aa00a180f": {
                        "type": "textViewer",
                        "parent": "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "ac2f7000-61b1-4ce3-9c77-f09aa00a180f"
                    },
                    "35b68885-b1df-409e-92f0-d38cf49eec6f": {
                        "id": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "type": "mcAnswer",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["9c85e6a5-66a3-4cd6-96f7-280a8faece66", "62642904-5c13-4d92-9074-fbbe2eabc614"],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "9c85e6a5-66a3-4cd6-96f7-280a8faece66": {
                        "id": "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                        "type": "option",
                        "parent": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "children": ["51662cbf-2a03-404c-a11c-07309f8e7f68"],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "51662cbf-2a03-404c-a11c-07309f8e7f68": {
                        "id": "51662cbf-2a03-404c-a11c-07309f8e7f68",
                        "type": "textViewer",
                        "parent": "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 1</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "62642904-5c13-4d92-9074-fbbe2eabc614": {
                        "id": "62642904-5c13-4d92-9074-fbbe2eabc614",
                        "type": "option",
                        "parent": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "children": ["356fdc89-f90a-450b-9f56-7272f3b1f302"],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "356fdc89-f90a-450b-9f56-7272f3b1f302": {
                        "id": "356fdc89-f90a-450b-9f56-7272f3b1f302",
                        "type": "textViewer",
                        "parent": "62642904-5c13-4d92-9074-fbbe2eabc614",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">answer 2</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "13054406-7d9d-46a4-ae24-53639b287ba4": {
                        "id": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "type": "progress",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["27231e07-021b-4b67-8cc0-635c82447994", "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb", "407b73cc-63cb-4436-bde0-3400fbf6db2f"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "1",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong", "all_incorrect"]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "27231e07-021b-4b67-8cc0-635c82447994": {
                        "id": "27231e07-021b-4b67-8cc0-635c82447994",
                        "type": "hint",
                        "parent": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "children": ["e7ee8659-2b17-4743-b062-945dae963e60"],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "1"
                        }
                    },
                    "e7ee8659-2b17-4743-b062-945dae963e60": {
                        "type": "textViewer",
                        "parent": "27231e07-021b-4b67-8cc0-635c82447994",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">hint</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "e7ee8659-2b17-4743-b062-945dae963e60"
                    },
                    "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb": {
                        "id": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "type": "feedback",
                        "parent": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "children": ["abb07531-09b2-461c-96c0-4c2325402974", "3b589742-ec4d-471f-b241-08058e48edc0", "f84be1d4-24e7-4312-a180-3bfcc105113c", "28a5fe33-a96a-4cb9-bf20-846e2d74699b"],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect"],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "abb07531-09b2-461c-96c0-4c2325402974",
                                    "final": "3b589742-ec4d-471f-b241-08058e48edc0"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "f84be1d4-24e7-4312-a180-3bfcc105113c",
                                    "final": "28a5fe33-a96a-4cb9-bf20-846e2d74699b"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "Custom"
                    },
                    "abb07531-09b2-461c-96c0-4c2325402974": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Nice work!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "abb07531-09b2-461c-96c0-4c2325402974",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "3b589742-ec4d-471f-b241-08058e48edc0": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Nice work!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "3b589742-ec4d-471f-b241-08058e48edc0",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "f84be1d4-24e7-4312-a180-3bfcc105113c": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Try again.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "f84be1d4-24e7-4312-a180-3bfcc105113c",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "28a5fe33-a96a-4cb9-bf20-846e2d74699b": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Click \"show answer\"</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "28a5fe33-a96a-4cb9-bf20-846e2d74699b",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'mtq': {
                id: "0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50",
                data: {
                    "0": {
                        "id": 0,
                        "type": "mtqSubAnswer",
                        "parent": "293562fa-1506-4ad5-886d-31e8c9cd2e9f",
                        "children": [
                            "72110968-009f-421b-9dac-dcdaa45d2b86"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "1": {
                        "id": 1,
                        "type": "mtqSubAnswer",
                        "parent": "293562fa-1506-4ad5-886d-31e8c9cd2e9f",
                        "children": [
                            "d6afa7e1-63c5-4c24-85c9-725039980654"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2": {
                        "id": 2,
                        "type": "mtqSubAnswer",
                        "parent": "293562fa-1506-4ad5-886d-31e8c9cd2e9f",
                        "children": [
                            "0c4cd50b-3f9b-4547-b94d-34314bef8f0c"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50": {
                        "type": "sequence",
                        "parent": "f5ff34c6-fe3b-4e7e-aa31-c8017ded9953",
                        "children": [
                            "483b10b2-dc6b-4e39-a069-99553f33e819",
                            "f0170455-18dc-4634-b1b3-91d788cc4a3e",
                            "5e22eb07-b722-4ab3-a05c-abbe76484b19"
                        ],
                        "data": {
                            "title": "New Sequence",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "id": "0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50",
                        "is_modified": false,
                        "convertedData": "<sequence type=\"simple\" id=\"0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50\" cgsversion=\"7.0.27.32\">\n\t\n\n    \n<task exposureid=\"0\" type=\"mtq\" id=\"483b10b2-dc6b-4e39-a069-99553f33e819\" check_type=\"auto\" sha1=\"9636b887485650181dbb2f0dadf2f3343a71e04d\">\n        <mode>matching</mode>\n    \n\n    <!-- in mtq task -->\n\t\t\n\t\t<placeholders>true</placeholders>\t\t\n\t\t<bank>true</bank>\n\t\t<bankrandom>false</bankrandom>\n\t\t<!--dragAndCopy - reusable bank, dragAndDisable - not reusable -->\n\t\t<bankmode>dragAndDisable</bankmode>\n\t\t<mistakefactor>0</mistakefactor>\n\t\t\n    \n<question id=\"d100ecb9-9aa6-4b71-b8a8-87b1013b0ca5\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"cfe5ce65-2ddb-4771-86da-84075f57d08f\">\n\t    <paragraph><span class=\"normal\">question</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\" checkingmode=\"local\">\n\t\n<mtqarea id=\"439e8abc-d247-454b-ab6a-4735785fa854\" auto_tag=\"auto_tag\">\n\t\n<mtqsubquestion id=\"5466ef2b-5a20-4ef8-a566-b514b60d22de\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"4c1fc6fe-3a64-4ccf-b6ab-8397dac7828a\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"e67dce32-2ff5-4620-b4e2-671a2433dfdd\">\n\t    <paragraph><span class=\"definition\">definition 1</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n\t<subanswer answerid=\"cffc52f4-ebe2-4826-a159-e0285c7058aa\">\n\n\t\t\t<correct>\n\t\t\t\t<option>0</option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqsubquestion>\n<mtqsubquestion id=\"5f3427ab-2f30-4270-b528-64ed0346939f\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"747789b0-4355-4dc0-b0ed-80eed9f6da10\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"ac753ec5-288d-4040-87df-db543c1da7ed\">\n\t    <paragraph><span class=\"definition\">definition 2</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n\t<subanswer answerid=\"292a2036-b2b0-4491-9597-d75c259acede\">\n\n\t\t\t<correct>\n\t\t\t\t<option>1</option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqsubquestion>\n<mtqsubquestion id=\"5583ee4e-5f4e-4f4e-9a06-030563795bb9\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"680a77c3-75b2-48ae-9de5-10162bb838a6\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"39d2bece-81d1-4301-aa2a-0f4f5ffb9236\">\n\t    <paragraph><span class=\"definition\">definition 3</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n\t<subanswer answerid=\"5d5f520a-16cd-4d2e-8561-51c6f0d1c983\">\n\n\t\t\t<correct>\n\t\t\t\t<option>2</option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqsubquestion>\n</mtqarea>\n<mtqbank id=\"293562fa-1506-4ad5-886d-31e8c9cd2e9f\" auto_tag=\"auto_tag\">\n\t\n\t<subanswer answerid=\"5ccc363e-6876-4d7d-b532-a4652c6adb1f\">\n\t\t\t\n\n\t<textviewer id=\"b3bc70e0-484b-4fc0-b289-aa7d70ff37ea\">\n\t    <paragraph><span class=\"normal\">bank item 1</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"2d50a6d3-d52b-46ce-b52e-d5aa57474505\">\n\t\t\t\n\n\t<textviewer id=\"358e6d78-6079-43f1-bf4d-8a26a605853e\">\n\t    <paragraph><span class=\"normal\">bank item 2</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"0\">\n\t\t\t\n\n\t<textviewer id=\"72110968-009f-421b-9dac-dcdaa45d2b86\">\n\t    <paragraph><span class=\"normal\">answer 1</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"1\">\n\t\t\t\n\n\t<textviewer id=\"d6afa7e1-63c5-4c24-85c9-725039980654\">\n\t    <paragraph><span class=\"normal\">answer 2</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"2\">\n\t\t\t\n\n\t<textviewer id=\"0c4cd50b-3f9b-4547-b94d-34314bef8f0c\">\n\t    <paragraph><span class=\"normal\">answer 3</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqbank>\n</answer>\n<progress id=\"89118218-89b8-4813-baab-56598c418c33\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>1</attempts>\n\t\t<type>oneCompletion</type>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"9863d7bd-1e32-49c0-9fec-d9c934f59f3c\">\n    \n\n\t<textviewer id=\"0a865d31-db8b-4961-8c9e-0566df73eef4\">\n\t    <paragraph><span class=\"instruction\">Match the correct answer to the appropriate definition.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n<task exposureid=\"1\" type=\"mtq\" id=\"f0170455-18dc-4634-b1b3-91d788cc4a3e\" check_type=\"auto\" sha1=\"b119873f521bfb13038e5351cfa38e882ec61197\">\n        <mode>sorting</mode>\n    \n\n    <!-- in mtq task -->\n\t\t\n\t\t<placeholders>true</placeholders>\t\t\n\t\t<bank>false</bank>\n\t\t<bankrandom>false</bankrandom>\n\t\t<!--dragAndCopy - reusable bank, dragAndDisable - not reusable -->\n\t\t<bankmode>dragAndDisable</bankmode>\n\t\t<mistakefactor>1</mistakefactor>\n\t\t\n    \n<question id=\"e80d73ef-86e4-41af-8ab7-ec31c5a4b5c3\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"8d6c826c-fc9d-4c5f-b7b6-9c8ef324a708\">\n\t    <paragraph><span class=\"normal\">question</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\" checkingmode=\"local\">\n\t\n<mtqarea id=\"dc6bbb4e-5ff1-4037-bb08-01c4b1877960\" auto_tag=\"auto_tag\">\n\t\n<mtqmultisubquestion id=\"f8386538-4724-4fc5-8c16-318ceb7a426a\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"5e7811ce-f236-46ae-ab91-cf59e3abc75c\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"141914c6-85c9-4c9a-a8f4-41b614e07aa4\">\n\t    <paragraph><span class=\"definition\">definition 1</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n <multisubanswer id=\"fb6edaa4-cd8e-42fc-8c31-5e798376c1f9\">\n \t\t\n\t<subanswer answerid=\"04cac320-cc14-4193-a387-ef3efd4b412c\">\n\t\t\t\n\n\t<textviewer id=\"9810a8c8-1d5a-427e-bd56-2d68a4639ca9\">\n\t    <paragraph><span class=\"normal\">answer 1</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n \t<correct>\n\t\t<set>04cac320-cc14-4193-a387-ef3efd4b412c</set>\n\t</correct>\n</multisubanswer>\n</mtqmultisubquestion>\n<mtqmultisubquestion id=\"f07ac770-a227-4e56-96e7-838d3b8ee1ff\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"b2d8444d-b55a-4616-975d-162b04e236fd\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"88bacc03-ad2d-4491-a703-4788e5781cc8\">\n\t    <paragraph><span class=\"definition\">definition 2</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n <multisubanswer id=\"771cb691-168b-4676-8025-d1c4a41562e5\">\n \t\t\n\t<subanswer answerid=\"b98fbf11-9f72-4c5e-9c0e-654c3d035efc\">\n\t\t\t\n\n\t<textviewer id=\"2736ef3b-9f09-44b2-9ac7-6d54ab83143e\">\n\t    <paragraph><span class=\"normal\">answer 2.1</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n\t<subanswer answerid=\"71a73751-44f0-4300-aa5b-80adc7c14a00\">\n\t\t\t\n\n\t<textviewer id=\"5f7edac7-bdf2-4e24-94c6-6bf575f5e865\">\n\t    <paragraph><span class=\"normal\">answer 2.2</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n \t<correct>\n\t\t<set>b98fbf11-9f72-4c5e-9c0e-654c3d035efc,71a73751-44f0-4300-aa5b-80adc7c14a00</set>\n\t</correct>\n</multisubanswer>\n</mtqmultisubquestion>\n</mtqarea>\n</answer>\n<progress id=\"8d38deca-41e2-4046-a213-13b8016f6fad\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>2</attempts>\n\t\t<type>oneCompletion</type>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"a3a119dd-e2e2-4676-a0a2-bb422d511960\">\n    \n\n\t<textviewer id=\"7e8687cd-e12d-45bd-a19a-77800ee97af2\">\n\t    <paragraph><span class=\"instruction\">Sort the items in the appropriate category.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n<task exposureid=\"2\" type=\"mtq\" id=\"5e22eb07-b722-4ab3-a05c-abbe76484b19\" check_type=\"auto\" sha1=\"9773b7b8419e2578bb36e95af3131d05d69f6e38\">\n        <mode>sequencing</mode>\n    \n\n    <!-- in mtq task -->\n\t\t\n\t\t<placeholders>false</placeholders>\t\t\n\t\t<bank>false</bank>\n\t\t<bankrandom>false</bankrandom>\n\t\t<!--dragAndCopy - reusable bank, dragAndDisable - not reusable -->\n\t\t<bankmode>dragAndDisable</bankmode>\n\t\t<mistakefactor>0</mistakefactor>\n\t\t\n    \n<question id=\"330d93f9-cbf5-4025-b1a0-751bb9c46628\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"82d01ed8-418a-4d5a-807f-464ffb05ffbc\">\n\t    <paragraph><span class=\"normal\">question</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\" checkingmode=\"local\">\n\t\n<mtqarea id=\"232865bd-ff49-4c21-84e7-3f1c53c65d3b\" auto_tag=\"auto_tag\">\n\t\n<mtqmultisubquestion id=\"caff3ad5-25e9-476b-976a-d3cb54cd7a6e\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"ece58729-9546-4d85-9de5-d45627e15d04\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"76a4a40a-0f26-428b-8417-2e80451c744f\">\n\t    <paragraph><span class=\"definition\">start</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n <multisubanswer id=\"29fcd281-7ff1-4bd8-a207-8aca9a07e4e0\">\n \t\t\n\t<subanswer answerid=\"d63fdeae-92d8-4d88-b472-7c2ed00412c8\">\n\t\t\t\n\n\t<textviewer id=\"e4fec896-c16c-413e-9717-d878b0c28d9c\">\n\t    <paragraph><span class=\"normal\">first</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n\t<subanswer answerid=\"b9077c10-06f1-4319-9390-aea12af7780d\">\n\t\t\t\n\n\t<textviewer id=\"5fd4eda8-e036-4d04-9560-7c4050e2f55f\">\n\t    <paragraph><span class=\"normal\">second</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n\t<subanswer answerid=\"e8267b5f-7be7-4c87-8653-85c1d1bb2199\">\n\t\t\t\n\n\t<textviewer id=\"c6c84588-805a-48a0-8ceb-533dab005423\">\n\t    <paragraph><span class=\"normal\">third</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n \t<correct>\n\t\t<set>d63fdeae-92d8-4d88-b472-7c2ed00412c8,b9077c10-06f1-4319-9390-aea12af7780d,e8267b5f-7be7-4c87-8653-85c1d1bb2199</set>\n\t</correct>\n</multisubanswer>\n<definition id=\"2bf3aa91-966e-41d2-9bb2-5ee381ec9d50\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"6b45b125-9752-466c-8db6-5d9a428ce3ad\">\n\t    <paragraph><span class=\"definition\">end</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n</mtqmultisubquestion>\n</mtqarea>\n</answer>\n<progress id=\"cae4052d-57a1-47d4-90c8-34eadb447eff\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>2</attempts>\n\t\t<type>oneCompletion</type>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"72cca10d-fcd9-4ebc-a563-72618c333a8c\">\n    \n\n\t<textviewer id=\"0c2a2315-9ba7-49b6-9ba7-53ca336e9070\">\n\t    <paragraph><span class=\"instruction\">Arrange the items in the correct sequence.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n</sequence>",
                        "isCourse": false,
                        "ReadOnly": false
                    },
                    "483b10b2-dc6b-4e39-a069-99553f33e819": {
                        "id": "483b10b2-dc6b-4e39-a069-99553f33e819",
                        "type": "matching",
                        "parent": "0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50",
                        "children": [
                            "d100ecb9-9aa6-4b71-b8a8-87b1013b0ca5",
                            "8019c53b-174b-4302-9d8b-89e93010a21d",
                            "89118218-89b8-4813-baab-56598c418c33"
                        ],
                        "data": {
                            "title": "New mtq matching editor",
                            "task_check_type": "auto",
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
                    "9863d7bd-1e32-49c0-9fec-d9c934f59f3c": {
                        "id": "9863d7bd-1e32-49c0-9fec-d9c934f59f3c",
                        "type": "instruction",
                        "parent": "483b10b2-dc6b-4e39-a069-99553f33e819",
                        "children": [
                            "0a865d31-db8b-4961-8c9e-0566df73eef4"
                        ],
                        "data": {
                            "title": "",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "0a865d31-db8b-4961-8c9e-0566df73eef4": {
                        "id": "0a865d31-db8b-4961-8c9e-0566df73eef4",
                        "type": "textViewer",
                        "parent": "9863d7bd-1e32-49c0-9fec-d9c934f59f3c",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">Match the correct answer to the appropriate definition.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d100ecb9-9aa6-4b71-b8a8-87b1013b0ca5": {
                        "id": "d100ecb9-9aa6-4b71-b8a8-87b1013b0ca5",
                        "type": "question",
                        "parent": "483b10b2-dc6b-4e39-a069-99553f33e819",
                        "children": [
                            "cfe5ce65-2ddb-4771-86da-84075f57d08f"
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
                    "cfe5ce65-2ddb-4771-86da-84075f57d08f": {
                        "type": "textViewer",
                        "parent": "d100ecb9-9aa6-4b71-b8a8-87b1013b0ca5",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
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
                        "id": "cfe5ce65-2ddb-4771-86da-84075f57d08f"
                    },
                    "8019c53b-174b-4302-9d8b-89e93010a21d": {
                        "id": "8019c53b-174b-4302-9d8b-89e93010a21d",
                        "type": "matchingAnswer",
                        "parent": "483b10b2-dc6b-4e39-a069-99553f33e819",
                        "children": [
                            "439e8abc-d247-454b-ab6a-4735785fa854",
                            "293562fa-1506-4ad5-886d-31e8c9cd2e9f"
                        ],
                        "data": {
                            "title": "matchingAnswer",
                            "placeHolder": true,
                            "mtqMode": "one_to_one",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "interaction_type": "drag_and_drop",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "useBank": true
                        }
                    },
                    "439e8abc-d247-454b-ab6a-4735785fa854": {
                        "id": "439e8abc-d247-454b-ab6a-4735785fa854",
                        "type": "mtqArea",
                        "parent": "8019c53b-174b-4302-9d8b-89e93010a21d",
                        "children": [
                            "5466ef2b-5a20-4ef8-a566-b514b60d22de",
                            "5f3427ab-2f30-4270-b528-64ed0346939f",
                            "5583ee4e-5f4e-4f4e-9a06-030563795bb9"
                        ],
                        "data": {
                            "title": "MtqArea",
                            "useBank": true,
                            "mtqAnswerType": "matchingAnswer",
                            "hasMultiSubAnswers": false,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "canDeleteChildren": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5466ef2b-5a20-4ef8-a566-b514b60d22de": {
                        "id": "5466ef2b-5a20-4ef8-a566-b514b60d22de",
                        "type": "mtqSubQuestion",
                        "parent": "439e8abc-d247-454b-ab6a-4735785fa854",
                        "children": [
                            "4c1fc6fe-3a64-4ccf-b6ab-8397dac7828a",
                            "cffc52f4-ebe2-4826-a159-e0285c7058aa"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "4c1fc6fe-3a64-4ccf-b6ab-8397dac7828a": {
                        "id": "4c1fc6fe-3a64-4ccf-b6ab-8397dac7828a",
                        "type": "definition",
                        "parent": "5466ef2b-5a20-4ef8-a566-b514b60d22de",
                        "children": [
                            "e67dce32-2ff5-4620-b4e2-671a2433dfdd"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e67dce32-2ff5-4620-b4e2-671a2433dfdd": {
                        "id": "e67dce32-2ff5-4620-b4e2-671a2433dfdd",
                        "type": "textViewer",
                        "parent": "4c1fc6fe-3a64-4ccf-b6ab-8397dac7828a",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">definition 1</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "cffc52f4-ebe2-4826-a159-e0285c7058aa": {
                        "id": "cffc52f4-ebe2-4826-a159-e0285c7058aa",
                        "type": "mtqSubAnswer",
                        "parent": "5466ef2b-5a20-4ef8-a566-b514b60d22de",
                        "children": [
                            "72110968-009f-421b-9dac-dcdaa45d2b86"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 0
                        }
                    },
                    "72110968-009f-421b-9dac-dcdaa45d2b86": {
                        "id": "72110968-009f-421b-9dac-dcdaa45d2b86",
                        "type": "textViewer",
                        "parent": "cffc52f4-ebe2-4826-a159-e0285c7058aa",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5f3427ab-2f30-4270-b528-64ed0346939f": {
                        "id": "5f3427ab-2f30-4270-b528-64ed0346939f",
                        "type": "mtqSubQuestion",
                        "parent": "439e8abc-d247-454b-ab6a-4735785fa854",
                        "children": [
                            "747789b0-4355-4dc0-b0ed-80eed9f6da10",
                            "292a2036-b2b0-4491-9597-d75c259acede"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "747789b0-4355-4dc0-b0ed-80eed9f6da10": {
                        "id": "747789b0-4355-4dc0-b0ed-80eed9f6da10",
                        "type": "definition",
                        "parent": "5f3427ab-2f30-4270-b528-64ed0346939f",
                        "children": [
                            "ac753ec5-288d-4040-87df-db543c1da7ed"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ac753ec5-288d-4040-87df-db543c1da7ed": {
                        "id": "ac753ec5-288d-4040-87df-db543c1da7ed",
                        "type": "textViewer",
                        "parent": "747789b0-4355-4dc0-b0ed-80eed9f6da10",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">definition 2</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "292a2036-b2b0-4491-9597-d75c259acede": {
                        "id": "292a2036-b2b0-4491-9597-d75c259acede",
                        "type": "mtqSubAnswer",
                        "parent": "5f3427ab-2f30-4270-b528-64ed0346939f",
                        "children": [
                            "d6afa7e1-63c5-4c24-85c9-725039980654"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 1
                        }
                    },
                    "d6afa7e1-63c5-4c24-85c9-725039980654": {
                        "id": "d6afa7e1-63c5-4c24-85c9-725039980654",
                        "type": "textViewer",
                        "parent": "292a2036-b2b0-4491-9597-d75c259acede",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 2</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5583ee4e-5f4e-4f4e-9a06-030563795bb9": {
                        "id": "5583ee4e-5f4e-4f4e-9a06-030563795bb9",
                        "type": "mtqSubQuestion",
                        "parent": "439e8abc-d247-454b-ab6a-4735785fa854",
                        "children": [
                            "680a77c3-75b2-48ae-9de5-10162bb838a6",
                            "5d5f520a-16cd-4d2e-8561-51c6f0d1c983"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "680a77c3-75b2-48ae-9de5-10162bb838a6": {
                        "id": "680a77c3-75b2-48ae-9de5-10162bb838a6",
                        "type": "definition",
                        "parent": "5583ee4e-5f4e-4f4e-9a06-030563795bb9",
                        "children": [
                            "39d2bece-81d1-4301-aa2a-0f4f5ffb9236"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "39d2bece-81d1-4301-aa2a-0f4f5ffb9236": {
                        "id": "39d2bece-81d1-4301-aa2a-0f4f5ffb9236",
                        "type": "textViewer",
                        "parent": "680a77c3-75b2-48ae-9de5-10162bb838a6",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">definition 3</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "styleOverride": "definition",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5d5f520a-16cd-4d2e-8561-51c6f0d1c983": {
                        "id": "5d5f520a-16cd-4d2e-8561-51c6f0d1c983",
                        "type": "mtqSubAnswer",
                        "parent": "5583ee4e-5f4e-4f4e-9a06-030563795bb9",
                        "children": [
                            "0c4cd50b-3f9b-4547-b94d-34314bef8f0c"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 2
                        }
                    },
                    "0c4cd50b-3f9b-4547-b94d-34314bef8f0c": {
                        "id": "0c4cd50b-3f9b-4547-b94d-34314bef8f0c",
                        "type": "textViewer",
                        "parent": "5d5f520a-16cd-4d2e-8561-51c6f0d1c983",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 3</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "293562fa-1506-4ad5-886d-31e8c9cd2e9f": {
                        "type": "mtqBank",
                        "parent": "8019c53b-174b-4302-9d8b-89e93010a21d",
                        "children": [
                            "5ccc363e-6876-4d7d-b532-a4652c6adb1f",
                            "2d50a6d3-d52b-46ce-b52e-d5aa57474505",
                            0,
                            1,
                            2
                        ],
                        "data": {
                            "title": "MtqBank",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "293562fa-1506-4ad5-886d-31e8c9cd2e9f"
                    },
                    "5ccc363e-6876-4d7d-b532-a4652c6adb1f": {
                        "id": "5ccc363e-6876-4d7d-b532-a4652c6adb1f",
                        "type": "mtqSubAnswer",
                        "parent": "293562fa-1506-4ad5-886d-31e8c9cd2e9f",
                        "children": [
                            "b3bc70e0-484b-4fc0-b289-aa7d70ff37ea"
                        ],
                        "data": {
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b3bc70e0-484b-4fc0-b289-aa7d70ff37ea": {
                        "id": "b3bc70e0-484b-4fc0-b289-aa7d70ff37ea",
                        "type": "textViewer",
                        "parent": "5ccc363e-6876-4d7d-b532-a4652c6adb1f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">bank item 1</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2d50a6d3-d52b-46ce-b52e-d5aa57474505": {
                        "id": "2d50a6d3-d52b-46ce-b52e-d5aa57474505",
                        "type": "mtqSubAnswer",
                        "parent": "293562fa-1506-4ad5-886d-31e8c9cd2e9f",
                        "children": [
                            "358e6d78-6079-43f1-bf4d-8a26a605853e"
                        ],
                        "data": {
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "358e6d78-6079-43f1-bf4d-8a26a605853e": {
                        "id": "358e6d78-6079-43f1-bf4d-8a26a605853e",
                        "type": "textViewer",
                        "parent": "2d50a6d3-d52b-46ce-b52e-d5aa57474505",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">bank item 2</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "89118218-89b8-4813-baab-56598c418c33": {
                        "id": "89118218-89b8-4813-baab-56598c418c33",
                        "type": "progress",
                        "parent": "483b10b2-dc6b-4e39-a069-99553f33e819",
                        "children": [
                            "d582f53a-4d4d-4dd5-af66-5421725fdbeb",
                            "47623e09-6937-447f-a610-e46a97676642",
                            "9863d7bd-1e32-49c0-9fec-d9c934f59f3c"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "1",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "local",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "AdvancedFeedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80"
                            ],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d582f53a-4d4d-4dd5-af66-5421725fdbeb": {
                        "id": "d582f53a-4d4d-4dd5-af66-5421725fdbeb",
                        "type": "hint",
                        "parent": "89118218-89b8-4813-baab-56598c418c33",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "1"
                        }
                    },
                    "47623e09-6937-447f-a610-e46a97676642": {
                        "id": "47623e09-6937-447f-a610-e46a97676642",
                        "type": "feedback",
                        "parent": "89118218-89b8-4813-baab-56598c418c33",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f0170455-18dc-4634-b1b3-91d788cc4a3e": {
                        "id": "f0170455-18dc-4634-b1b3-91d788cc4a3e",
                        "type": "sorting",
                        "parent": "0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50",
                        "children": [
                            "e80d73ef-86e4-41af-8ab7-ec31c5a4b5c3",
                            "77ffa0f4-1882-48e3-b848-61e2cc61d4a2",
                            "8d38deca-41e2-4046-a213-13b8016f6fad"
                        ],
                        "data": {
                            "title": "New mtq sorting editor",
                            "task_check_type": "auto",
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
                    "a3a119dd-e2e2-4676-a0a2-bb422d511960": {
                        "id": "a3a119dd-e2e2-4676-a0a2-bb422d511960",
                        "type": "instruction",
                        "parent": "f0170455-18dc-4634-b1b3-91d788cc4a3e",
                        "children": [
                            "7e8687cd-e12d-45bd-a19a-77800ee97af2"
                        ],
                        "data": {
                            "title": "",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "7e8687cd-e12d-45bd-a19a-77800ee97af2": {
                        "id": "7e8687cd-e12d-45bd-a19a-77800ee97af2",
                        "type": "textViewer",
                        "parent": "a3a119dd-e2e2-4676-a0a2-bb422d511960",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">Sort the items in the appropriate category.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e80d73ef-86e4-41af-8ab7-ec31c5a4b5c3": {
                        "id": "e80d73ef-86e4-41af-8ab7-ec31c5a4b5c3",
                        "type": "question",
                        "parent": "f0170455-18dc-4634-b1b3-91d788cc4a3e",
                        "children": [
                            "8d6c826c-fc9d-4c5f-b7b6-9c8ef324a708"
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
                    "8d6c826c-fc9d-4c5f-b7b6-9c8ef324a708": {
                        "type": "textViewer",
                        "parent": "e80d73ef-86e4-41af-8ab7-ec31c5a4b5c3",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
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
                        "id": "8d6c826c-fc9d-4c5f-b7b6-9c8ef324a708"
                    },
                    "77ffa0f4-1882-48e3-b848-61e2cc61d4a2": {
                        "id": "77ffa0f4-1882-48e3-b848-61e2cc61d4a2",
                        "type": "sortingAnswer",
                        "parent": "f0170455-18dc-4634-b1b3-91d788cc4a3e",
                        "children": [
                            "dc6bbb4e-5ff1-4037-bb08-01c4b1877960"
                        ],
                        "data": {
                            "title": "sortingAnswer",
                            "useBank": false,
                            "mtqMode": "one_to_one",
                            "placeHolder": true,
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "dc6bbb4e-5ff1-4037-bb08-01c4b1877960": {
                        "id": "dc6bbb4e-5ff1-4037-bb08-01c4b1877960",
                        "type": "mtqArea",
                        "parent": "77ffa0f4-1882-48e3-b848-61e2cc61d4a2",
                        "children": [
                            "f8386538-4724-4fc5-8c16-318ceb7a426a",
                            "f07ac770-a227-4e56-96e7-838d3b8ee1ff"
                        ],
                        "data": {
                            "title": "MtqArea",
                            "useBank": false,
                            "mtqAnswerType": "sortingAnswer",
                            "hasMultiSubAnswers": true,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f8386538-4724-4fc5-8c16-318ceb7a426a": {
                        "id": "f8386538-4724-4fc5-8c16-318ceb7a426a",
                        "type": "mtqSubQuestion",
                        "parent": "dc6bbb4e-5ff1-4037-bb08-01c4b1877960",
                        "children": [
                            "5e7811ce-f236-46ae-ab91-cf59e3abc75c",
                            "fb6edaa4-cd8e-42fc-8c31-5e798376c1f9"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5e7811ce-f236-46ae-ab91-cf59e3abc75c": {
                        "id": "5e7811ce-f236-46ae-ab91-cf59e3abc75c",
                        "type": "definition",
                        "parent": "f8386538-4724-4fc5-8c16-318ceb7a426a",
                        "children": [
                            "141914c6-85c9-4c9a-a8f4-41b614e07aa4"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "141914c6-85c9-4c9a-a8f4-41b614e07aa4": {
                        "id": "141914c6-85c9-4c9a-a8f4-41b614e07aa4",
                        "type": "textViewer",
                        "parent": "5e7811ce-f236-46ae-ab91-cf59e3abc75c",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">definition 1</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "fb6edaa4-cd8e-42fc-8c31-5e798376c1f9": {
                        "id": "fb6edaa4-cd8e-42fc-8c31-5e798376c1f9",
                        "type": "mtqMultiSubAnswer",
                        "parent": "f8386538-4724-4fc5-8c16-318ceb7a426a",
                        "children": [
                            "04cac320-cc14-4193-a387-ef3efd4b412c"
                        ],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sortingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "04cac320-cc14-4193-a387-ef3efd4b412c": {
                        "id": "04cac320-cc14-4193-a387-ef3efd4b412c",
                        "type": "mtqSubAnswer",
                        "parent": "fb6edaa4-cd8e-42fc-8c31-5e798376c1f9",
                        "children": [
                            "9810a8c8-1d5a-427e-bd56-2d68a4639ca9"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "9810a8c8-1d5a-427e-bd56-2d68a4639ca9": {
                        "id": "9810a8c8-1d5a-427e-bd56-2d68a4639ca9",
                        "type": "textViewer",
                        "parent": "04cac320-cc14-4193-a387-ef3efd4b412c",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f07ac770-a227-4e56-96e7-838d3b8ee1ff": {
                        "id": "f07ac770-a227-4e56-96e7-838d3b8ee1ff",
                        "type": "mtqSubQuestion",
                        "parent": "dc6bbb4e-5ff1-4037-bb08-01c4b1877960",
                        "children": [
                            "b2d8444d-b55a-4616-975d-162b04e236fd",
                            "771cb691-168b-4676-8025-d1c4a41562e5"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b2d8444d-b55a-4616-975d-162b04e236fd": {
                        "id": "b2d8444d-b55a-4616-975d-162b04e236fd",
                        "type": "definition",
                        "parent": "f07ac770-a227-4e56-96e7-838d3b8ee1ff",
                        "children": [
                            "88bacc03-ad2d-4491-a703-4788e5781cc8"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "88bacc03-ad2d-4491-a703-4788e5781cc8": {
                        "id": "88bacc03-ad2d-4491-a703-4788e5781cc8",
                        "type": "textViewer",
                        "parent": "b2d8444d-b55a-4616-975d-162b04e236fd",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">definition 2</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "771cb691-168b-4676-8025-d1c4a41562e5": {
                        "id": "771cb691-168b-4676-8025-d1c4a41562e5",
                        "type": "mtqMultiSubAnswer",
                        "parent": "f07ac770-a227-4e56-96e7-838d3b8ee1ff",
                        "children": [
                            "b98fbf11-9f72-4c5e-9c0e-654c3d035efc",
                            "71a73751-44f0-4300-aa5b-80adc7c14a00"
                        ],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sortingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "canDeleteChildren": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b98fbf11-9f72-4c5e-9c0e-654c3d035efc": {
                        "id": "b98fbf11-9f72-4c5e-9c0e-654c3d035efc",
                        "type": "mtqSubAnswer",
                        "parent": "771cb691-168b-4676-8025-d1c4a41562e5",
                        "children": [
                            "2736ef3b-9f09-44b2-9ac7-6d54ab83143e"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2736ef3b-9f09-44b2-9ac7-6d54ab83143e": {
                        "id": "2736ef3b-9f09-44b2-9ac7-6d54ab83143e",
                        "type": "textViewer",
                        "parent": "b98fbf11-9f72-4c5e-9c0e-654c3d035efc",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 2.1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "71a73751-44f0-4300-aa5b-80adc7c14a00": {
                        "id": "71a73751-44f0-4300-aa5b-80adc7c14a00",
                        "type": "mtqSubAnswer",
                        "parent": "771cb691-168b-4676-8025-d1c4a41562e5",
                        "children": [
                            "5f7edac7-bdf2-4e24-94c6-6bf575f5e865"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5f7edac7-bdf2-4e24-94c6-6bf575f5e865": {
                        "id": "5f7edac7-bdf2-4e24-94c6-6bf575f5e865",
                        "type": "textViewer",
                        "parent": "71a73751-44f0-4300-aa5b-80adc7c14a00",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 2.2</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "8d38deca-41e2-4046-a213-13b8016f6fad": {
                        "id": "8d38deca-41e2-4046-a213-13b8016f6fad",
                        "type": "progress",
                        "parent": "f0170455-18dc-4634-b1b3-91d788cc4a3e",
                        "children": [
                            "e5256642-18a2-4360-9958-689275259a10",
                            "385edec3-ede1-4b53-b1b1-0205ffd2f476",
                            "a3a119dd-e2e2-4676-a0a2-bb422d511960"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "local",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "AdvancedFeedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80",
                                "all_correct_and_wrong"
                            ],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e5256642-18a2-4360-9958-689275259a10": {
                        "id": "e5256642-18a2-4360-9958-689275259a10",
                        "type": "hint",
                        "parent": "8d38deca-41e2-4046-a213-13b8016f6fad",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "385edec3-ede1-4b53-b1b1-0205ffd2f476": {
                        "id": "385edec3-ede1-4b53-b1b1-0205ffd2f476",
                        "type": "feedback",
                        "parent": "8d38deca-41e2-4046-a213-13b8016f6fad",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5e22eb07-b722-4ab3-a05c-abbe76484b19": {
                        "id": "5e22eb07-b722-4ab3-a05c-abbe76484b19",
                        "type": "sequencing",
                        "parent": "0aebb8f4-a3ca-40c1-a07e-eeb902bb7a50",
                        "children": [
                            "330d93f9-cbf5-4025-b1a0-751bb9c46628",
                            "4e98f8e6-b6a4-42ae-baa0-2dec2592b67a",
                            "cae4052d-57a1-47d4-90c8-34eadb447eff"
                        ],
                        "data": {
                            "title": "New mtq sequencing editor",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "72cca10d-fcd9-4ebc-a563-72618c333a8c": {
                        "id": "72cca10d-fcd9-4ebc-a563-72618c333a8c",
                        "type": "instruction",
                        "parent": "5e22eb07-b722-4ab3-a05c-abbe76484b19",
                        "children": [
                            "0c2a2315-9ba7-49b6-9ba7-53ca336e9070"
                        ],
                        "data": {
                            "title": "",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "0c2a2315-9ba7-49b6-9ba7-53ca336e9070": {
                        "id": "0c2a2315-9ba7-49b6-9ba7-53ca336e9070",
                        "type": "textViewer",
                        "parent": "72cca10d-fcd9-4ebc-a563-72618c333a8c",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Arrange the items in the correct sequence.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "330d93f9-cbf5-4025-b1a0-751bb9c46628": {
                        "id": "330d93f9-cbf5-4025-b1a0-751bb9c46628",
                        "type": "question",
                        "parent": "5e22eb07-b722-4ab3-a05c-abbe76484b19",
                        "children": [
                            "82d01ed8-418a-4d5a-807f-464ffb05ffbc"
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
                    "82d01ed8-418a-4d5a-807f-464ffb05ffbc": {
                        "type": "textViewer",
                        "parent": "330d93f9-cbf5-4025-b1a0-751bb9c46628",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
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
                        "id": "82d01ed8-418a-4d5a-807f-464ffb05ffbc"
                    },
                    "4e98f8e6-b6a4-42ae-baa0-2dec2592b67a": {
                        "id": "4e98f8e6-b6a4-42ae-baa0-2dec2592b67a",
                        "type": "sequencingAnswer",
                        "parent": "5e22eb07-b722-4ab3-a05c-abbe76484b19",
                        "children": [
                            "232865bd-ff49-4c21-84e7-3f1c53c65d3b"
                        ],
                        "data": {
                            "title": "sequencingAnswer",
                            "useBank": false,
                            "placeHolder": false,
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "232865bd-ff49-4c21-84e7-3f1c53c65d3b": {
                        "id": "232865bd-ff49-4c21-84e7-3f1c53c65d3b",
                        "type": "mtqArea",
                        "parent": "4e98f8e6-b6a4-42ae-baa0-2dec2592b67a",
                        "children": [
                            "caff3ad5-25e9-476b-976a-d3cb54cd7a6e"
                        ],
                        "data": {
                            "title": "MtqArea",
                            "useBank": false,
                            "mtqAnswerType": "sequencingAnswer",
                            "hasMultiSubAnswers": true,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "caff3ad5-25e9-476b-976a-d3cb54cd7a6e": {
                        "id": "caff3ad5-25e9-476b-976a-d3cb54cd7a6e",
                        "type": "mtqSubQuestion",
                        "parent": "232865bd-ff49-4c21-84e7-3f1c53c65d3b",
                        "children": [
                            "ece58729-9546-4d85-9de5-d45627e15d04",
                            "29fcd281-7ff1-4bd8-a207-8aca9a07e4e0",
                            "2bf3aa91-966e-41d2-9bb2-5ee381ec9d50"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ece58729-9546-4d85-9de5-d45627e15d04": {
                        "id": "ece58729-9546-4d85-9de5-d45627e15d04",
                        "type": "definition",
                        "parent": "caff3ad5-25e9-476b-976a-d3cb54cd7a6e",
                        "children": [
                            "76a4a40a-0f26-428b-8417-2e80451c744f"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "76a4a40a-0f26-428b-8417-2e80451c744f": {
                        "id": "76a4a40a-0f26-428b-8417-2e80451c744f",
                        "type": "textViewer",
                        "parent": "ece58729-9546-4d85-9de5-d45627e15d04",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">start</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "29fcd281-7ff1-4bd8-a207-8aca9a07e4e0": {
                        "id": "29fcd281-7ff1-4bd8-a207-8aca9a07e4e0",
                        "type": "mtqMultiSubAnswer",
                        "parent": "caff3ad5-25e9-476b-976a-d3cb54cd7a6e",
                        "children": [
                            "d63fdeae-92d8-4d88-b472-7c2ed00412c8",
                            "b9077c10-06f1-4319-9390-aea12af7780d",
                            "e8267b5f-7be7-4c87-8653-85c1d1bb2199"
                        ],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sequencingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d63fdeae-92d8-4d88-b472-7c2ed00412c8": {
                        "id": "d63fdeae-92d8-4d88-b472-7c2ed00412c8",
                        "type": "mtqSubAnswer",
                        "parent": "29fcd281-7ff1-4bd8-a207-8aca9a07e4e0",
                        "children": [
                            "e4fec896-c16c-413e-9717-d878b0c28d9c"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e4fec896-c16c-413e-9717-d878b0c28d9c": {
                        "id": "e4fec896-c16c-413e-9717-d878b0c28d9c",
                        "type": "textViewer",
                        "parent": "d63fdeae-92d8-4d88-b472-7c2ed00412c8",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">first</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b9077c10-06f1-4319-9390-aea12af7780d": {
                        "id": "b9077c10-06f1-4319-9390-aea12af7780d",
                        "type": "mtqSubAnswer",
                        "parent": "29fcd281-7ff1-4bd8-a207-8aca9a07e4e0",
                        "children": [
                            "5fd4eda8-e036-4d04-9560-7c4050e2f55f"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5fd4eda8-e036-4d04-9560-7c4050e2f55f": {
                        "id": "5fd4eda8-e036-4d04-9560-7c4050e2f55f",
                        "type": "textViewer",
                        "parent": "b9077c10-06f1-4319-9390-aea12af7780d",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">second</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e8267b5f-7be7-4c87-8653-85c1d1bb2199": {
                        "id": "e8267b5f-7be7-4c87-8653-85c1d1bb2199",
                        "type": "mtqSubAnswer",
                        "parent": "29fcd281-7ff1-4bd8-a207-8aca9a07e4e0",
                        "children": [
                            "c6c84588-805a-48a0-8ceb-533dab005423"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c6c84588-805a-48a0-8ceb-533dab005423": {
                        "id": "c6c84588-805a-48a0-8ceb-533dab005423",
                        "type": "textViewer",
                        "parent": "e8267b5f-7be7-4c87-8653-85c1d1bb2199",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">third</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2bf3aa91-966e-41d2-9bb2-5ee381ec9d50": {
                        "id": "2bf3aa91-966e-41d2-9bb2-5ee381ec9d50",
                        "type": "definition",
                        "parent": "caff3ad5-25e9-476b-976a-d3cb54cd7a6e",
                        "children": [
                            "6b45b125-9752-466c-8db6-5d9a428ce3ad"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "6b45b125-9752-466c-8db6-5d9a428ce3ad": {
                        "id": "6b45b125-9752-466c-8db6-5d9a428ce3ad",
                        "type": "textViewer",
                        "parent": "2bf3aa91-966e-41d2-9bb2-5ee381ec9d50",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">end</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "cae4052d-57a1-47d4-90c8-34eadb447eff": {
                        "id": "cae4052d-57a1-47d4-90c8-34eadb447eff",
                        "type": "progress",
                        "parent": "5e22eb07-b722-4ab3-a05c-abbe76484b19",
                        "children": [
                            "2b3bb66e-5dc2-4a12-982e-521b09a39fed",
                            "484d0c35-b62d-409d-a912-438926af22f9",
                            "72cca10d-fcd9-4ebc-a563-72618c333a8c"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "local",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "AdvancedFeedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80",
                                "all_correct_and_wrong"
                            ],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2b3bb66e-5dc2-4a12-982e-521b09a39fed": {
                        "id": "2b3bb66e-5dc2-4a12-982e-521b09a39fed",
                        "type": "hint",
                        "parent": "cae4052d-57a1-47d4-90c8-34eadb447eff",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "484d0c35-b62d-409d-a912-438926af22f9": {
                        "id": "484d0c35-b62d-409d-a912-438926af22f9",
                        "type": "feedback",
                        "parent": "cae4052d-57a1-47d4-90c8-34eadb447eff",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    }
                }
            },
            'cloze': {
                id: "21efde7d-cb1c-4b88-b87e-38fcebadd736",
                data: {
                    "0": {
                        "type": "textViewer",
                        "data": {
                            "title": "<span class=\"normal cgs\">fill</span>",
                            "textEditorStyle": "texteditor cgs",
                            "styleOverride": ""
                        },
                        "id": 0,
                        "parent": "022cab63-71b1-4844-905b-f9b48881352e"
                    },
                    "1": {
                        "type": "textViewer",
                        "data": {
                            "title": "<span class=\"normal cgs\">missing</span>",
                            "textEditorStyle": "texteditor cgs",
                            "styleOverride": ""
                        },
                        "id": 1,
                        "parent": "5d89d3ea-bfc7-4db6-b7ed-8055713e6d4b"
                    },
                    "21efde7d-cb1c-4b88-b87e-38fcebadd736": {
                        "type": "sequence",
                        "parent": "cf2d9c17-11d2-4210-ba2f-f9c8ebd399eb",
                        "children": [
                            "b5a3bb5d-7e85-4e29-adea-d03f65746d08"
                        ],
                        "data": {
                            "title": "New Sequence 1",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": false,
                            "invalidMessage": {
                                "valid": false,
                                "report": [{
                                    "editorId": "21efde7d-cb1c-4b88-b87e-38fcebadd736",
                                    "editorType": "sequence",
                                    "editorGroup": "sequence",
                                    "msg": "There must be at least one task in the sequence"
                                }, {
                                    "editorId": "e943b193-4a61-44c5-871f-a4745582987f",
                                    "editorType": "textViewer",
                                    "editorGroup": "task",
                                    "msg": "The text object does not have any content. Return to the Text editor and enter content."
                                }, {
                                    "editorId": "031bd6fb-48b2-46ab-bacc-9e03bd80eb3d",
                                    "editorType": "cloze_text_viewer",
                                    "editorGroup": "task",
                                    "msg": "Please Insert at least one answer in the answer area"
                                }],
                                "bubbleUp": true,
                                "upperComponentMessage": [{
                                    "editorId": "21efde7d-cb1c-4b88-b87e-38fcebadd736",
                                    "editorType": "sequence",
                                    "editorGroup": "sequence",
                                    "msg": "There must be at least one task in the sequence"
                                }]
                            }
                        },
                        "id": "21efde7d-cb1c-4b88-b87e-38fcebadd736",
                        "is_modified": true,
                        "convertedData": "<sequence type=\"simple\" id=\"21efde7d-cb1c-4b88-b87e-38fcebadd736\"> <task exposureid=\"0\" type=\"cloze\" id=\"b5a3bb5d-7e85-4e29-adea-d03f65746d08\" check_type=\"auto\" sha1=\"187ea476ac50921a55bdf5ab30ed8eb0d4115292\"> <mode>dragAndDisable</mode> <question id=\"f44d9a2f-329d-4c2d-8b19-85aa5e70d66e\" auto_tag=\"auto_tag\"> </question>\n<answer checkable=\"true\"> <clozearea> <cloze> <p><span class=\"normal\"> <subanswer answerid=\"answerfield_031bd6fb-48b2-46ab-bacc-9e03bd80eb3d_1\" originalid=\"0\"> <casesensitive>false</casesensitive> <punctuationmarks>false</punctuationmarks> <correct> <ans_option widthem=\"\">0</ans_option> </correct> <partiallycorrect> </partiallycorrect> <incorrectpredicted> </incorrectpredicted> </subanswer>the <subanswer answerid=\"answerfield_031bd6fb-48b2-46ab-bacc-9e03bd80eb3d_2\" originalid=\"1\"> <casesensitive>false</casesensitive> <punctuationmarks>false</punctuationmarks> <correct> <ans_option widthem=\"\">1</ans_option> </correct> <partiallycorrect> </partiallycorrect> <incorrectpredicted> </incorrectpredicted> </subanswer> words</span></p> </cloze>\n</clozearea>\n<bank> <subanswer answerid=\"a36452fa-0eca-46cf-bbe4-31e469e7bb00\" originalid=\"\"> <textviewer id=\"a36452fa-0eca-46cf-bbe4-31e469e7bb00\"> <p><span class=\"normal\">bank item</span></p> </textviewer> </subanswer> <subanswer answerid=\"0\" originalid=\"\"> <textviewer id=\"0\"> <p><span class=\"normal cgs\">fill</span></p> </textviewer> </subanswer> <subanswer answerid=\"1\" originalid=\"\"> <textviewer id=\"1\"> <p><span class=\"normal cgs\">missing</span></p> </textviewer> </subanswer> </bank> </answer>\n<progress id=\"b7fdf60c-9d2c-4cc5-99b1-cf82f73b9b4e\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>2</attempts> <checkable>true</checkable> <feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback> </progress> </task>\n</sequence>"
                    },
                    "b5a3bb5d-7e85-4e29-adea-d03f65746d08": {
                        "id": "b5a3bb5d-7e85-4e29-adea-d03f65746d08",
                        "type": "cloze",
                        "parent": "21efde7d-cb1c-4b88-b87e-38fcebadd736",
                        "children": [
                            "f44d9a2f-329d-4c2d-8b19-85aa5e70d66e",
                            "8e23ebca-7321-418d-8906-2206ba62dabb",
                            "b7fdf60c-9d2c-4cc5-99b1-cf82f73b9b4e"
                        ],
                        "data": {
                            "title": "Fill in the gaps",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": false
                    },
                    "992fd3b7-6212-4471-b5f0-3cb7238a409b": {
                        "id": "992fd3b7-6212-4471-b5f0-3cb7238a409b",
                        "type": "instruction",
                        "parent": "b5a3bb5d-7e85-4e29-adea-d03f65746d08",
                        "children": [
                            "2271f877-42c8-491c-8fb9-df69b03790e7"
                        ],
                        "data": {
                            "title": "",
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
                    "2271f877-42c8-491c-8fb9-df69b03790e7": {
                        "id": "2271f877-42c8-491c-8fb9-df69b03790e7",
                        "type": "textViewer",
                        "parent": "992fd3b7-6212-4471-b5f0-3cb7238a409b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Complete one or more missing sections.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f44d9a2f-329d-4c2d-8b19-85aa5e70d66e": {
                        "id": "f44d9a2f-329d-4c2d-8b19-85aa5e70d66e",
                        "type": "question",
                        "parent": "b5a3bb5d-7e85-4e29-adea-d03f65746d08",
                        "children": [],
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
                    "8e23ebca-7321-418d-8906-2206ba62dabb": {
                        "id": "8e23ebca-7321-418d-8906-2206ba62dabb",
                        "type": "cloze_answer",
                        "parent": "b5a3bb5d-7e85-4e29-adea-d03f65746d08",
                        "children": [
                            "031bd6fb-48b2-46ab-bacc-9e03bd80eb3d",
                            "9ef14356-2ac8-4e96-87f4-38cd42c1427f"
                        ],
                        "data": {
                            "title": "Answer",
                            "interaction": "dd",
                            "answerType": "cloze_text_viewer",
                            "fieldsNum": "multiple",
                            "fieldsWidth": "longest",
                            "maxHeight": "secondLevel",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "useBank": true,
                            "className": "drag-drop-cloze"
                        }
                    },
                    "031bd6fb-48b2-46ab-bacc-9e03bd80eb3d": {
                        "id": "031bd6fb-48b2-46ab-bacc-9e03bd80eb3d",
                        "type": "cloze_text_viewer",
                        "parent": "8e23ebca-7321-418d-8906-2206ba62dabb",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">&nbsp;<answerfield class=\"AnswerField\" type=\"text\" contenteditable=\"false\" style=\"-webkit-user-select: none;\"><span class=\"answerfieldSpan\" id=\"answerfield_031bd6fb-48b2-46ab-bacc-9e03bd80eb3d_1\" type=\"text\" contenteditable=\"true\" style=\"-webkit-user-select: initial;\">fill </span><div contenteditable=\"false\" class=\"x-button\" style=\"-webkit-user-select: none;\">x</div></answerfield>the <answerfield class=\"AnswerField\" type=\"text\" contenteditable=\"false\" style=\"-webkit-user-select: none;\"><span class=\"answerfieldSpan\" id=\"answerfield_031bd6fb-48b2-46ab-bacc-9e03bd80eb3d_2\" type=\"text\" contenteditable=\"true\" style=\"-webkit-user-select: initial;\">missing</span><div contenteditable=\"false\" class=\"x-button\" style=\"-webkit-user-select: none;\">x</div></answerfield> words</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "answerFields": {
                                "answerfield_031bd6fb-48b2-46ab-bacc-9e03bd80eb3d_1": {
                                    "type": "text"
                                },
                                "answerfield_031bd6fb-48b2-46ab-bacc-9e03bd80eb3d_2": {
                                    "type": "text"
                                }
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "type": "text",
                            "noCheckingType": true,
                            "noAdditionalCorrectAnswers": true,
                            "noPartiallyCorrectAnswers": true,
                            "noExpectedWrong": true
                        }
                    },
                    "9ef14356-2ac8-4e96-87f4-38cd42c1427f": {
                        "type": "clozeBank",
                        "parent": "8e23ebca-7321-418d-8906-2206ba62dabb",
                        "children": [
                            "4f61c331-58a2-4743-9b4f-14e9d8f6f934",
                            "022cab63-71b1-4844-905b-f9b48881352e",
                            "5d89d3ea-bfc7-4db6-b7ed-8055713e6d4b"
                        ],
                        "data": {
                            "title": "clozeBank",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "9ef14356-2ac8-4e96-87f4-38cd42c1427f"
                    },
                    "a36452fa-0eca-46cf-bbe4-31e469e7bb00": {
                        "type": "textViewer",
                        "parent": "4f61c331-58a2-4743-9b4f-14e9d8f6f934",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs bankReadOnly\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"bankReadOnly\">bank item</div>",
                            "showNarrationType": true,
                            "styleOverride": "normal",
                            "textEditorStyle": "texteditor cgs",
                            "mode": "bankStyle",
                            "width": "50%",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "a36452fa-0eca-46cf-bbe4-31e469e7bb00"
                    },
                    "b7fdf60c-9d2c-4cc5-99b1-cf82f73b9b4e": {
                        "id": "b7fdf60c-9d2c-4cc5-99b1-cf82f73b9b4e",
                        "type": "advancedProgress",
                        "parent": "b5a3bb5d-7e85-4e29-adea-d03f65746d08",
                        "children": [
                            "ddbe53b8-5d42-4f52-8a2a-d67618526991",
                            "e91268d5-0832-44a9-ac81-8330c4567b1a",
                            "992fd3b7-6212-4471-b5f0-3cb7238a409b"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "feedback_type": "local",
                            "checking_enabled": true,
                            "score": 1,
                            "button_label": "Continue",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "with_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ],
                                "no_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "with_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ],
                                "no_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ddbe53b8-5d42-4f52-8a2a-d67618526991": {
                        "id": "ddbe53b8-5d42-4f52-8a2a-d67618526991",
                        "type": "hint",
                        "parent": "b7fdf60c-9d2c-4cc5-99b1-cf82f73b9b4e",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "maxAttempts": "2"
                        }
                    },
                    "e91268d5-0832-44a9-ac81-8330c4567b1a": {
                        "id": "e91268d5-0832-44a9-ac81-8330c4567b1a",
                        "type": "feedback",
                        "parent": "b7fdf60c-9d2c-4cc5-99b1-cf82f73b9b4e",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [],
                            "taskType": "with_bank",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {},
                            "feedbacks_map_specific": {}
                        }
                    },
                    "4f61c331-58a2-4743-9b4f-14e9d8f6f934": {
                        "children": [
                            "a36452fa-0eca-46cf-bbe4-31e469e7bb00"
                        ],
                        "data": {
                            "subItemId": "a36452fa-0eca-46cf-bbe4-31e469e7bb00"
                        },
                        "id": "4f61c331-58a2-4743-9b4f-14e9d8f6f934",
                        "parent": "9ef14356-2ac8-4e96-87f4-38cd42c1427f",
                        "type": "clozeBankSubItem"
                    },
                    "022cab63-71b1-4844-905b-f9b48881352e": {
                        "children": [
                            0
                        ],
                        "data": {
                            "subItemId": 0
                        },
                        "id": "022cab63-71b1-4844-905b-f9b48881352e",
                        "parent": "9ef14356-2ac8-4e96-87f4-38cd42c1427f",
                        "type": "clozeBankSubItem"
                    },
                    "5d89d3ea-bfc7-4db6-b7ed-8055713e6d4b": {
                        "children": [
                            1
                        ],
                        "data": {
                            "subItemId": 1
                        },
                        "id": "5d89d3ea-bfc7-4db6-b7ed-8055713e6d4b",
                        "parent": "9ef14356-2ac8-4e96-87f4-38cd42c1427f",
                        "type": "clozeBankSubItem"
                    }
                }
            },
            'progress': {
                id: "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                data: {
                    "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6": {
                        "type": "sequence",
                        "parent": "4ab7c59c-1407-4bcb-aa00-b0966f2dcff2",
                        "children": ["c4941191-f55d-4ca2-bda2-a76b32ef8f0e"],
                        "data": {
                            "title": "New Sequence 2",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"36da3b8f-0c3d-4ca7-89da-63d5c1455fd6\"> <task exposureid=\"0\" type=\"mc\" id=\"c4941191-f55d-4ca2-bda2-a76b32ef8f0e\" check_type=\"auto\" sha1=\"22c372fe1ed5f1e00b422c432ce8d245f8486014\"> <question id=\"00b5d09f-97b1-4da5-9eba-c43bc068bce0\" auto_tag=\"auto_tag\"> <textviewer id=\"ac2f7000-61b1-4ce3-9c77-f09aa00a180f\"> <p><span class=\"normal\">question</span></p> </textviewer> </question>\n<answer checkingmode=\"generic\" type=\"mc\"> <options> <option id=\"9c85e6a5-66a3-4cd6-96f7-280a8faece66\" correct=\"true\" auto_tag=\"auto_tag\"> <textviewer id=\"51662cbf-2a03-404c-a11c-07309f8e7f68\"> <p><span class=\"normal\">answer 1</span></p> </textviewer> </option>\n<option id=\"62642904-5c13-4d92-9074-fbbe2eabc614\" correct=\"false\" auto_tag=\"auto_tag\"> <textviewer id=\"356fdc89-f90a-450b-9f56-7272f3b1f302\"> <p><span class=\"normal\">answer 2</span></p> </textviewer> </option> </options>\n</answer> <progress id=\"13054406-7d9d-46a4-ae24-53639b287ba4\"> <ignorechecking> </ignorechecking> <attempts>1</attempts> <checkable>true</checkable> <hint> <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message> <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message> <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"1\"> <textviewer id=\"e7ee8659-2b17-4743-b062-945dae963e60\"> <p><span class=\"normal\">hint</span></p> </textviewer> </message>\n</hint> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"abb07531-09b2-461c-96c0-4c2325402974\"> <p><span class=\"feedback\">Nice work!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"3b589742-ec4d-471f-b241-08058e48edc0\"> <p><span class=\"feedback\">Nice work!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"f84be1d4-24e7-4312-a180-3bfcc105113c\"> <p><span class=\"feedback\">Try again.</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"28a5fe33-a96a-4cb9-bf20-846e2d74699b\"> <p><span class=\"feedback\">Click \"show answer\"</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"407b73cc-63cb-4436-bde0-3400fbf6db2f\"> <textviewer id=\"46311190-dea6-4b71-bcc8-d560a5d4f43b\"> <p><span class=\"instruction\">Select the correct answer.</span></p> </textviewer> </instruction> </progress> </task>\n</sequence>"
                    },
                    "c4941191-f55d-4ca2-bda2-a76b32ef8f0e": {
                        "id": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "type": "mc",
                        "parent": "36da3b8f-0c3d-4ca7-89da-63d5c1455fd6",
                        "children": ["00b5d09f-97b1-4da5-9eba-c43bc068bce0", "35b68885-b1df-409e-92f0-d38cf49eec6f", "13054406-7d9d-46a4-ae24-53639b287ba4"],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "407b73cc-63cb-4436-bde0-3400fbf6db2f": {
                        "id": "407b73cc-63cb-4436-bde0-3400fbf6db2f",
                        "type": "instruction",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["46311190-dea6-4b71-bcc8-d560a5d4f43b"],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "46311190-dea6-4b71-bcc8-d560a5d4f43b": {
                        "id": "46311190-dea6-4b71-bcc8-d560a5d4f43b",
                        "type": "textViewer",
                        "parent": "407b73cc-63cb-4436-bde0-3400fbf6db2f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Select the correct answer.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "00b5d09f-97b1-4da5-9eba-c43bc068bce0": {
                        "id": "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                        "type": "question",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["ac2f7000-61b1-4ce3-9c77-f09aa00a180f"],
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
                    "ac2f7000-61b1-4ce3-9c77-f09aa00a180f": {
                        "type": "textViewer",
                        "parent": "00b5d09f-97b1-4da5-9eba-c43bc068bce0",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "ac2f7000-61b1-4ce3-9c77-f09aa00a180f"
                    },
                    "35b68885-b1df-409e-92f0-d38cf49eec6f": {
                        "id": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "type": "mcAnswer",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["9c85e6a5-66a3-4cd6-96f7-280a8faece66", "62642904-5c13-4d92-9074-fbbe2eabc614"],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "9c85e6a5-66a3-4cd6-96f7-280a8faece66": {
                        "id": "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                        "type": "option",
                        "parent": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "children": ["51662cbf-2a03-404c-a11c-07309f8e7f68"],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "51662cbf-2a03-404c-a11c-07309f8e7f68": {
                        "id": "51662cbf-2a03-404c-a11c-07309f8e7f68",
                        "type": "textViewer",
                        "parent": "9c85e6a5-66a3-4cd6-96f7-280a8faece66",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">answer 1</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "62642904-5c13-4d92-9074-fbbe2eabc614": {
                        "id": "62642904-5c13-4d92-9074-fbbe2eabc614",
                        "type": "option",
                        "parent": "35b68885-b1df-409e-92f0-d38cf49eec6f",
                        "children": ["356fdc89-f90a-450b-9f56-7272f3b1f302"],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "356fdc89-f90a-450b-9f56-7272f3b1f302": {
                        "id": "356fdc89-f90a-450b-9f56-7272f3b1f302",
                        "type": "textViewer",
                        "parent": "62642904-5c13-4d92-9074-fbbe2eabc614",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">answer 2</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "13054406-7d9d-46a4-ae24-53639b287ba4": {
                        "id": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "type": "progress",
                        "parent": "c4941191-f55d-4ca2-bda2-a76b32ef8f0e",
                        "children": ["27231e07-021b-4b67-8cc0-635c82447994", "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb", "407b73cc-63cb-4436-bde0-3400fbf6db2f"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "1",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong", "all_incorrect"]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "27231e07-021b-4b67-8cc0-635c82447994": {
                        "id": "27231e07-021b-4b67-8cc0-635c82447994",
                        "type": "hint",
                        "parent": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "children": ["e7ee8659-2b17-4743-b062-945dae963e60"],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "1"
                        }
                    },
                    "e7ee8659-2b17-4743-b062-945dae963e60": {
                        "type": "textViewer",
                        "parent": "27231e07-021b-4b67-8cc0-635c82447994",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">hint</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "e7ee8659-2b17-4743-b062-945dae963e60"
                    },
                    "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb": {
                        "id": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "type": "feedback",
                        "parent": "13054406-7d9d-46a4-ae24-53639b287ba4",
                        "children": ["abb07531-09b2-461c-96c0-4c2325402974", "3b589742-ec4d-471f-b241-08058e48edc0", "f84be1d4-24e7-4312-a180-3bfcc105113c", "28a5fe33-a96a-4cb9-bf20-846e2d74699b"],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect"],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "abb07531-09b2-461c-96c0-4c2325402974",
                                    "final": "3b589742-ec4d-471f-b241-08058e48edc0"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "f84be1d4-24e7-4312-a180-3bfcc105113c",
                                    "final": "28a5fe33-a96a-4cb9-bf20-846e2d74699b"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "Custom"
                    },
                    "abb07531-09b2-461c-96c0-4c2325402974": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Nice work!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "abb07531-09b2-461c-96c0-4c2325402974",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "3b589742-ec4d-471f-b241-08058e48edc0": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Nice work!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "3b589742-ec4d-471f-b241-08058e48edc0",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "f84be1d4-24e7-4312-a180-3bfcc105113c": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Try again.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "f84be1d4-24e7-4312-a180-3bfcc105113c",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "28a5fe33-a96a-4cb9-bf20-846e2d74699b": {
                        "type": "textViewer",
                        "parent": "7dfe3348-cc2d-4f7a-b9ef-1bf24d122fcb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"feedback\">Click \"show answer\"</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "28a5fe33-a96a-4cb9-bf20-846e2d74699b",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'open_question': {
                'id': 'bc0dc9c3-6595-40eb-bdd8-0c1d2ab66eae',
                'data': {
                    "bc0dc9c3-6595-40eb-bdd8-0c1d2ab66eae": {
                        "type": "sequence",
                        "parent": "25ead251-c84d-4b27-b987-d52a7ef6f42f",
                        "children": [
                            "f1779d49-11d2-4a39-9d02-7b090a15c48c"
                        ],
                        "data": {
                            "title": "New Sequence 1",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [{
                                    "editorId": "417166c5-3eb2-46a9-b8aa-6b8efd9a94f1",
                                    "editorType": "textViewer",
                                    "editorGroup": "task",
                                    "msg": "The text object does not have any content. Return to the Text editor and enter content."
                                }],
                                "bubbleUp": true
                            }
                        },
                        "id": "bc0dc9c3-6595-40eb-bdd8-0c1d2ab66eae",
                        "is_modified": true,
                        "convertedData": "<sequence type=\"simple\" id=\"bc0dc9c3-6595-40eb-bdd8-0c1d2ab66eae\"> <task exposureid=\"0\" type=\"opq\" id=\"f1779d49-11d2-4a39-9d02-7b090a15c48c\" check_type=\"manual\" sha1=\"4037638965f8096920807120824c0f990d5ee61f\"> <question id=\"137eea81-7b68-4309-8f1f-ff1740a65f26\" auto_tag=\"auto_tag\"> <textviewer id=\"417166c5-3eb2-46a9-b8aa-6b8efd9a94f1\"> <p><span class=\"normal\">question</span></p> </textviewer> </question>\n<answer checkable=\"\"> <subanswer> <texteditor mode=\"paragraph\" style=\"style1\" enabletoolbar=\"true\" toolbarpreset=\"studentMath\" maxchar=\"150\"> </texteditor>\n</subanswer>\n</answer>\n<progress id=\"a9d33a5f-70bc-4cb2-b00a-10ddf28f7eaa\"> <ignorechecking> </ignorechecking> <attempts></attempts> <checkable>true</checkable> </progress> </task>\n</sequence>"
                    },
                    "f1779d49-11d2-4a39-9d02-7b090a15c48c": {
                        "id": "f1779d49-11d2-4a39-9d02-7b090a15c48c",
                        "type": "FreeWriting",
                        "parent": "bc0dc9c3-6595-40eb-bdd8-0c1d2ab66eae",
                        "children": [
                            "137eea81-7b68-4309-8f1f-ff1740a65f26",
                            "c1d668a7-c6b3-4208-b77f-dff3f3d136df",
                            "a9d33a5f-70bc-4cb2-b00a-10ddf28f7eaa"
                        ],
                        "data": {
                            "title": "New Free Writing",
                            "task_check_type": "manual",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": false
                    },
                    "9398b9a1-9f8a-4f96-8d70-b327572b5751": {
                        "id": "9398b9a1-9f8a-4f96-8d70-b327572b5751",
                        "type": "instruction",
                        "parent": "f1779d49-11d2-4a39-9d02-7b090a15c48c",
                        "children": [
                            "94576be4-4f74-4a92-a3c1-520365afc9ec"
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
                    "94576be4-4f74-4a92-a3c1-520365afc9ec": {
                        "id": "94576be4-4f74-4a92-a3c1-520365afc9ec",
                        "type": "textViewer",
                        "parent": "9398b9a1-9f8a-4f96-8d70-b327572b5751",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Enter the answer in the Answer field.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "137eea81-7b68-4309-8f1f-ff1740a65f26": {
                        "id": "137eea81-7b68-4309-8f1f-ff1740a65f26",
                        "type": "question",
                        "parent": "f1779d49-11d2-4a39-9d02-7b090a15c48c",
                        "children": [
                            "417166c5-3eb2-46a9-b8aa-6b8efd9a94f1"
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
                    "417166c5-3eb2-46a9-b8aa-6b8efd9a94f1": {
                        "type": "textViewer",
                        "parent": "137eea81-7b68-4309-8f1f-ff1740a65f26",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">question</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "417166c5-3eb2-46a9-b8aa-6b8efd9a94f1"
                    },
                    "c1d668a7-c6b3-4208-b77f-dff3f3d136df": {
                        "id": "c1d668a7-c6b3-4208-b77f-dff3f3d136df",
                        "type": "FreeWritingAnswer",
                        "parent": "f1779d49-11d2-4a39-9d02-7b090a15c48c",
                        "children": [
                            "5dcb9593-6e02-449a-a8eb-f22834338d2c"
                        ],
                        "data": {
                            "title": "Free Writing Answer",
                            "disableDelete": true,
                            "has_questions": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5dcb9593-6e02-449a-a8eb-f22834338d2c": {
                        "id": "5dcb9593-6e02-449a-a8eb-f22834338d2c",
                        "type": "textEditor",
                        "parent": "c1d668a7-c6b3-4208-b77f-dff3f3d136df",
                        "children": [],
                        "data": {
                            "title": "Free Writing Answer TextViewer",
                            "disableDelete": true,
                            "answer_size": "Paragraph",
                            "MaxChars": "150",
                            "ShowToolbar": true,
                            "allowedSizes": [{
                                "value": "Line",
                                "text": "Line"
                            }, {
                                "value": "Paragraph",
                                "text": "Paragraph"
                            }, {
                                "value": "FullText",
                                "text": "Full Text"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "a9d33a5f-70bc-4cb2-b00a-10ddf28f7eaa": {
                        "id": "a9d33a5f-70bc-4cb2-b00a-10ddf28f7eaa",
                        "type": "progress",
                        "parent": "f1779d49-11d2-4a39-9d02-7b090a15c48c",
                        "children": [
                            "12bd7640-54c5-4fda-9f68-45f5d718561e",
                            "9398b9a1-9f8a-4f96-8d70-b327572b5751"
                        ],
                        "data": {
                            "ignore_defaults": "true",
                            "title": "Progress",
                            "show_hint": false,
                            "button_label": "Continue",
                            "feedback_type": "none",
                            "disableDelete": true,
                            "hint_timing": 1,
                            "showOnlyAlways": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "12bd7640-54c5-4fda-9f68-45f5d718561e": {
                        "id": "12bd7640-54c5-4fda-9f68-45f5d718561e",
                        "type": "hint",
                        "parent": "a9d33a5f-70bc-4cb2-b00a-10ddf28f7eaa",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true
                        }
                    }
                }
            }
        },
        'iw_IL': {
            'task': {
                'id': "1ee0532f-b554-4c1e-8735-2556afe4494d",
                'data': {
                    "1ee0532f-b554-4c1e-8735-2556afe4494d": {
                        "type": "sequence",
                        "parent": "a188f1d4-2d5e-4ab6-a974-d410c4502708",
                        "children": [
                            "dab9e897-2c4b-4122-92aa-c5742bb1a937",
                            "0619e638-f672-491e-b852-31dee66f63ee"
                        ],
                        "data": {
                            "title": "New Sequence 1",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"1ee0532f-b554-4c1e-8735-2556afe4494d\"> <task exposureid=\"0\" type=\"statement\" id=\"dab9e897-2c4b-4122-92aa-c5742bb1a937\" check_type=\"none\" sha1=\"75758428948aee334fe226bab50c13d9c48031cd\"> <mode>pedagogical</mode> <tasktitle> <textviewer id=\"f57d8943-7ff1-48ad-b2fb-ede05de8d867\"> <p><span class=\"pedagogicalTitle\">כותרת</span></p> </textviewer> </tasktitle>\n<question id=\"89bfc6e2-be58-4b88-a47d-7b759f1f2426\" auto_tag=\"auto_tag\"> <textviewer id=\"33df6ac4-c601-40c9-aa61-8be32046a6ec\"> <p><span class=\"normal\">שאלה</span></p> </textviewer> </question>\n<progress id=\"ec73358a-e602-405f-96f4-57ca81c083d4\"> <ignorechecking> </ignorechecking> <attempts>0</attempts> <checkable>true</checkable> </progress> </task>\n<task exposureid=\"1\" type=\"mc\" id=\"0619e638-f672-491e-b852-31dee66f63ee\" check_type=\"auto\" sha1=\"efabaf80f67aec8e8fec995c18b531efb507f92d\"> <question id=\"e63a97cf-7498-4214-b41a-b1aac4698085\" auto_tag=\"auto_tag\"> <textviewer id=\"1db9049f-5a9e-4b24-8d30-a76746d89acb\"> <p><span class=\"normal\">שאלה</span></p> </textviewer> </question>\n<answer checkingmode=\"generic\" type=\"mc\"> <options> <option id=\"8511749f-9d64-4a23-be22-30d24b28e426\" correct=\"true\" auto_tag=\"auto_tag\"> <textviewer id=\"8ae03587-94ee-44a6-8357-20d1fd7f59d0\"> <p><span class=\"normal\">אפשרות 1</span></p> </textviewer> </option>\n<option id=\"c6e38007-d95f-4d43-b1f3-ff3bdd4497e3\" correct=\"false\" auto_tag=\"auto_tag\"> <textviewer id=\"266810df-926f-41a4-aecd-1482531dfd93\"> <p><span class=\"normal\">אפשרות 2</span></p> </textviewer> </option> </options>\n</answer> <progress id=\"6312f258-429e-430e-bbdb-6f14dadb3278\"> <ignorechecking> </ignorechecking> <attempts>2</attempts> <checkable>true</checkable> <hint> <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message> <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message> <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message>\n</hint> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"e4b16ba4-8c06-4e00-8d06-47620d3253fc\"> <p><span class=\"feedback\">מצוין!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"eafd045a-e268-43ca-a7c0-65619903e63b\"> <p><span class=\"feedback\">יפה מאוד!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"fc519ef6-d694-470a-a6e9-8668d64a3354\"> <p><span class=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"5f865c75-e348-478f-b887-9c10acd62697\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובה הנכונה.</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"5c96b1a9-5873-4201-b107-806e872370b5\"> <textviewer id=\"e9035f67-77d8-4f23-abd2-71e2fa06ebba\"> <p><span class=\"instruction\">בחרו את התשובה הנכונה.</span></p> </textviewer> </instruction> </progress> </task>\n</sequence>"
                    },
                    "dab9e897-2c4b-4122-92aa-c5742bb1a937": {
                        "id": "dab9e897-2c4b-4122-92aa-c5742bb1a937",
                        "type": "pedagogicalStatement",
                        "parent": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "children": [
                            "2df2f855-daa5-48f4-badb-c0c0b1624188",
                            "89bfc6e2-be58-4b88-a47d-7b759f1f2426",
                            "ec73358a-e602-405f-96f4-57ca81c083d4"
                        ],
                        "data": {
                            "title": "New Pedagogical Statement",
                            "task_check_type": "none",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "2df2f855-daa5-48f4-badb-c0c0b1624188": {
                        "id": "2df2f855-daa5-48f4-badb-c0c0b1624188",
                        "type": "title",
                        "parent": "dab9e897-2c4b-4122-92aa-c5742bb1a937",
                        "children": [
                            "f57d8943-7ff1-48ad-b2fb-ede05de8d867"
                        ],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "show": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f57d8943-7ff1-48ad-b2fb-ede05de8d867": {
                        "id": "f57d8943-7ff1-48ad-b2fb-ede05de8d867",
                        "type": "textViewer",
                        "parent": "2df2f855-daa5-48f4-badb-c0c0b1624188",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs pedagogicalTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"pedagogicalTitle\">כותרת</div>",
                            "styleOverride": "pedagogicalTitle",
                            "mode": "singleStyle",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "89bfc6e2-be58-4b88-a47d-7b759f1f2426": {
                        "id": "89bfc6e2-be58-4b88-a47d-7b759f1f2426",
                        "type": "question",
                        "parent": "dab9e897-2c4b-4122-92aa-c5742bb1a937",
                        "children": [
                            "33df6ac4-c601-40c9-aa61-8be32046a6ec"
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
                    "33df6ac4-c601-40c9-aa61-8be32046a6ec": {
                        "type": "textViewer",
                        "parent": "89bfc6e2-be58-4b88-a47d-7b759f1f2426",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">שאלה</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "33df6ac4-c601-40c9-aa61-8be32046a6ec"
                    },
                    "ec73358a-e602-405f-96f4-57ca81c083d4": {
                        "id": "ec73358a-e602-405f-96f4-57ca81c083d4",
                        "type": "progress",
                        "parent": "dab9e897-2c4b-4122-92aa-c5742bb1a937",
                        "children": [],
                        "data": {
                            "ignore_defaults": "true",
                            "title": "Progress",
                            "show_hint": false,
                            "button_label": "Continue",
                            "disableDelete": true,
                            "num_of_attempts": "0",
                            "hint_timing": 1,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "0619e638-f672-491e-b852-31dee66f63ee": {
                        "id": "0619e638-f672-491e-b852-31dee66f63ee",
                        "type": "mc",
                        "parent": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "children": [
                            "e63a97cf-7498-4214-b41a-b1aac4698085",
                            "8f17c980-4efb-45b3-9881-a904a963f736",
                            "6312f258-429e-430e-bbdb-6f14dadb3278"
                        ],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "5c96b1a9-5873-4201-b107-806e872370b5": {
                        "id": "5c96b1a9-5873-4201-b107-806e872370b5",
                        "type": "instruction",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "e9035f67-77d8-4f23-abd2-71e2fa06ebba"
                        ],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "e9035f67-77d8-4f23-abd2-71e2fa06ebba": {
                        "id": "e9035f67-77d8-4f23-abd2-71e2fa06ebba",
                        "type": "textViewer",
                        "parent": "5c96b1a9-5873-4201-b107-806e872370b5",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">בחרו את התשובה הנכונה.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e63a97cf-7498-4214-b41a-b1aac4698085": {
                        "id": "e63a97cf-7498-4214-b41a-b1aac4698085",
                        "type": "question",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "1db9049f-5a9e-4b24-8d30-a76746d89acb"
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
                    "1db9049f-5a9e-4b24-8d30-a76746d89acb": {
                        "type": "textViewer",
                        "parent": "e63a97cf-7498-4214-b41a-b1aac4698085",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">שאלה</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "1db9049f-5a9e-4b24-8d30-a76746d89acb"
                    },
                    "8f17c980-4efb-45b3-9881-a904a963f736": {
                        "id": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "type": "mcAnswer",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "8511749f-9d64-4a23-be22-30d24b28e426",
                            "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3"
                        ],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "8511749f-9d64-4a23-be22-30d24b28e426": {
                        "id": "8511749f-9d64-4a23-be22-30d24b28e426",
                        "type": "option",
                        "parent": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "children": [
                            "8ae03587-94ee-44a6-8357-20d1fd7f59d0"
                        ],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "8ae03587-94ee-44a6-8357-20d1fd7f59d0": {
                        "id": "8ae03587-94ee-44a6-8357-20d1fd7f59d0",
                        "type": "textViewer",
                        "parent": "8511749f-9d64-4a23-be22-30d24b28e426",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">אפשרות 1</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3": {
                        "id": "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3",
                        "type": "option",
                        "parent": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "children": [
                            "266810df-926f-41a4-aecd-1482531dfd93"
                        ],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "266810df-926f-41a4-aecd-1482531dfd93": {
                        "id": "266810df-926f-41a4-aecd-1482531dfd93",
                        "type": "textViewer",
                        "parent": "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">אפשרות 2</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "6312f258-429e-430e-bbdb-6f14dadb3278": {
                        "id": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "type": "progress",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                            "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                            "5c96b1a9-5873-4201-b107-806e872370b5"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "missing_item",
                                    "partly_correct_missing_item",
                                    "partly_correct_more_80",
                                    "partly_correct_less_80",
                                    "all_correct_and_wrong",
                                    "all_incorrect"
                                ]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bb704530-4515-4614-b2b5-1a47f3cb2d4d": {
                        "id": "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                        "type": "hint",
                        "parent": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "children": [
                            "bd649f6b-0623-408e-bb9e-4893d1b5081f"
                        ],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "bd649f6b-0623-408e-bb9e-4893d1b5081f": {
                        "type": "textViewer",
                        "parent": "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">רמז</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "bd649f6b-0623-408e-bb9e-4893d1b5081f"
                    },
                    "35d0e0e3-3e44-4d85-815b-3a11a5edc214": {
                        "id": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "type": "feedback",
                        "parent": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "children": [
                            "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                            "eafd045a-e268-43ca-a7c0-65619903e63b",
                            "fc519ef6-d694-470a-a6e9-8668d64a3354",
                            "5f865c75-e348-478f-b887-9c10acd62697"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect"
                            ],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                                    "final": "eafd045a-e268-43ca-a7c0-65619903e63b"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "fc519ef6-d694-470a-a6e9-8668d64a3354",
                                    "final": "5f865c75-e348-478f-b887-9c10acd62697"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "mc_single_answer_generic"
                    },
                    "e4b16ba4-8c06-4e00-8d06-47620d3253fc": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">מצוין!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "eafd045a-e268-43ca-a7c0-65619903e63b": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">יפה מאוד!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "eafd045a-e268-43ca-a7c0-65619903e63b",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "fc519ef6-d694-470a-a6e9-8668d64a3354": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "fc519ef6-d694-470a-a6e9-8668d64a3354",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "5f865c75-e348-478f-b887-9c10acd62697": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובה הנכונה.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "5f865c75-e348-478f-b887-9c10acd62697",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'mc': {
                "id": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                "data": {
                    "1ee0532f-b554-4c1e-8735-2556afe4494d": {
                        "type": "sequence",
                        "parent": "a188f1d4-2d5e-4ab6-a974-d410c4502708",
                        "children": [
                            "0619e638-f672-491e-b852-31dee66f63ee"
                        ],
                        "data": {
                            "title": "New Sequence 1",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "is_modified": false,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"1ee0532f-b554-4c1e-8735-2556afe4494d\"> <task exposureid=\"0\" type=\"mc\" id=\"0619e638-f672-491e-b852-31dee66f63ee\" check_type=\"auto\" sha1=\"eeb1ff87239ffc4ae9b08274365feb7218eb32b1\"> <question id=\"e63a97cf-7498-4214-b41a-b1aac4698085\" auto_tag=\"auto_tag\"> <textviewer id=\"1db9049f-5a9e-4b24-8d30-a76746d89acb\"> <p><span class=\"normal\">שאלה</span></p> </textviewer> </question>\n<answer checkingmode=\"generic\" type=\"mc\"> <options> <option id=\"8511749f-9d64-4a23-be22-30d24b28e426\" correct=\"true\" auto_tag=\"auto_tag\"> <textviewer id=\"8ae03587-94ee-44a6-8357-20d1fd7f59d0\"> <p><span class=\"normal\">אפשרות 1</span></p> </textviewer> </option>\n<option id=\"c6e38007-d95f-4d43-b1f3-ff3bdd4497e3\" correct=\"false\" auto_tag=\"auto_tag\"> <textviewer id=\"266810df-926f-41a4-aecd-1482531dfd93\"> <p><span class=\"normal\">אפשרות 2</span></p> </textviewer> </option> </options>\n</answer> <progress id=\"6312f258-429e-430e-bbdb-6f14dadb3278\"> <ignorechecking> </ignorechecking> <attempts>2</attempts> <checkable>true</checkable> <hint> <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message> <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message> <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message>\n</hint> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"e4b16ba4-8c06-4e00-8d06-47620d3253fc\"> <p><span class=\"feedback\">מצוין!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"eafd045a-e268-43ca-a7c0-65619903e63b\"> <p><span class=\"feedback\">יפה מאוד!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"fc519ef6-d694-470a-a6e9-8668d64a3354\"> <p><span class=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"5f865c75-e348-478f-b887-9c10acd62697\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובה הנכונה.</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback> </progress> </task>\n</sequence>"
                    },
                    "0619e638-f672-491e-b852-31dee66f63ee": {
                        "id": "0619e638-f672-491e-b852-31dee66f63ee",
                        "type": "mc",
                        "parent": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "children": [
                            "e63a97cf-7498-4214-b41a-b1aac4698085",
                            "8f17c980-4efb-45b3-9881-a904a963f736",
                            "6312f258-429e-430e-bbdb-6f14dadb3278"
                        ],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "5c96b1a9-5873-4201-b107-806e872370b5": {
                        "id": "5c96b1a9-5873-4201-b107-806e872370b5",
                        "type": "instruction",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "e9035f67-77d8-4f23-abd2-71e2fa06ebba"
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
                    "e9035f67-77d8-4f23-abd2-71e2fa06ebba": {
                        "id": "e9035f67-77d8-4f23-abd2-71e2fa06ebba",
                        "type": "textViewer",
                        "parent": "5c96b1a9-5873-4201-b107-806e872370b5",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">בחרו את התשובה הנכונה.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e63a97cf-7498-4214-b41a-b1aac4698085": {
                        "id": "e63a97cf-7498-4214-b41a-b1aac4698085",
                        "type": "question",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "1db9049f-5a9e-4b24-8d30-a76746d89acb"
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
                    "1db9049f-5a9e-4b24-8d30-a76746d89acb": {
                        "type": "textViewer",
                        "parent": "e63a97cf-7498-4214-b41a-b1aac4698085",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">שאלה</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "1db9049f-5a9e-4b24-8d30-a76746d89acb"
                    },
                    "8f17c980-4efb-45b3-9881-a904a963f736": {
                        "id": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "type": "mcAnswer",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "8511749f-9d64-4a23-be22-30d24b28e426",
                            "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3"
                        ],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "8511749f-9d64-4a23-be22-30d24b28e426": {
                        "id": "8511749f-9d64-4a23-be22-30d24b28e426",
                        "type": "option",
                        "parent": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "children": [
                            "8ae03587-94ee-44a6-8357-20d1fd7f59d0"
                        ],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "8ae03587-94ee-44a6-8357-20d1fd7f59d0": {
                        "id": "8ae03587-94ee-44a6-8357-20d1fd7f59d0",
                        "type": "textViewer",
                        "parent": "8511749f-9d64-4a23-be22-30d24b28e426",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">אפשרות 1</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3": {
                        "id": "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3",
                        "type": "option",
                        "parent": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "children": [
                            "266810df-926f-41a4-aecd-1482531dfd93"
                        ],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "266810df-926f-41a4-aecd-1482531dfd93": {
                        "id": "266810df-926f-41a4-aecd-1482531dfd93",
                        "type": "textViewer",
                        "parent": "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">אפשרות 2</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "6312f258-429e-430e-bbdb-6f14dadb3278": {
                        "id": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "type": "progress",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                            "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                            "5c96b1a9-5873-4201-b107-806e872370b5"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "missing_item",
                                    "partly_correct_missing_item",
                                    "partly_correct_more_80",
                                    "partly_correct_less_80",
                                    "all_correct_and_wrong",
                                    "all_incorrect"
                                ]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bb704530-4515-4614-b2b5-1a47f3cb2d4d": {
                        "id": "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                        "type": "hint",
                        "parent": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "children": [
                            "bd649f6b-0623-408e-bb9e-4893d1b5081f"
                        ],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "bd649f6b-0623-408e-bb9e-4893d1b5081f": {
                        "type": "textViewer",
                        "parent": "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">רמז</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "bd649f6b-0623-408e-bb9e-4893d1b5081f"
                    },
                    "35d0e0e3-3e44-4d85-815b-3a11a5edc214": {
                        "id": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "type": "feedback",
                        "parent": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "children": [
                            "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                            "eafd045a-e268-43ca-a7c0-65619903e63b",
                            "fc519ef6-d694-470a-a6e9-8668d64a3354",
                            "5f865c75-e348-478f-b887-9c10acd62697"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect"
                            ],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                                    "final": "eafd045a-e268-43ca-a7c0-65619903e63b"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "fc519ef6-d694-470a-a6e9-8668d64a3354",
                                    "final": "5f865c75-e348-478f-b887-9c10acd62697"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "mc_single_answer_generic"
                    },
                    "e4b16ba4-8c06-4e00-8d06-47620d3253fc": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">מצוין!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "eafd045a-e268-43ca-a7c0-65619903e63b": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">יפה מאוד!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "eafd045a-e268-43ca-a7c0-65619903e63b",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "fc519ef6-d694-470a-a6e9-8668d64a3354": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "fc519ef6-d694-470a-a6e9-8668d64a3354",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "5f865c75-e348-478f-b887-9c10acd62697": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובה הנכונה.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "5f865c75-e348-478f-b887-9c10acd62697",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'progress': {
                "id": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                "data": {
                    "1ee0532f-b554-4c1e-8735-2556afe4494d": {
                        "type": "sequence",
                        "parent": "a188f1d4-2d5e-4ab6-a974-d410c4502708",
                        "children": [
                            "0619e638-f672-491e-b852-31dee66f63ee"
                        ],
                        "data": {
                            "title": "New Sequence 1",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "is_modified": false,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"1ee0532f-b554-4c1e-8735-2556afe4494d\"> <task exposureid=\"0\" type=\"mc\" id=\"0619e638-f672-491e-b852-31dee66f63ee\" check_type=\"auto\" sha1=\"eeb1ff87239ffc4ae9b08274365feb7218eb32b1\"> <question id=\"e63a97cf-7498-4214-b41a-b1aac4698085\" auto_tag=\"auto_tag\"> <textviewer id=\"1db9049f-5a9e-4b24-8d30-a76746d89acb\"> <p><span class=\"normal\">שאלה</span></p> </textviewer> </question>\n<answer checkingmode=\"generic\" type=\"mc\"> <options> <option id=\"8511749f-9d64-4a23-be22-30d24b28e426\" correct=\"true\" auto_tag=\"auto_tag\"> <textviewer id=\"8ae03587-94ee-44a6-8357-20d1fd7f59d0\"> <p><span class=\"normal\">אפשרות 1</span></p> </textviewer> </option>\n<option id=\"c6e38007-d95f-4d43-b1f3-ff3bdd4497e3\" correct=\"false\" auto_tag=\"auto_tag\"> <textviewer id=\"266810df-926f-41a4-aecd-1482531dfd93\"> <p><span class=\"normal\">אפשרות 2</span></p> </textviewer> </option> </options>\n</answer> <progress id=\"6312f258-429e-430e-bbdb-6f14dadb3278\"> <ignorechecking> </ignorechecking> <attempts>2</attempts> <checkable>true</checkable> <hint> <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message> <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message> <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"2\"> <textviewer id=\"bd649f6b-0623-408e-bb9e-4893d1b5081f\"> <p><span class=\"normal\">רמז</span></p> </textviewer> </message>\n</hint> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"e4b16ba4-8c06-4e00-8d06-47620d3253fc\"> <p><span class=\"feedback\">מצוין!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"eafd045a-e268-43ca-a7c0-65619903e63b\"> <p><span class=\"feedback\">יפה מאוד!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"fc519ef6-d694-470a-a6e9-8668d64a3354\"> <p><span class=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"5f865c75-e348-478f-b887-9c10acd62697\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובה הנכונה.</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback> </progress> </task>\n</sequence>"
                    },
                    "0619e638-f672-491e-b852-31dee66f63ee": {
                        "id": "0619e638-f672-491e-b852-31dee66f63ee",
                        "type": "mc",
                        "parent": "1ee0532f-b554-4c1e-8735-2556afe4494d",
                        "children": [
                            "e63a97cf-7498-4214-b41a-b1aac4698085",
                            "8f17c980-4efb-45b3-9881-a904a963f736",
                            "6312f258-429e-430e-bbdb-6f14dadb3278"
                        ],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "5c96b1a9-5873-4201-b107-806e872370b5": {
                        "id": "5c96b1a9-5873-4201-b107-806e872370b5",
                        "type": "instruction",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "e9035f67-77d8-4f23-abd2-71e2fa06ebba"
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
                    "e9035f67-77d8-4f23-abd2-71e2fa06ebba": {
                        "id": "e9035f67-77d8-4f23-abd2-71e2fa06ebba",
                        "type": "textViewer",
                        "parent": "5c96b1a9-5873-4201-b107-806e872370b5",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">בחרו את התשובה הנכונה.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e63a97cf-7498-4214-b41a-b1aac4698085": {
                        "id": "e63a97cf-7498-4214-b41a-b1aac4698085",
                        "type": "question",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "1db9049f-5a9e-4b24-8d30-a76746d89acb"
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
                    "1db9049f-5a9e-4b24-8d30-a76746d89acb": {
                        "type": "textViewer",
                        "parent": "e63a97cf-7498-4214-b41a-b1aac4698085",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">שאלה</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "1db9049f-5a9e-4b24-8d30-a76746d89acb"
                    },
                    "8f17c980-4efb-45b3-9881-a904a963f736": {
                        "id": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "type": "mcAnswer",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "8511749f-9d64-4a23-be22-30d24b28e426",
                            "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3"
                        ],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "8511749f-9d64-4a23-be22-30d24b28e426": {
                        "id": "8511749f-9d64-4a23-be22-30d24b28e426",
                        "type": "option",
                        "parent": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "children": [
                            "8ae03587-94ee-44a6-8357-20d1fd7f59d0"
                        ],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "8ae03587-94ee-44a6-8357-20d1fd7f59d0": {
                        "id": "8ae03587-94ee-44a6-8357-20d1fd7f59d0",
                        "type": "textViewer",
                        "parent": "8511749f-9d64-4a23-be22-30d24b28e426",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">אפשרות 1</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3": {
                        "id": "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3",
                        "type": "option",
                        "parent": "8f17c980-4efb-45b3-9881-a904a963f736",
                        "children": [
                            "266810df-926f-41a4-aecd-1482531dfd93"
                        ],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "disableDelete": true
                        }
                    },
                    "266810df-926f-41a4-aecd-1482531dfd93": {
                        "id": "266810df-926f-41a4-aecd-1482531dfd93",
                        "type": "textViewer",
                        "parent": "c6e38007-d95f-4d43-b1f3-ff3bdd4497e3",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">אפשרות 2</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "6312f258-429e-430e-bbdb-6f14dadb3278": {
                        "id": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "type": "progress",
                        "parent": "0619e638-f672-491e-b852-31dee66f63ee",
                        "children": [
                            "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                            "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                            "5c96b1a9-5873-4201-b107-806e872370b5"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": [
                                    "all_correct",
                                    "all_incorrect"
                                ],
                                "mmc": [
                                    "all_correct",
                                    "missing_item",
                                    "partly_correct_missing_item",
                                    "partly_correct_more_80",
                                    "partly_correct_less_80",
                                    "all_correct_and_wrong",
                                    "all_incorrect"
                                ]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bb704530-4515-4614-b2b5-1a47f3cb2d4d": {
                        "id": "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                        "type": "hint",
                        "parent": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "children": [
                            "bd649f6b-0623-408e-bb9e-4893d1b5081f"
                        ],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "bd649f6b-0623-408e-bb9e-4893d1b5081f": {
                        "type": "textViewer",
                        "parent": "bb704530-4515-4614-b2b5-1a47f3cb2d4d",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">רמז</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "bd649f6b-0623-408e-bb9e-4893d1b5081f"
                    },
                    "35d0e0e3-3e44-4d85-815b-3a11a5edc214": {
                        "id": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "type": "feedback",
                        "parent": "6312f258-429e-430e-bbdb-6f14dadb3278",
                        "children": [
                            "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                            "eafd045a-e268-43ca-a7c0-65619903e63b",
                            "fc519ef6-d694-470a-a6e9-8668d64a3354",
                            "5f865c75-e348-478f-b887-9c10acd62697"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect"
                            ],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                                    "final": "eafd045a-e268-43ca-a7c0-65619903e63b"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "fc519ef6-d694-470a-a6e9-8668d64a3354",
                                    "final": "5f865c75-e348-478f-b887-9c10acd62697"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "mc_single_answer_generic"
                    },
                    "e4b16ba4-8c06-4e00-8d06-47620d3253fc": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">מצוין!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "e4b16ba4-8c06-4e00-8d06-47620d3253fc",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "eafd045a-e268-43ca-a7c0-65619903e63b": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">יפה מאוד!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "eafd045a-e268-43ca-a7c0-65619903e63b",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "fc519ef6-d694-470a-a6e9-8668d64a3354": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "fc519ef6-d694-470a-a6e9-8668d64a3354",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "5f865c75-e348-478f-b887-9c10acd62697": {
                        "type": "textViewer",
                        "parent": "35d0e0e3-3e44-4d85-815b-3a11a5edc214",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובה הנכונה.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "5f865c75-e348-478f-b887-9c10acd62697",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'header': {
                "id": "7d58f2b2-e352-4d41-90ec-23e170f2c681",
                "data": {
                    "7d58f2b2-e352-4d41-90ec-23e170f2c681": {
                        "type": "sequence",
                        "parent": "2f977216-c0e3-4894-b586-452064759ab3",
                        "children": [
                            "ab22e571-0d02-474a-831f-568c28f8e947",
                            "ac845cad-f39e-423a-9b60-dbe54fde701a"
                        ],
                        "data": {
                            "title": "New Sequence 1",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            }
                        },
                        "id": "7d58f2b2-e352-4d41-90ec-23e170f2c681",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"7d58f2b2-e352-4d41-90ec-23e170f2c681\"> <header id=\"ab22e571-0d02-474a-831f-568c28f8e947\"> <textviewer id=\"e6937356-2c43-4532-8cb4-9fcf84096fb0\"> <p><span class=\"sequenceTitle\">כותרת</span></p> </textviewer> </header> <instruction show=\"true\"> <textviewer id=\"d24ff169-1fe5-4b7e-8d5d-444bc39c6893\"> <p><span class=\"sequenceSubTitle\">תת כותרת</span></p> </textviewer> }</instruction> <task exposureid=\"1\" type=\"questionOnly\" id=\"ac845cad-f39e-423a-9b60-dbe54fde701a\" check_type=\"manual\" sha1=\"ae0103e45422f5a9ccd2b5c968649d5c4e17f5ed\"> <question id=\"30700f2d-1fc9-4ac5-9ec9-e5420fff0c56\" auto_tag=\"auto_tag\"> <textviewer id=\"c5f57350-8685-4b96-877c-bd422c910b5a\"> <p><span class=\"normal\">שאלה</span></p> </textviewer> </question>\n<progress id=\"991b0594-6855-4170-8be5-22cb30aeca21\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>0</attempts> <checkable>true</checkable> </progress> </task>\n</sequence>"
                    },
                    "ab22e571-0d02-474a-831f-568c28f8e947": {
                        "id": "ab22e571-0d02-474a-831f-568c28f8e947",
                        "type": "header",
                        "parent": "7d58f2b2-e352-4d41-90ec-23e170f2c681",
                        "children": [
                            "c3769a9b-6c0b-4ac7-8a8c-26849937f8aa",
                            "bb233bca-82c8-4d68-9ef5-28629b875bf9"
                        ],
                        "data": {
                            "title": "New header",
                            "task_check_type": "none",
                            "showGenericTitle": true,
                            "showGenericSubTitle": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "c3769a9b-6c0b-4ac7-8a8c-26849937f8aa": {
                        "id": "c3769a9b-6c0b-4ac7-8a8c-26849937f8aa",
                        "type": "genericTitle",
                        "parent": "ab22e571-0d02-474a-831f-568c28f8e947",
                        "children": [
                            "e6937356-2c43-4532-8cb4-9fcf84096fb0"
                        ],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "e6937356-2c43-4532-8cb4-9fcf84096fb0": {
                        "id": "e6937356-2c43-4532-8cb4-9fcf84096fb0",
                        "type": "textViewer",
                        "parent": "c3769a9b-6c0b-4ac7-8a8c-26849937f8aa",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs sequenceTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"sequenceTitle\">כותרת</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "sequenceTitle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "bb233bca-82c8-4d68-9ef5-28629b875bf9": {
                        "id": "bb233bca-82c8-4d68-9ef5-28629b875bf9",
                        "type": "genericSubTitle",
                        "parent": "ab22e571-0d02-474a-831f-568c28f8e947",
                        "children": [
                            "d24ff169-1fe5-4b7e-8d5d-444bc39c6893"
                        ],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "d24ff169-1fe5-4b7e-8d5d-444bc39c6893": {
                        "id": "d24ff169-1fe5-4b7e-8d5d-444bc39c6893",
                        "type": "textViewer",
                        "parent": "bb233bca-82c8-4d68-9ef5-28629b875bf9",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs sequenceSubTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"sequenceSubTitle\">תת כותרת</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "sequenceSubTitle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "ac845cad-f39e-423a-9b60-dbe54fde701a": {
                        "id": "ac845cad-f39e-423a-9b60-dbe54fde701a",
                        "type": "questionOnly",
                        "parent": "7d58f2b2-e352-4d41-90ec-23e170f2c681",
                        "children": [
                            "30700f2d-1fc9-4ac5-9ec9-e5420fff0c56",
                            "991b0594-6855-4170-8be5-22cb30aeca21"
                        ],
                        "data": {
                            "title": "New Question Only",
                            "task_check_type": "none",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "871caf6f-cb10-4d12-a764-c0ec33647df0": {
                        "id": "871caf6f-cb10-4d12-a764-c0ec33647df0",
                        "type": "instruction",
                        "parent": "ac845cad-f39e-423a-9b60-dbe54fde701a",
                        "children": [
                            "e066e7e5-f80a-4d51-b3e3-748b582fed50"
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
                    "e066e7e5-f80a-4d51-b3e3-748b582fed50": {
                        "id": "e066e7e5-f80a-4d51-b3e3-748b582fed50",
                        "type": "textViewer",
                        "parent": "871caf6f-cb10-4d12-a764-c0ec33647df0",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">Click to edit the instruction</div>",
                            "mode": "singleStylePlainText",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "showNarrationType": true
                        }
                    },
                    "30700f2d-1fc9-4ac5-9ec9-e5420fff0c56": {
                        "id": "30700f2d-1fc9-4ac5-9ec9-e5420fff0c56",
                        "type": "question",
                        "parent": "ac845cad-f39e-423a-9b60-dbe54fde701a",
                        "children": [
                            "c5f57350-8685-4b96-877c-bd422c910b5a"
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
                    "c5f57350-8685-4b96-877c-bd422c910b5a": {
                        "type": "textViewer",
                        "parent": "30700f2d-1fc9-4ac5-9ec9-e5420fff0c56",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">שאלה</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "c5f57350-8685-4b96-877c-bd422c910b5a"
                    },
                    "991b0594-6855-4170-8be5-22cb30aeca21": {
                        "id": "991b0594-6855-4170-8be5-22cb30aeca21",
                        "type": "progress",
                        "parent": "ac845cad-f39e-423a-9b60-dbe54fde701a",
                        "children": [
                            "241b7cdb-07e9-4694-a420-5cc8d9dd9e4a",
                            "871caf6f-cb10-4d12-a764-c0ec33647df0"
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
                    "241b7cdb-07e9-4694-a420-5cc8d9dd9e4a": {
                        "id": "241b7cdb-07e9-4694-a420-5cc8d9dd9e4a",
                        "type": "hint",
                        "parent": "991b0594-6855-4170-8be5-22cb30aeca21",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "maxAttempts": "0"
                        }
                    }
                }
            },
            'mtq': {
                'id': "ca9e968d-8b72-4e4a-be90-0b8b081a04fb",
                'data': {
                    "0": {
                        "id": 0,
                        "type": "mtqSubAnswer",
                        "parent": "a1e2124d-64a9-4bc9-a41d-50b090c0aac1",
                        "children": [
                            "5f8701f7-81cf-4513-8a5b-925a42f166a0"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "1": {
                        "id": 1,
                        "type": "mtqSubAnswer",
                        "parent": "a1e2124d-64a9-4bc9-a41d-50b090c0aac1",
                        "children": [
                            "aaeb9a61-5177-4018-953b-afac833b4c2d"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2": {
                        "id": 2,
                        "type": "mtqSubAnswer",
                        "parent": "a1e2124d-64a9-4bc9-a41d-50b090c0aac1",
                        "children": [
                            "90a52d22-da5c-4a71-a0b2-e842d0c69e57"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "3": {
                        "id": 3,
                        "type": "mtqSubAnswer",
                        "parent": "a1e2124d-64a9-4bc9-a41d-50b090c0aac1",
                        "children": [
                            "40c923e4-74d7-4a58-8ea0-3d925b179e8e"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ca9e968d-8b72-4e4a-be90-0b8b081a04fb": {
                        "type": "sequence",
                        "parent": "8117de46-59d2-4e13-94ef-bfa2c02ad2d0",
                        "children": [
                            "c7c24aff-1ea2-49ad-8dc6-34c839452e29",
                            "3647eed1-8ca5-4f5d-8ece-54f58edda894",
                            "cff80332-e3bd-48c0-939c-40b974691819"
                        ],
                        "data": {
                            "title": "New Sequence 1",
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
                        "id": "ca9e968d-8b72-4e4a-be90-0b8b081a04fb",
                        "is_modified": true,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"ca9e968d-8b72-4e4a-be90-0b8b081a04fb\"> <task exposureid=\"0\" type=\"mtq\" id=\"c7c24aff-1ea2-49ad-8dc6-34c839452e29\" check_type=\"auto\" sha1=\"1101d40ed9805a6e6b8657927d8659eecfafc64e\"> <mode>matching</mode> <!-- in mtq task --> <placeholders>true</placeholders> <bank>true</bank> <bankrandom>false</bankrandom> <!--dragAndCopy - reusable bank, dragAndDisable - not reusable --> <bankmode>dragAndDisable</bankmode> <mistakefactor>0</mistakefactor> <question id=\"fdb23df0-6879-4c46-af4a-6b636b7a8540\" auto_tag=\"auto_tag\"> </question>\n<answer checkable=\"\" checkingmode=\"advanced\"> <mtqarea id=\"8524d7e0-4aea-44a6-92dd-205ca0c9f63a\" auto_tag=\"auto_tag\"> <mtqsubquestion id=\"95a62fba-2914-4995-a14d-36ea390ca57c\" auto_tag=\"auto_tag\"> <definition id=\"84f5105a-bde8-4730-ad89-9995b5e39559\" auto_tag=\"auto_tag\"> <textviewer id=\"b06cb50c-3ab7-4e54-94cd-07df84996000\"> <p><span class=\"definition\">הגדרה 1</span></p> </textviewer> </definition> <subanswer answerid=\"df914454-0956-4355-bf2f-84ff42d5e12d\"> <correct> <option>0</option> </correct> </subanswer> </mtqsubquestion>\n<mtqsubquestion id=\"40d4d308-1a89-4af4-b25c-11c0d50e8c9a\" auto_tag=\"auto_tag\"> <definition id=\"6a01ef46-668a-4355-b188-9b64bee4e271\" auto_tag=\"auto_tag\"> <textviewer id=\"deb3ae70-8bbc-401e-93c2-2aba3cde641f\"> <p><span class=\"definition\">הגדרה 2</span></p> </textviewer> </definition> <subanswer answerid=\"6efa9ab5-ca31-4154-ad07-8a63aa4c6e43\"> <correct> <option>1</option> </correct> </subanswer> </mtqsubquestion>\n<mtqsubquestion id=\"4e2a84ba-ee12-46bc-9774-a04ccfda88f3\" auto_tag=\"auto_tag\"> <definition id=\"3781b18e-090d-4c44-afff-849922a281df\" auto_tag=\"auto_tag\"> <textviewer id=\"8bde90c5-ba41-4aaf-8184-80531ce782f0\"> <p><span class=\"definition\">הגדרה 2</span></p> </textviewer> </definition> <subanswer answerid=\"49c3d801-427c-47ab-998a-d120faa14ac2\"> <correct> <option>2</option> </correct> </subanswer> </mtqsubquestion>\n</mtqarea>\n<mtqbank id=\"de0fefb3-dd5b-49df-9dc9-f66308d989f5\" auto_tag=\"auto_tag\"> <subanswer answerid=\"ce65400e-4bb4-4f4b-aeb8-4c22253af7c3\"> <textviewer id=\"ec251156-a139-4e8a-904e-a361d767b015\"> <p><span class=\"normal\">פריט בנק 1</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"3cbff4cc-bb99-4275-a395-61a5aa02af5f\"> <textviewer id=\"3f4ca5e4-4338-4d8c-9f86-bf9340cd87fd\"> <p><span class=\"normal\">פריט בנק 2</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"0\"> <textviewer id=\"49b02b2d-4bb3-48ab-b604-c522f01a7444\"> <p><span class=\"normal\">תשובה 1</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"1\"> <textviewer id=\"319c5081-1e07-4be7-8c93-4a832e31e6fd\"> <p><span class=\"normal\">תשובה 2</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"2\"> <textviewer id=\"1ac15cae-51a5-45a0-8304-8f2688bb3529\"> <p><span class=\"normal\">תשובה 3</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> </mtqbank>\n</answer>\n<progress id=\"c6f86650-91e8-4f3a-82b9-3db3511e5ff0\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>2</attempts> <type>oneCompletion</type> <checkable>true</checkable> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"c71169aa-bc09-4695-9e6d-9f2fc9110b39\"> <p><span class=\"feedback\">מצוין!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"22abe38d-eb01-46df-909f-d56ff84725b4\"> <p><span class=\"feedback\">יפה מאוד!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"4f7bc0b3-d118-4abf-aa3b-d5c56134ab96\"> <p><span class=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"0298c0a0-b544-4e33-bdd2-4cffed9d7467\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allCorrectPartMissing\"> <textviewer id=\"e0925b63-e4e5-45e6-93d5-38ab0276d972\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrectPartMissing\"> <textviewer id=\"b1646612-ae9f-407c-a26d-ba8e40e09cbf\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectPartMissing\"> <textviewer id=\"697e6ee3-70ef-4ee6-ac27-290d910f3942\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectPartMissing\"> <textviewer id=\"048785a4-c75d-4cf7-b7eb-9c69cfad8447\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectMoreThan80Percent\"> <textviewer id=\"4e82e6bc-340f-4f35-9685-8f36c1411451\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectMoreThan80Percent\"> <textviewer id=\"c318fd90-3ca0-44ae-880a-ba5f9f4a0078\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectLessThan80Percent\"> <textviewer id=\"bb1c1935-b18e-49fe-9def-edabeb8409eb\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectLessThan80Percent\"> <textviewer id=\"f38b65a2-b492-4f39-8078-1198e0f0958c\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"899f02f9-1bd4-4db0-97bc-a2cd43f05eaa\"> <textviewer id=\"582ecdb8-8dbf-485b-b019-49e5273a308b\"> <p><span class=\"instruction\">התאימו את הפריטים להגדרות הנכונות.</span></p> </textviewer> </instruction> </progress> </task>\n<task exposureid=\"1\" type=\"mtq\" id=\"3647eed1-8ca5-4f5d-8ece-54f58edda894\" check_type=\"auto\" sha1=\"4bb9e6b5f4fb263f4fa29c8d5312b7d46e6dfe88\"> <mode>sequencing</mode> <!-- in mtq task --> <placeholders>false</placeholders> <bank>false</bank> <bankrandom>false</bankrandom> <!--dragAndCopy - reusable bank, dragAndDisable - not reusable --> <bankmode>dragAndDisable</bankmode> <mistakefactor>0</mistakefactor> <question id=\"ed29587d-5fc1-453f-a682-1bc96a7cd97d\" auto_tag=\"auto_tag\"> </question>\n<answer checkable=\"\" checkingmode=\"advanced\"> <mtqarea id=\"1c40bed2-b495-4055-b539-5d7219552c87\" auto_tag=\"auto_tag\"> <mtqmultisubquestion id=\"94a93486-8cf1-47c7-af94-cea574ebab8f\" auto_tag=\"auto_tag\"> <definition id=\"e76b7d7e-b806-47cc-9438-69faf0f74a15\" auto_tag=\"auto_tag\"> <textviewer id=\"cd20e2f1-d885-404b-be04-af6d290ab956\"> <p><span class=\"definition\">הגדרה- התחלה</span></p> </textviewer> </definition> <multisubanswer> <subanswer answerid=\"6f2dd9b8-1d88-4a03-a8bc-21089007bccc\"> <textviewer id=\"cc0a07a5-c2b0-4b71-93b1-67ada4f81494\"> <p><span class=\"normal\">תשובה 1</span></p> </textviewer> </subanswer> <subanswer answerid=\"9904b83c-ec70-4e09-b767-5ad77f129e7b\"> <textviewer id=\"4b55e156-26b0-4a8b-a255-fa67c6b0a9e5\"> <p><span class=\"normal\">תשובה 2</span></p> </textviewer> </subanswer> <subanswer answerid=\"9812483f-7206-4f5a-bece-6f60d6d9201b\"> <textviewer id=\"521272b0-1ee7-454d-a73d-f48c9b4b01ac\"> <p><span class=\"normal\">תשובה 3</span></p> </textviewer> </subanswer> <correct> <set>6f2dd9b8-1d88-4a03-a8bc-21089007bccc,9904b83c-ec70-4e09-b767-5ad77f129e7b,9812483f-7206-4f5a-bece-6f60d6d9201b</set> </correct>\n</multisubanswer>\n<definition id=\"84cc6f20-ecb6-43d9-8c26-b7e2dac99d51\" auto_tag=\"auto_tag\"> <textviewer id=\"f028071e-e29a-4e21-a149-3b47512cbc29\"> <p><span class=\"definition\">הגדרה- סוף</span></p> </textviewer> </definition>\n</mtqmultisubquestion>\n</mtqarea>\n</answer>\n<progress id=\"53b97af1-aace-45dd-9c50-0350b804f756\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>2</attempts> <type>oneCompletion</type> <checkable>true</checkable> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"235370d9-7472-4b62-99c6-3f31398baf74\"> <p><span class=\"feedback\">מצוין!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"acf06f36-5ee4-4236-8fe1-08ef4b917609\"> <p><span class=\"feedback\">יפה מאוד!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"2a48ad42-08d7-485b-84c2-4574a8bd3bb0\"> <p><span class=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"a99ecc18-8011-45a1-b026-3d1991adeff2\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allCorrectPartMissing\"> <textviewer id=\"edc12679-b255-44fb-b166-cb3e07cc4b2e\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrectPartMissing\"> <textviewer id=\"bf44d529-f738-4b16-baa6-cd566694c6b7\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectPartMissing\"> <textviewer id=\"696a6760-36fb-4174-8b42-858e92d12f99\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectPartMissing\"> <textviewer id=\"0ab8ac9b-e8af-420a-b758-1758ad9990c4\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectMoreThan80Percent\"> <textviewer id=\"2acc4332-a6b9-4eb7-9a32-a4fe1ab102a7\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectMoreThan80Percent\"> <textviewer id=\"1fc08ed7-f628-4395-8a28-f9487b74ee26\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectLessThan80Percent\"> <textviewer id=\"d07355d2-5fdf-480a-9e27-45abc074c84a\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectLessThan80Percent\"> <textviewer id=\"d60eade9-29bb-4cf2-9e10-61eaed6ce7c7\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allCorrectPartIncorrect\"> <textviewer id=\"1f30207f-924b-4235-aeae-29ddb138ac4a\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrectPartIncorrect\"> <textviewer id=\"6f348133-7919-451d-9fe2-a903da68b17a\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback> </progress> </task>\n<task exposureid=\"2\" type=\"mtq\" id=\"cff80332-e3bd-48c0-939c-40b974691819\" check_type=\"auto\" sha1=\"fecd457bbe875152dd87dd9939e517c1c91aa724\"> <mode>sorting</mode> <!-- in mtq task --> <placeholders>true</placeholders> <bank>true</bank> <bankrandom>false</bankrandom> <!--dragAndCopy - reusable bank, dragAndDisable - not reusable --> <bankmode>dragAndDisable</bankmode> <mistakefactor>1</mistakefactor> <question id=\"7a019e77-2df4-4f56-a22c-f2bd71ba09eb\" auto_tag=\"auto_tag\"> </question>\n<answer checkable=\"\" checkingmode=\"advanced\"> <mtqarea id=\"d281ff92-831a-4ea5-b3b2-e73d43e709d0\" auto_tag=\"auto_tag\"> <mtqmultisubquestion id=\"41d010ea-d555-4ffa-b259-cb58904474df\" auto_tag=\"auto_tag\"> <definition id=\"86b939f9-f5b6-4379-8f80-b21915ee2829\" auto_tag=\"auto_tag\"> <textviewer id=\"1d901d4d-2f86-443f-9338-ec13c0724956\"> <p><span class=\"definition\">הגדרה 1</span></p> </textviewer> </definition> <multisubanswer> <subanswer answerid=\"09e2180d-36e6-46ce-a290-2604bc65d3c2\"> </subanswer> <subanswer answerid=\"dab8b767-7449-4201-910f-1d5bafe9f21c\"> </subanswer> <correct> <set>0,1</set> </correct>\n</multisubanswer>\n</mtqmultisubquestion>\n<mtqmultisubquestion id=\"3a655a98-0034-4c20-9d49-2bd8741870f1\" auto_tag=\"auto_tag\"> <definition id=\"26f9b7d7-8043-4e5f-be9a-f1878e3f4a49\" auto_tag=\"auto_tag\"> <textviewer id=\"d5bcdaf5-53b1-41a4-bb27-3f04dc1cd544\"> <p><span class=\"definition\">הגדרה 2</span></p> </textviewer> </definition> <multisubanswer> <subanswer answerid=\"f4a4ba01-34d9-4a3e-b9d2-0ff7860c3759\"> </subanswer> <subanswer answerid=\"bbc8fe8d-bb23-4d90-bf06-6d2bfa709419\"> </subanswer> <correct> <set>2,3</set> </correct>\n</multisubanswer>\n</mtqmultisubquestion>\n</mtqarea>\n<mtqbank id=\"a1e2124d-64a9-4bc9-a41d-50b090c0aac1\" auto_tag=\"auto_tag\"> <subanswer answerid=\"0\"> <textviewer id=\"5f8701f7-81cf-4513-8a5b-925a42f166a0\"> <p><span class=\"normal\">תשובה 1.1</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"1\"> <textviewer id=\"aaeb9a61-5177-4018-953b-afac833b4c2d\"> <p><span class=\"normal\">תשובה 2.2</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"2\"> <textviewer id=\"90a52d22-da5c-4a71-a0b2-e842d0c69e57\"> <p><span class=\"normal\">תשובה 2.1</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> <subanswer answerid=\"3\"> <textviewer id=\"40c923e4-74d7-4a58-8ea0-3d925b179e8e\"> <p><span class=\"normal\">תשובה 2.2</span></p> </textviewer> <correct> <option></option> </correct> </subanswer> </mtqbank>\n</answer>\n<progress id=\"0dedb5bc-5cad-47fb-9a1b-45b08a6eff02\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>2</attempts> <type>oneCompletion</type> <checkable>true</checkable> <feedback> <message attempt=\"first\" type=\"allCorrect\"> <textviewer id=\"ed99b7f9-dd30-47fd-acc9-8b0288c7f074\"> <p><span class=\"feedback\">מצוין!</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrect\"> <textviewer id=\"c325f528-9bfb-4714-b164-9cd4b55a12f5\"> <p><span class=\"feedback\">יפה מאוד!</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allIncorrect\"> <textviewer id=\"72ef9446-7621-4b1a-84af-1895061bf330\"> <p><span class=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allIncorrect\"> <textviewer id=\"92447e08-d4e9-4a62-90ca-cc45eae5455f\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allCorrectPartMissing\"> <textviewer id=\"050702f7-1505-4696-8fb5-3ed8e5abb76a\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrectPartMissing\"> <textviewer id=\"3fb7fead-58e6-4c84-b073-47928be26080\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectPartMissing\"> <textviewer id=\"8514d2cb-c73e-4fc6-b6eb-cb256313451f\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectPartMissing\"> <textviewer id=\"a84bd9dd-0632-4df1-9d5a-71f45b6de317\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectMoreThan80Percent\"> <textviewer id=\"19273e08-5353-4003-bbcc-dcd5187f95b6\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectMoreThan80Percent\"> <textviewer id=\"371e2e1a-0b2f-488c-b609-1a4269c30587\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"partCorrectLessThan80Percent\"> <textviewer id=\"9b81caee-6609-43d8-88a2-d7d1738e2dd7\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"partCorrectLessThan80Percent\"> <textviewer id=\"c3090949-c791-44db-b4c3-201201c285af\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> <message attempt=\"first\" type=\"allCorrectPartIncorrect\"> <textviewer id=\"47cb74b4-4bd5-4f89-9936-2be12debdd1c\"> <p><span class=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</span></p> </textviewer> </message> <message attempt=\"last\" type=\"allCorrectPartIncorrect\"> <textviewer id=\"60caabe0-3b82-467d-9301-8c54f3d4cf37\"> <p><span class=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</span></p> </textviewer> </message> </feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"638b0e4d-49bc-431d-a001-e93ffad5fef7\"> <textviewer id=\"8cfb469e-f3b8-4738-a0d5-67f716051270\"> <p><span class=\"instruction\">מיינו את הפריטים לקטגוריות המתאימות.</span></p> </textviewer> </instruction> </progress> </task>\n</sequence>"
                    },
                    "c7c24aff-1ea2-49ad-8dc6-34c839452e29": {
                        "id": "c7c24aff-1ea2-49ad-8dc6-34c839452e29",
                        "type": "matching",
                        "parent": "ca9e968d-8b72-4e4a-be90-0b8b081a04fb",
                        "children": [
                            "fdb23df0-6879-4c46-af4a-6b636b7a8540",
                            "19f94bc8-35e0-4133-9150-6f7fa1b626c1",
                            "c6f86650-91e8-4f3a-82b9-3db3511e5ff0"
                        ],
                        "data": {
                            "title": "New mtq matching editor",
                            "task_check_type": "auto",
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
                    "899f02f9-1bd4-4db0-97bc-a2cd43f05eaa": {
                        "id": "899f02f9-1bd4-4db0-97bc-a2cd43f05eaa",
                        "type": "instruction",
                        "parent": "c7c24aff-1ea2-49ad-8dc6-34c839452e29",
                        "children": [
                            "582ecdb8-8dbf-485b-b019-49e5273a308b"
                        ],
                        "data": {
                            "title": "",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "582ecdb8-8dbf-485b-b019-49e5273a308b": {
                        "id": "582ecdb8-8dbf-485b-b019-49e5273a308b",
                        "type": "textViewer",
                        "parent": "899f02f9-1bd4-4db0-97bc-a2cd43f05eaa",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">התאימו את הפריטים להגדרות הנכונות.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "fdb23df0-6879-4c46-af4a-6b636b7a8540": {
                        "id": "fdb23df0-6879-4c46-af4a-6b636b7a8540",
                        "type": "question",
                        "parent": "c7c24aff-1ea2-49ad-8dc6-34c839452e29",
                        "children": [],
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
                    "19f94bc8-35e0-4133-9150-6f7fa1b626c1": {
                        "id": "19f94bc8-35e0-4133-9150-6f7fa1b626c1",
                        "type": "matchingAnswer",
                        "parent": "c7c24aff-1ea2-49ad-8dc6-34c839452e29",
                        "children": [
                            "8524d7e0-4aea-44a6-92dd-205ca0c9f63a",
                            "de0fefb3-dd5b-49df-9dc9-f66308d989f5"
                        ],
                        "data": {
                            "title": "matchingAnswer",
                            "placeHolder": true,
                            "mtqMode": "one_to_one",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "interaction_type": "drag_and_drop",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "useBank": true
                        }
                    },
                    "8524d7e0-4aea-44a6-92dd-205ca0c9f63a": {
                        "id": "8524d7e0-4aea-44a6-92dd-205ca0c9f63a",
                        "type": "mtqArea",
                        "parent": "19f94bc8-35e0-4133-9150-6f7fa1b626c1",
                        "children": [
                            "95a62fba-2914-4995-a14d-36ea390ca57c",
                            "40d4d308-1a89-4af4-b25c-11c0d50e8c9a",
                            "4e2a84ba-ee12-46bc-9774-a04ccfda88f3"
                        ],
                        "data": {
                            "title": "MtqArea",
                            "useBank": true,
                            "mtqAnswerType": "matchingAnswer",
                            "hasMultiSubAnswers": false,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": true
                        }
                    },
                    "95a62fba-2914-4995-a14d-36ea390ca57c": {
                        "id": "95a62fba-2914-4995-a14d-36ea390ca57c",
                        "type": "mtqSubQuestion",
                        "parent": "8524d7e0-4aea-44a6-92dd-205ca0c9f63a",
                        "children": [
                            "84f5105a-bde8-4730-ad89-9995b5e39559",
                            "df914454-0956-4355-bf2f-84ff42d5e12d"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "84f5105a-bde8-4730-ad89-9995b5e39559": {
                        "id": "84f5105a-bde8-4730-ad89-9995b5e39559",
                        "type": "definition",
                        "parent": "95a62fba-2914-4995-a14d-36ea390ca57c",
                        "children": [
                            "b06cb50c-3ab7-4e54-94cd-07df84996000"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b06cb50c-3ab7-4e54-94cd-07df84996000": {
                        "id": "b06cb50c-3ab7-4e54-94cd-07df84996000",
                        "type": "textViewer",
                        "parent": "84f5105a-bde8-4730-ad89-9995b5e39559",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה 1</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "mathfieldArray": {}
                        }
                    },
                    "df914454-0956-4355-bf2f-84ff42d5e12d": {
                        "id": "df914454-0956-4355-bf2f-84ff42d5e12d",
                        "type": "mtqSubAnswer",
                        "parent": "95a62fba-2914-4995-a14d-36ea390ca57c",
                        "children": [
                            "49b02b2d-4bb3-48ab-b604-c522f01a7444"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 0
                        }
                    },
                    "49b02b2d-4bb3-48ab-b604-c522f01a7444": {
                        "id": "49b02b2d-4bb3-48ab-b604-c522f01a7444",
                        "type": "textViewer",
                        "parent": "df914454-0956-4355-bf2f-84ff42d5e12d",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "40d4d308-1a89-4af4-b25c-11c0d50e8c9a": {
                        "id": "40d4d308-1a89-4af4-b25c-11c0d50e8c9a",
                        "type": "mtqSubQuestion",
                        "parent": "8524d7e0-4aea-44a6-92dd-205ca0c9f63a",
                        "children": [
                            "6a01ef46-668a-4355-b188-9b64bee4e271",
                            "6efa9ab5-ca31-4154-ad07-8a63aa4c6e43"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "6a01ef46-668a-4355-b188-9b64bee4e271": {
                        "id": "6a01ef46-668a-4355-b188-9b64bee4e271",
                        "type": "definition",
                        "parent": "40d4d308-1a89-4af4-b25c-11c0d50e8c9a",
                        "children": [
                            "deb3ae70-8bbc-401e-93c2-2aba3cde641f"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "deb3ae70-8bbc-401e-93c2-2aba3cde641f": {
                        "id": "deb3ae70-8bbc-401e-93c2-2aba3cde641f",
                        "type": "textViewer",
                        "parent": "6a01ef46-668a-4355-b188-9b64bee4e271",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה 2</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "mathfieldArray": {}
                        }
                    },
                    "6efa9ab5-ca31-4154-ad07-8a63aa4c6e43": {
                        "id": "6efa9ab5-ca31-4154-ad07-8a63aa4c6e43",
                        "type": "mtqSubAnswer",
                        "parent": "40d4d308-1a89-4af4-b25c-11c0d50e8c9a",
                        "children": [
                            "319c5081-1e07-4be7-8c93-4a832e31e6fd"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 1
                        }
                    },
                    "319c5081-1e07-4be7-8c93-4a832e31e6fd": {
                        "id": "319c5081-1e07-4be7-8c93-4a832e31e6fd",
                        "type": "textViewer",
                        "parent": "6efa9ab5-ca31-4154-ad07-8a63aa4c6e43",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 2</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "4e2a84ba-ee12-46bc-9774-a04ccfda88f3": {
                        "id": "4e2a84ba-ee12-46bc-9774-a04ccfda88f3",
                        "type": "mtqSubQuestion",
                        "parent": "8524d7e0-4aea-44a6-92dd-205ca0c9f63a",
                        "children": [
                            "3781b18e-090d-4c44-afff-849922a281df",
                            "49c3d801-427c-47ab-998a-d120faa14ac2"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "3781b18e-090d-4c44-afff-849922a281df": {
                        "id": "3781b18e-090d-4c44-afff-849922a281df",
                        "type": "definition",
                        "parent": "4e2a84ba-ee12-46bc-9774-a04ccfda88f3",
                        "children": [
                            "8bde90c5-ba41-4aaf-8184-80531ce782f0"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "8bde90c5-ba41-4aaf-8184-80531ce782f0": {
                        "id": "8bde90c5-ba41-4aaf-8184-80531ce782f0",
                        "type": "textViewer",
                        "parent": "3781b18e-090d-4c44-afff-849922a281df",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה 2</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "styleOverride": "definition",
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        }
                    },
                    "49c3d801-427c-47ab-998a-d120faa14ac2": {
                        "id": "49c3d801-427c-47ab-998a-d120faa14ac2",
                        "type": "mtqSubAnswer",
                        "parent": "4e2a84ba-ee12-46bc-9774-a04ccfda88f3",
                        "children": [
                            "1ac15cae-51a5-45a0-8304-8f2688bb3529"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 2
                        }
                    },
                    "1ac15cae-51a5-45a0-8304-8f2688bb3529": {
                        "id": "1ac15cae-51a5-45a0-8304-8f2688bb3529",
                        "type": "textViewer",
                        "parent": "49c3d801-427c-47ab-998a-d120faa14ac2",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 3</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "de0fefb3-dd5b-49df-9dc9-f66308d989f5": {
                        "type": "mtqBank",
                        "parent": "19f94bc8-35e0-4133-9150-6f7fa1b626c1",
                        "children": [
                            "ce65400e-4bb4-4f4b-aeb8-4c22253af7c3",
                            "3cbff4cc-bb99-4275-a395-61a5aa02af5f",
                            0,
                            1,
                            2
                        ],
                        "data": {
                            "title": "MtqBank",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "de0fefb3-dd5b-49df-9dc9-f66308d989f5"
                    },
                    "ce65400e-4bb4-4f4b-aeb8-4c22253af7c3": {
                        "id": "ce65400e-4bb4-4f4b-aeb8-4c22253af7c3",
                        "type": "mtqSubAnswer",
                        "parent": "de0fefb3-dd5b-49df-9dc9-f66308d989f5",
                        "children": [
                            "ec251156-a139-4e8a-904e-a361d767b015"
                        ],
                        "data": {
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ec251156-a139-4e8a-904e-a361d767b015": {
                        "id": "ec251156-a139-4e8a-904e-a361d767b015",
                        "type": "textViewer",
                        "parent": "ce65400e-4bb4-4f4b-aeb8-4c22253af7c3",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">פריט בנק 1</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "3cbff4cc-bb99-4275-a395-61a5aa02af5f": {
                        "id": "3cbff4cc-bb99-4275-a395-61a5aa02af5f",
                        "type": "mtqSubAnswer",
                        "parent": "de0fefb3-dd5b-49df-9dc9-f66308d989f5",
                        "children": [
                            "3f4ca5e4-4338-4d8c-9f86-bf9340cd87fd"
                        ],
                        "data": {
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "3f4ca5e4-4338-4d8c-9f86-bf9340cd87fd": {
                        "id": "3f4ca5e4-4338-4d8c-9f86-bf9340cd87fd",
                        "type": "textViewer",
                        "parent": "3cbff4cc-bb99-4275-a395-61a5aa02af5f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">פריט בנק 2</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "c6f86650-91e8-4f3a-82b9-3db3511e5ff0": {
                        "id": "c6f86650-91e8-4f3a-82b9-3db3511e5ff0",
                        "type": "progress",
                        "parent": "c7c24aff-1ea2-49ad-8dc6-34c839452e29",
                        "children": [
                            "15885b82-9dda-49ab-814f-4fecbca14df3",
                            "1e34899c-a111-4916-8326-e25a0b89e706",
                            "899f02f9-1bd4-4db0-97bc-a2cd43f05eaa"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "advanced",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "AdvancedFeedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80"
                            ],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "15885b82-9dda-49ab-814f-4fecbca14df3": {
                        "id": "15885b82-9dda-49ab-814f-4fecbca14df3",
                        "type": "hint",
                        "parent": "c6f86650-91e8-4f3a-82b9-3db3511e5ff0",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "1e34899c-a111-4916-8326-e25a0b89e706": {
                        "id": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "type": "feedback",
                        "parent": "c6f86650-91e8-4f3a-82b9-3db3511e5ff0",
                        "children": [
                            "c71169aa-bc09-4695-9e6d-9f2fc9110b39",
                            "22abe38d-eb01-46df-909f-d56ff84725b4",
                            "4f7bc0b3-d118-4abf-aa3b-d5c56134ab96",
                            "0298c0a0-b544-4e33-bdd2-4cffed9d7467",
                            "e0925b63-e4e5-45e6-93d5-38ab0276d972",
                            "b1646612-ae9f-407c-a26d-ba8e40e09cbf",
                            "697e6ee3-70ef-4ee6-ac27-290d910f3942",
                            "048785a4-c75d-4cf7-b7eb-9c69cfad8447",
                            "4e82e6bc-340f-4f35-9685-8f36c1411451",
                            "c318fd90-3ca0-44ae-880a-ba5f9f4a0078",
                            "bb1c1935-b18e-49fe-9def-edabeb8409eb",
                            "f38b65a2-b492-4f39-8078-1198e0f0958c"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80"
                            ],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "c71169aa-bc09-4695-9e6d-9f2fc9110b39",
                                    "final": "22abe38d-eb01-46df-909f-d56ff84725b4"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "4f7bc0b3-d118-4abf-aa3b-d5c56134ab96",
                                    "final": "0298c0a0-b544-4e33-bdd2-4cffed9d7467"
                                },
                                "missing_item": {
                                    "type": "generic",
                                    "preliminary": "e0925b63-e4e5-45e6-93d5-38ab0276d972",
                                    "final": "b1646612-ae9f-407c-a26d-ba8e40e09cbf"
                                },
                                "partly_correct_missing_item": {
                                    "type": "generic",
                                    "preliminary": "697e6ee3-70ef-4ee6-ac27-290d910f3942",
                                    "final": "048785a4-c75d-4cf7-b7eb-9c69cfad8447"
                                },
                                "partly_correct_more_80": {
                                    "type": "generic",
                                    "preliminary": "4e82e6bc-340f-4f35-9685-8f36c1411451",
                                    "final": "c318fd90-3ca0-44ae-880a-ba5f9f4a0078"
                                },
                                "partly_correct_less_80": {
                                    "type": "generic",
                                    "preliminary": "bb1c1935-b18e-49fe-9def-edabeb8409eb",
                                    "final": "f38b65a2-b492-4f39-8078-1198e0f0958c"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "matching"
                    },
                    "c71169aa-bc09-4695-9e6d-9f2fc9110b39": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">מצוין!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "c71169aa-bc09-4695-9e6d-9f2fc9110b39",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "22abe38d-eb01-46df-909f-d56ff84725b4": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">יפה מאוד!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "22abe38d-eb01-46df-909f-d56ff84725b4",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "4f7bc0b3-d118-4abf-aa3b-d5c56134ab96": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "4f7bc0b3-d118-4abf-aa3b-d5c56134ab96",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "0298c0a0-b544-4e33-bdd2-4cffed9d7467": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "0298c0a0-b544-4e33-bdd2-4cffed9d7467",
                        "stage_preview_container": "#td_f_all_incorrect"
                    },
                    "e0925b63-e4e5-45e6-93d5-38ab0276d972": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrectPartMissing"
                        },
                        "id": "e0925b63-e4e5-45e6-93d5-38ab0276d972",
                        "stage_preview_container": "#td_p_missing_item"
                    },
                    "b1646612-ae9f-407c-a26d-ba8e40e09cbf": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrectPartMissing"
                        },
                        "id": "b1646612-ae9f-407c-a26d-ba8e40e09cbf",
                        "stage_preview_container": "#td_f_missing_item"
                    },
                    "697e6ee3-70ef-4ee6-ac27-290d910f3942": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectPartMissing"
                        },
                        "id": "697e6ee3-70ef-4ee6-ac27-290d910f3942",
                        "stage_preview_container": "#td_p_partly_correct_missing_item"
                    },
                    "048785a4-c75d-4cf7-b7eb-9c69cfad8447": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectPartMissing"
                        },
                        "id": "048785a4-c75d-4cf7-b7eb-9c69cfad8447",
                        "stage_preview_container": "#td_f_partly_correct_missing_item"
                    },
                    "4e82e6bc-340f-4f35-9685-8f36c1411451": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectMoreThan80Percent"
                        },
                        "id": "4e82e6bc-340f-4f35-9685-8f36c1411451",
                        "stage_preview_container": "#td_p_partly_correct_more_80"
                    },
                    "c318fd90-3ca0-44ae-880a-ba5f9f4a0078": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectMoreThan80Percent"
                        },
                        "id": "c318fd90-3ca0-44ae-880a-ba5f9f4a0078",
                        "stage_preview_container": "#td_f_partly_correct_more_80"
                    },
                    "bb1c1935-b18e-49fe-9def-edabeb8409eb": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectLessThan80Percent"
                        },
                        "id": "bb1c1935-b18e-49fe-9def-edabeb8409eb",
                        "stage_preview_container": "#td_p_partly_correct_less_80"
                    },
                    "f38b65a2-b492-4f39-8078-1198e0f0958c": {
                        "type": "textViewer",
                        "parent": "1e34899c-a111-4916-8326-e25a0b89e706",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectLessThan80Percent"
                        },
                        "id": "f38b65a2-b492-4f39-8078-1198e0f0958c",
                        "stage_preview_container": "#td_f_partly_correct_less_80"
                    },
                    "3647eed1-8ca5-4f5d-8ece-54f58edda894": {
                        "id": "3647eed1-8ca5-4f5d-8ece-54f58edda894",
                        "type": "sequencing",
                        "parent": "ca9e968d-8b72-4e4a-be90-0b8b081a04fb",
                        "children": [
                            "ed29587d-5fc1-453f-a682-1bc96a7cd97d",
                            "2f49cbae-f859-41d0-b5c9-388dceb66255",
                            "53b97af1-aace-45dd-9c50-0350b804f756"
                        ],
                        "data": {
                            "title": "New mtq sequencing editor",
                            "task_check_type": "auto",
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
                    "d177b030-bab6-420d-98bd-b96d80426f33": {
                        "id": "d177b030-bab6-420d-98bd-b96d80426f33",
                        "type": "instruction",
                        "parent": "3647eed1-8ca5-4f5d-8ece-54f58edda894",
                        "children": [
                            "928090fc-34ad-4876-b662-45337f7f0d9e"
                        ],
                        "data": {
                            "title": "",
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
                    "928090fc-34ad-4876-b662-45337f7f0d9e": {
                        "id": "928090fc-34ad-4876-b662-45337f7f0d9e",
                        "type": "textViewer",
                        "parent": "d177b030-bab6-420d-98bd-b96d80426f33",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">סדרו את הפריטים בסדר הנכון.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ed29587d-5fc1-453f-a682-1bc96a7cd97d": {
                        "id": "ed29587d-5fc1-453f-a682-1bc96a7cd97d",
                        "type": "question",
                        "parent": "3647eed1-8ca5-4f5d-8ece-54f58edda894",
                        "children": [],
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
                    "2f49cbae-f859-41d0-b5c9-388dceb66255": {
                        "id": "2f49cbae-f859-41d0-b5c9-388dceb66255",
                        "type": "sequencingAnswer",
                        "parent": "3647eed1-8ca5-4f5d-8ece-54f58edda894",
                        "children": [
                            "1c40bed2-b495-4055-b539-5d7219552c87"
                        ],
                        "data": {
                            "title": "sequencingAnswer",
                            "useBank": false,
                            "placeHolder": false,
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "1c40bed2-b495-4055-b539-5d7219552c87": {
                        "id": "1c40bed2-b495-4055-b539-5d7219552c87",
                        "type": "mtqArea",
                        "parent": "2f49cbae-f859-41d0-b5c9-388dceb66255",
                        "children": [
                            "94a93486-8cf1-47c7-af94-cea574ebab8f"
                        ],
                        "data": {
                            "title": "MtqArea",
                            "useBank": false,
                            "mtqAnswerType": "sequencingAnswer",
                            "hasMultiSubAnswers": true,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "94a93486-8cf1-47c7-af94-cea574ebab8f": {
                        "id": "94a93486-8cf1-47c7-af94-cea574ebab8f",
                        "type": "mtqSubQuestion",
                        "parent": "1c40bed2-b495-4055-b539-5d7219552c87",
                        "children": [
                            "e76b7d7e-b806-47cc-9438-69faf0f74a15",
                            "92c058ff-a2e8-480f-8366-8429cb4d7dad",
                            "84cc6f20-ecb6-43d9-8c26-b7e2dac99d51"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e76b7d7e-b806-47cc-9438-69faf0f74a15": {
                        "id": "e76b7d7e-b806-47cc-9438-69faf0f74a15",
                        "type": "definition",
                        "parent": "94a93486-8cf1-47c7-af94-cea574ebab8f",
                        "children": [
                            "cd20e2f1-d885-404b-be04-af6d290ab956"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "cd20e2f1-d885-404b-be04-af6d290ab956": {
                        "id": "cd20e2f1-d885-404b-be04-af6d290ab956",
                        "type": "textViewer",
                        "parent": "e76b7d7e-b806-47cc-9438-69faf0f74a15",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה- התחלה</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "mathfieldArray": {}
                        }
                    },
                    "92c058ff-a2e8-480f-8366-8429cb4d7dad": {
                        "id": "92c058ff-a2e8-480f-8366-8429cb4d7dad",
                        "type": "mtqMultiSubAnswer",
                        "parent": "94a93486-8cf1-47c7-af94-cea574ebab8f",
                        "children": [
                            "6f2dd9b8-1d88-4a03-a8bc-21089007bccc",
                            "9904b83c-ec70-4e09-b767-5ad77f129e7b",
                            "9812483f-7206-4f5a-bece-6f60d6d9201b"
                        ],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sequencingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "6f2dd9b8-1d88-4a03-a8bc-21089007bccc": {
                        "id": "6f2dd9b8-1d88-4a03-a8bc-21089007bccc",
                        "type": "mtqSubAnswer",
                        "parent": "92c058ff-a2e8-480f-8366-8429cb4d7dad",
                        "children": [
                            "cc0a07a5-c2b0-4b71-93b1-67ada4f81494"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "cc0a07a5-c2b0-4b71-93b1-67ada4f81494": {
                        "id": "cc0a07a5-c2b0-4b71-93b1-67ada4f81494",
                        "type": "textViewer",
                        "parent": "6f2dd9b8-1d88-4a03-a8bc-21089007bccc",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "9904b83c-ec70-4e09-b767-5ad77f129e7b": {
                        "id": "9904b83c-ec70-4e09-b767-5ad77f129e7b",
                        "type": "mtqSubAnswer",
                        "parent": "92c058ff-a2e8-480f-8366-8429cb4d7dad",
                        "children": [
                            "4b55e156-26b0-4a8b-a255-fa67c6b0a9e5"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "4b55e156-26b0-4a8b-a255-fa67c6b0a9e5": {
                        "id": "4b55e156-26b0-4a8b-a255-fa67c6b0a9e5",
                        "type": "textViewer",
                        "parent": "9904b83c-ec70-4e09-b767-5ad77f129e7b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 2</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "9812483f-7206-4f5a-bece-6f60d6d9201b": {
                        "id": "9812483f-7206-4f5a-bece-6f60d6d9201b",
                        "type": "mtqSubAnswer",
                        "parent": "92c058ff-a2e8-480f-8366-8429cb4d7dad",
                        "children": [
                            "521272b0-1ee7-454d-a73d-f48c9b4b01ac"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "521272b0-1ee7-454d-a73d-f48c9b4b01ac": {
                        "id": "521272b0-1ee7-454d-a73d-f48c9b4b01ac",
                        "type": "textViewer",
                        "parent": "9812483f-7206-4f5a-bece-6f60d6d9201b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 3</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "84cc6f20-ecb6-43d9-8c26-b7e2dac99d51": {
                        "id": "84cc6f20-ecb6-43d9-8c26-b7e2dac99d51",
                        "type": "definition",
                        "parent": "94a93486-8cf1-47c7-af94-cea574ebab8f",
                        "children": [
                            "f028071e-e29a-4e21-a149-3b47512cbc29"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f028071e-e29a-4e21-a149-3b47512cbc29": {
                        "id": "f028071e-e29a-4e21-a149-3b47512cbc29",
                        "type": "textViewer",
                        "parent": "84cc6f20-ecb6-43d9-8c26-b7e2dac99d51",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה- סוף</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "mathfieldArray": {}
                        }
                    },
                    "53b97af1-aace-45dd-9c50-0350b804f756": {
                        "id": "53b97af1-aace-45dd-9c50-0350b804f756",
                        "type": "progress",
                        "parent": "3647eed1-8ca5-4f5d-8ece-54f58edda894",
                        "children": [
                            "bd4db1d6-d9e8-4b06-b565-ea13f5f790fa",
                            "123d4369-5405-4982-bf4c-a589815ff7cb",
                            "d177b030-bab6-420d-98bd-b96d80426f33"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "advanced",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "AdvancedFeedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80",
                                "all_correct_and_wrong"
                            ],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bd4db1d6-d9e8-4b06-b565-ea13f5f790fa": {
                        "id": "bd4db1d6-d9e8-4b06-b565-ea13f5f790fa",
                        "type": "hint",
                        "parent": "53b97af1-aace-45dd-9c50-0350b804f756",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "123d4369-5405-4982-bf4c-a589815ff7cb": {
                        "id": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "type": "feedback",
                        "parent": "53b97af1-aace-45dd-9c50-0350b804f756",
                        "children": [
                            "235370d9-7472-4b62-99c6-3f31398baf74",
                            "acf06f36-5ee4-4236-8fe1-08ef4b917609",
                            "2a48ad42-08d7-485b-84c2-4574a8bd3bb0",
                            "a99ecc18-8011-45a1-b026-3d1991adeff2",
                            "edc12679-b255-44fb-b166-cb3e07cc4b2e",
                            "bf44d529-f738-4b16-baa6-cd566694c6b7",
                            "696a6760-36fb-4174-8b42-858e92d12f99",
                            "0ab8ac9b-e8af-420a-b758-1758ad9990c4",
                            "2acc4332-a6b9-4eb7-9a32-a4fe1ab102a7",
                            "1fc08ed7-f628-4395-8a28-f9487b74ee26",
                            "d07355d2-5fdf-480a-9e27-45abc074c84a",
                            "d60eade9-29bb-4cf2-9e10-61eaed6ce7c7",
                            "1f30207f-924b-4235-aeae-29ddb138ac4a",
                            "6f348133-7919-451d-9fe2-a903da68b17a"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80",
                                "all_correct_and_wrong"
                            ],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "235370d9-7472-4b62-99c6-3f31398baf74",
                                    "final": "acf06f36-5ee4-4236-8fe1-08ef4b917609"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "2a48ad42-08d7-485b-84c2-4574a8bd3bb0",
                                    "final": "a99ecc18-8011-45a1-b026-3d1991adeff2"
                                },
                                "missing_item": {
                                    "type": "generic",
                                    "preliminary": "edc12679-b255-44fb-b166-cb3e07cc4b2e",
                                    "final": "bf44d529-f738-4b16-baa6-cd566694c6b7"
                                },
                                "partly_correct_missing_item": {
                                    "type": "generic",
                                    "preliminary": "696a6760-36fb-4174-8b42-858e92d12f99",
                                    "final": "0ab8ac9b-e8af-420a-b758-1758ad9990c4"
                                },
                                "partly_correct_more_80": {
                                    "type": "generic",
                                    "preliminary": "2acc4332-a6b9-4eb7-9a32-a4fe1ab102a7",
                                    "final": "1fc08ed7-f628-4395-8a28-f9487b74ee26"
                                },
                                "partly_correct_less_80": {
                                    "type": "generic",
                                    "preliminary": "d07355d2-5fdf-480a-9e27-45abc074c84a",
                                    "final": "d60eade9-29bb-4cf2-9e10-61eaed6ce7c7"
                                },
                                "all_correct_and_wrong": {
                                    "type": "generic",
                                    "preliminary": "1f30207f-924b-4235-aeae-29ddb138ac4a",
                                    "final": "6f348133-7919-451d-9fe2-a903da68b17a"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "sequencing"
                    },
                    "235370d9-7472-4b62-99c6-3f31398baf74": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">מצוין!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "235370d9-7472-4b62-99c6-3f31398baf74",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "acf06f36-5ee4-4236-8fe1-08ef4b917609": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">יפה מאוד!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "acf06f36-5ee4-4236-8fe1-08ef4b917609",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "2a48ad42-08d7-485b-84c2-4574a8bd3bb0": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "2a48ad42-08d7-485b-84c2-4574a8bd3bb0",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "a99ecc18-8011-45a1-b026-3d1991adeff2": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "a99ecc18-8011-45a1-b026-3d1991adeff2",
                        "stage_preview_container": "#td_f_all_incorrect"
                    },
                    "edc12679-b255-44fb-b166-cb3e07cc4b2e": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrectPartMissing"
                        },
                        "id": "edc12679-b255-44fb-b166-cb3e07cc4b2e",
                        "stage_preview_container": "#td_p_missing_item"
                    },
                    "bf44d529-f738-4b16-baa6-cd566694c6b7": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrectPartMissing"
                        },
                        "id": "bf44d529-f738-4b16-baa6-cd566694c6b7",
                        "stage_preview_container": "#td_f_missing_item"
                    },
                    "696a6760-36fb-4174-8b42-858e92d12f99": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectPartMissing"
                        },
                        "id": "696a6760-36fb-4174-8b42-858e92d12f99",
                        "stage_preview_container": "#td_p_partly_correct_missing_item"
                    },
                    "0ab8ac9b-e8af-420a-b758-1758ad9990c4": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectPartMissing"
                        },
                        "id": "0ab8ac9b-e8af-420a-b758-1758ad9990c4",
                        "stage_preview_container": "#td_f_partly_correct_missing_item"
                    },
                    "2acc4332-a6b9-4eb7-9a32-a4fe1ab102a7": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectMoreThan80Percent"
                        },
                        "id": "2acc4332-a6b9-4eb7-9a32-a4fe1ab102a7",
                        "stage_preview_container": "#td_p_partly_correct_more_80"
                    },
                    "1fc08ed7-f628-4395-8a28-f9487b74ee26": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectMoreThan80Percent"
                        },
                        "id": "1fc08ed7-f628-4395-8a28-f9487b74ee26",
                        "stage_preview_container": "#td_f_partly_correct_more_80"
                    },
                    "d07355d2-5fdf-480a-9e27-45abc074c84a": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectLessThan80Percent"
                        },
                        "id": "d07355d2-5fdf-480a-9e27-45abc074c84a",
                        "stage_preview_container": "#td_p_partly_correct_less_80"
                    },
                    "d60eade9-29bb-4cf2-9e10-61eaed6ce7c7": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectLessThan80Percent"
                        },
                        "id": "d60eade9-29bb-4cf2-9e10-61eaed6ce7c7",
                        "stage_preview_container": "#td_f_partly_correct_less_80"
                    },
                    "1f30207f-924b-4235-aeae-29ddb138ac4a": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrectPartIncorrect"
                        },
                        "id": "1f30207f-924b-4235-aeae-29ddb138ac4a",
                        "stage_preview_container": "#td_p_all_correct_and_wrong"
                    },
                    "6f348133-7919-451d-9fe2-a903da68b17a": {
                        "type": "textViewer",
                        "parent": "123d4369-5405-4982-bf4c-a589815ff7cb",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrectPartIncorrect"
                        },
                        "id": "6f348133-7919-451d-9fe2-a903da68b17a",
                        "stage_preview_container": "#td_f_all_correct_and_wrong"
                    },
                    "cff80332-e3bd-48c0-939c-40b974691819": {
                        "id": "cff80332-e3bd-48c0-939c-40b974691819",
                        "type": "sorting",
                        "parent": "ca9e968d-8b72-4e4a-be90-0b8b081a04fb",
                        "children": [
                            "7a019e77-2df4-4f56-a22c-f2bd71ba09eb",
                            "a1cbe6d4-b87a-431a-96cc-04f5d4b724de",
                            "0dedb5bc-5cad-47fb-9a1b-45b08a6eff02"
                        ],
                        "data": {
                            "title": "New mtq sorting editor",
                            "task_check_type": "auto",
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
                    "638b0e4d-49bc-431d-a001-e93ffad5fef7": {
                        "id": "638b0e4d-49bc-431d-a001-e93ffad5fef7",
                        "type": "instruction",
                        "parent": "cff80332-e3bd-48c0-939c-40b974691819",
                        "children": [
                            "8cfb469e-f3b8-4738-a0d5-67f716051270"
                        ],
                        "data": {
                            "title": "",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "8cfb469e-f3b8-4738-a0d5-67f716051270": {
                        "id": "8cfb469e-f3b8-4738-a0d5-67f716051270",
                        "type": "textViewer",
                        "parent": "638b0e4d-49bc-431d-a001-e93ffad5fef7",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">מיינו את הפריטים לקטגוריות המתאימות.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "7a019e77-2df4-4f56-a22c-f2bd71ba09eb": {
                        "id": "7a019e77-2df4-4f56-a22c-f2bd71ba09eb",
                        "type": "question",
                        "parent": "cff80332-e3bd-48c0-939c-40b974691819",
                        "children": [],
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
                    "a1cbe6d4-b87a-431a-96cc-04f5d4b724de": {
                        "id": "a1cbe6d4-b87a-431a-96cc-04f5d4b724de",
                        "type": "sortingAnswer",
                        "parent": "cff80332-e3bd-48c0-939c-40b974691819",
                        "children": [
                            "d281ff92-831a-4ea5-b3b2-e73d43e709d0",
                            "a1e2124d-64a9-4bc9-a41d-50b090c0aac1"
                        ],
                        "data": {
                            "title": "sortingAnswer",
                            "useBank": true,
                            "mtqMode": "one_to_one",
                            "placeHolder": true,
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d281ff92-831a-4ea5-b3b2-e73d43e709d0": {
                        "id": "d281ff92-831a-4ea5-b3b2-e73d43e709d0",
                        "type": "mtqArea",
                        "parent": "a1cbe6d4-b87a-431a-96cc-04f5d4b724de",
                        "children": [
                            "41d010ea-d555-4ffa-b259-cb58904474df",
                            "3a655a98-0034-4c20-9d49-2bd8741870f1"
                        ],
                        "data": {
                            "title": "MtqArea",
                            "useBank": true,
                            "mtqAnswerType": "sortingAnswer",
                            "hasMultiSubAnswers": true,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": false
                        }
                    },
                    "41d010ea-d555-4ffa-b259-cb58904474df": {
                        "id": "41d010ea-d555-4ffa-b259-cb58904474df",
                        "type": "mtqSubQuestion",
                        "parent": "d281ff92-831a-4ea5-b3b2-e73d43e709d0",
                        "children": [
                            "86b939f9-f5b6-4379-8f80-b21915ee2829",
                            "4c79aeba-1df5-4f7a-b841-665c1711f8de"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "86b939f9-f5b6-4379-8f80-b21915ee2829": {
                        "id": "86b939f9-f5b6-4379-8f80-b21915ee2829",
                        "type": "definition",
                        "parent": "41d010ea-d555-4ffa-b259-cb58904474df",
                        "children": [
                            "1d901d4d-2f86-443f-9338-ec13c0724956"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "1d901d4d-2f86-443f-9338-ec13c0724956": {
                        "id": "1d901d4d-2f86-443f-9338-ec13c0724956",
                        "type": "textViewer",
                        "parent": "86b939f9-f5b6-4379-8f80-b21915ee2829",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה 1</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "mathfieldArray": {}
                        }
                    },
                    "4c79aeba-1df5-4f7a-b841-665c1711f8de": {
                        "id": "4c79aeba-1df5-4f7a-b841-665c1711f8de",
                        "type": "mtqMultiSubAnswer",
                        "parent": "41d010ea-d555-4ffa-b259-cb58904474df",
                        "children": [
                            "09e2180d-36e6-46ce-a290-2604bc65d3c2",
                            "dab8b767-7449-4201-910f-1d5bafe9f21c"
                        ],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sortingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": true
                        }
                    },
                    "09e2180d-36e6-46ce-a290-2604bc65d3c2": {
                        "id": "09e2180d-36e6-46ce-a290-2604bc65d3c2",
                        "type": "mtqSubAnswer",
                        "parent": "4c79aeba-1df5-4f7a-b841-665c1711f8de",
                        "children": [
                            "5f8701f7-81cf-4513-8a5b-925a42f166a0"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 0
                        }
                    },
                    "5f8701f7-81cf-4513-8a5b-925a42f166a0": {
                        "id": "5f8701f7-81cf-4513-8a5b-925a42f166a0",
                        "type": "textViewer",
                        "parent": "09e2180d-36e6-46ce-a290-2604bc65d3c2",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 1.1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "dab8b767-7449-4201-910f-1d5bafe9f21c": {
                        "id": "dab8b767-7449-4201-910f-1d5bafe9f21c",
                        "type": "mtqSubAnswer",
                        "parent": "4c79aeba-1df5-4f7a-b841-665c1711f8de",
                        "children": [
                            "aaeb9a61-5177-4018-953b-afac833b4c2d"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 1
                        }
                    },
                    "aaeb9a61-5177-4018-953b-afac833b4c2d": {
                        "id": "aaeb9a61-5177-4018-953b-afac833b4c2d",
                        "type": "textViewer",
                        "parent": "dab8b767-7449-4201-910f-1d5bafe9f21c",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 2.2</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "3a655a98-0034-4c20-9d49-2bd8741870f1": {
                        "id": "3a655a98-0034-4c20-9d49-2bd8741870f1",
                        "type": "mtqSubQuestion",
                        "parent": "d281ff92-831a-4ea5-b3b2-e73d43e709d0",
                        "children": [
                            "26f9b7d7-8043-4e5f-be9a-f1878e3f4a49",
                            "d9355f88-53cc-4821-b02c-f8110829ea69"
                        ],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "26f9b7d7-8043-4e5f-be9a-f1878e3f4a49": {
                        "id": "26f9b7d7-8043-4e5f-be9a-f1878e3f4a49",
                        "type": "definition",
                        "parent": "3a655a98-0034-4c20-9d49-2bd8741870f1",
                        "children": [
                            "d5bcdaf5-53b1-41a4-bb27-3f04dc1cd544"
                        ],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d5bcdaf5-53b1-41a4-bb27-3f04dc1cd544": {
                        "id": "d5bcdaf5-53b1-41a4-bb27-3f04dc1cd544",
                        "type": "textViewer",
                        "parent": "26f9b7d7-8043-4e5f-be9a-f1878e3f4a49",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\"Click to edit definition.\">הגדרה 2</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor definition",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "mathfieldArray": {}
                        }
                    },
                    "d9355f88-53cc-4821-b02c-f8110829ea69": {
                        "id": "d9355f88-53cc-4821-b02c-f8110829ea69",
                        "type": "mtqMultiSubAnswer",
                        "parent": "3a655a98-0034-4c20-9d49-2bd8741870f1",
                        "children": [
                            "f4a4ba01-34d9-4a3e-b9d2-0ff7860c3759",
                            "bbc8fe8d-bb23-4d90-bf06-6d2bfa709419"
                        ],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sortingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "canDeleteChildren": true
                        }
                    },
                    "f4a4ba01-34d9-4a3e-b9d2-0ff7860c3759": {
                        "id": "f4a4ba01-34d9-4a3e-b9d2-0ff7860c3759",
                        "type": "mtqSubAnswer",
                        "parent": "d9355f88-53cc-4821-b02c-f8110829ea69",
                        "children": [
                            "90a52d22-da5c-4a71-a0b2-e842d0c69e57"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 2
                        }
                    },
                    "90a52d22-da5c-4a71-a0b2-e842d0c69e57": {
                        "id": "90a52d22-da5c-4a71-a0b2-e842d0c69e57",
                        "type": "textViewer",
                        "parent": "f4a4ba01-34d9-4a3e-b9d2-0ff7860c3759",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 2.1</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "bbc8fe8d-bb23-4d90-bf06-6d2bfa709419": {
                        "id": "bbc8fe8d-bb23-4d90-bf06-6d2bfa709419",
                        "type": "mtqSubAnswer",
                        "parent": "d9355f88-53cc-4821-b02c-f8110829ea69",
                        "children": [
                            "40c923e4-74d7-4a58-8ea0-3d925b179e8e"
                        ],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 3
                        }
                    },
                    "40c923e4-74d7-4a58-8ea0-3d925b179e8e": {
                        "id": "40c923e4-74d7-4a58-8ea0-3d925b179e8e",
                        "type": "textViewer",
                        "parent": "bbc8fe8d-bb23-4d90-bf06-6d2bfa709419",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">תשובה 2.2</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {}
                        }
                    },
                    "a1e2124d-64a9-4bc9-a41d-50b090c0aac1": {
                        "type": "mtqBank",
                        "parent": "a1cbe6d4-b87a-431a-96cc-04f5d4b724de",
                        "children": [
                            0,
                            1,
                            2,
                            3
                        ],
                        "data": {
                            "title": "MtqBank",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "a1e2124d-64a9-4bc9-a41d-50b090c0aac1"
                    },
                    "0dedb5bc-5cad-47fb-9a1b-45b08a6eff02": {
                        "id": "0dedb5bc-5cad-47fb-9a1b-45b08a6eff02",
                        "type": "progress",
                        "parent": "cff80332-e3bd-48c0-939c-40b974691819",
                        "children": [
                            "6ca01702-4ab3-4437-b9ef-aff369d7b683",
                            "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                            "638b0e4d-49bc-431d-a001-e93ffad5fef7"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "advanced",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "partly_correct"
                            ],
                            "AdvancedFeedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80",
                                "all_correct_and_wrong"
                            ],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "6ca01702-4ab3-4437-b9ef-aff369d7b683": {
                        "id": "6ca01702-4ab3-4437-b9ef-aff369d7b683",
                        "type": "hint",
                        "parent": "0dedb5bc-5cad-47fb-9a1b-45b08a6eff02",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "d4484838-b326-46aa-8d5b-1ce09ec8e022": {
                        "id": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "type": "feedback",
                        "parent": "0dedb5bc-5cad-47fb-9a1b-45b08a6eff02",
                        "children": [
                            "ed99b7f9-dd30-47fd-acc9-8b0288c7f074",
                            "c325f528-9bfb-4714-b164-9cd4b55a12f5",
                            "72ef9446-7621-4b1a-84af-1895061bf330",
                            "92447e08-d4e9-4a62-90ca-cc45eae5455f",
                            "050702f7-1505-4696-8fb5-3ed8e5abb76a",
                            "3fb7fead-58e6-4c84-b073-47928be26080",
                            "8514d2cb-c73e-4fc6-b6eb-cb256313451f",
                            "a84bd9dd-0632-4df1-9d5a-71f45b6de317",
                            "19273e08-5353-4003-bbcc-dcd5187f95b6",
                            "371e2e1a-0b2f-488c-b609-1a4269c30587",
                            "9b81caee-6609-43d8-88a2-d7d1738e2dd7",
                            "c3090949-c791-44db-b4c3-201201c285af",
                            "47cb74b4-4bd5-4f89-9936-2be12debdd1c",
                            "60caabe0-3b82-467d-9301-8c54f3d4cf37"
                        ],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [
                                "all_correct",
                                "all_incorrect",
                                "missing_item",
                                "partly_correct_missing_item",
                                "partly_correct_more_80",
                                "partly_correct_less_80",
                                "all_correct_and_wrong"
                            ],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "ed99b7f9-dd30-47fd-acc9-8b0288c7f074",
                                    "final": "c325f528-9bfb-4714-b164-9cd4b55a12f5"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "72ef9446-7621-4b1a-84af-1895061bf330",
                                    "final": "92447e08-d4e9-4a62-90ca-cc45eae5455f"
                                },
                                "missing_item": {
                                    "type": "generic",
                                    "preliminary": "050702f7-1505-4696-8fb5-3ed8e5abb76a",
                                    "final": "3fb7fead-58e6-4c84-b073-47928be26080"
                                },
                                "partly_correct_missing_item": {
                                    "type": "generic",
                                    "preliminary": "8514d2cb-c73e-4fc6-b6eb-cb256313451f",
                                    "final": "a84bd9dd-0632-4df1-9d5a-71f45b6de317"
                                },
                                "partly_correct_more_80": {
                                    "type": "generic",
                                    "preliminary": "19273e08-5353-4003-bbcc-dcd5187f95b6",
                                    "final": "371e2e1a-0b2f-488c-b609-1a4269c30587"
                                },
                                "partly_correct_less_80": {
                                    "type": "generic",
                                    "preliminary": "9b81caee-6609-43d8-88a2-d7d1738e2dd7",
                                    "final": "c3090949-c791-44db-b4c3-201201c285af"
                                },
                                "all_correct_and_wrong": {
                                    "type": "generic",
                                    "preliminary": "47cb74b4-4bd5-4f89-9936-2be12debdd1c",
                                    "final": "60caabe0-3b82-467d-9301-8c54f3d4cf37"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "sorting"
                    },
                    "ed99b7f9-dd30-47fd-acc9-8b0288c7f074": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">מצוין!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "ed99b7f9-dd30-47fd-acc9-8b0288c7f074",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "c325f528-9bfb-4714-b164-9cd4b55a12f5": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">יפה מאוד!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "c325f528-9bfb-4714-b164-9cd4b55a12f5",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "72ef9446-7621-4b1a-84af-1895061bf330": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">התשובה שגויה. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "72ef9446-7621-4b1a-84af-1895061bf330",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "92447e08-d4e9-4a62-90ca-cc45eae5455f": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "92447e08-d4e9-4a62-90ca-cc45eae5455f",
                        "stage_preview_container": "#td_f_all_incorrect"
                    },
                    "050702f7-1505-4696-8fb5-3ed8e5abb76a": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrectPartMissing"
                        },
                        "id": "050702f7-1505-4696-8fb5-3ed8e5abb76a",
                        "stage_preview_container": "#td_p_missing_item"
                    },
                    "3fb7fead-58e6-4c84-b073-47928be26080": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrectPartMissing"
                        },
                        "id": "3fb7fead-58e6-4c84-b073-47928be26080",
                        "stage_preview_container": "#td_f_missing_item"
                    },
                    "8514d2cb-c73e-4fc6-b6eb-cb256313451f": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectPartMissing"
                        },
                        "id": "8514d2cb-c73e-4fc6-b6eb-cb256313451f",
                        "stage_preview_container": "#td_p_partly_correct_missing_item"
                    },
                    "a84bd9dd-0632-4df1-9d5a-71f45b6de317": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectPartMissing"
                        },
                        "id": "a84bd9dd-0632-4df1-9d5a-71f45b6de317",
                        "stage_preview_container": "#td_f_partly_correct_missing_item"
                    },
                    "19273e08-5353-4003-bbcc-dcd5187f95b6": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectMoreThan80Percent"
                        },
                        "id": "19273e08-5353-4003-bbcc-dcd5187f95b6",
                        "stage_preview_container": "#td_p_partly_correct_more_80"
                    },
                    "371e2e1a-0b2f-488c-b609-1a4269c30587": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectMoreThan80Percent"
                        },
                        "id": "371e2e1a-0b2f-488c-b609-1a4269c30587",
                        "stage_preview_container": "#td_f_partly_correct_more_80"
                    },
                    "9b81caee-6609-43d8-88a2-d7d1738e2dd7": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "partCorrectLessThan80Percent"
                        },
                        "id": "9b81caee-6609-43d8-88a2-d7d1738e2dd7",
                        "stage_preview_container": "#td_p_partly_correct_less_80"
                    },
                    "c3090949-c791-44db-b4c3-201201c285af": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "partCorrectLessThan80Percent"
                        },
                        "id": "c3090949-c791-44db-b4c3-201201c285af",
                        "stage_preview_container": "#td_f_partly_correct_less_80"
                    },
                    "47cb74b4-4bd5-4f89-9936-2be12debdd1c": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">כל תשובותיכם נכונות, אך לא עניתם על כל השאלות. לחצו על \"ניסיון חוזר\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrectPartIncorrect"
                        },
                        "id": "47cb74b4-4bd5-4f89-9936-2be12debdd1c",
                        "stage_preview_container": "#td_p_all_correct_and_wrong"
                    },
                    "60caabe0-3b82-467d-9301-8c54f3d4cf37": {
                        "type": "textViewer",
                        "parent": "d4484838-b326-46aa-8d5b-1ce09ec8e022",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">לחצו על \"הצגת תשובה\" ושימו לב לתשובות הנכונות.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrectPartIncorrect"
                        },
                        "id": "60caabe0-3b82-467d-9301-8c54f3d4cf37",
                        "stage_preview_container": "#td_f_all_correct_and_wrong"
                    }
                }
            },
            'cloze': {
                'id': "82700d27-f0a4-4c40-bb6f-d1f2d4c98902",
                'data': {
                    "0": {
                        "type": "textViewer",
                        "data": {
                            "title": "<span class=\"normal cgs\">השלם</span>",
                            "textEditorStyle": "texteditor cgs",
                            "styleOverride": ""
                        },
                        "id": 0,
                        "parent": "ed4412c5-670e-4c26-a845-b7feaebf0ba6"
                    },
                    "1": {
                        "type": "textViewer",
                        "data": {
                            "title": "<span class=\"normal cgs\">המילים</span>",
                            "textEditorStyle": "texteditor cgs",
                            "styleOverride": ""
                        },
                        "id": 1,
                        "parent": "9448b5c1-8efd-48fb-8b6f-34edc7e4af36"
                    },
                    "82700d27-f0a4-4c40-bb6f-d1f2d4c98902": {
                        "type": "sequence",
                        "parent": "8117de46-59d2-4e13-94ef-bfa2c02ad2d0",
                        "children": [
                            "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc"
                        ],
                        "data": {
                            "title": "New Sequence 2",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": false,
                            "invalidMessage": {
                                "valid": false,
                                "report": [{
                                    "editorId": "82700d27-f0a4-4c40-bb6f-d1f2d4c98902",
                                    "editorType": "sequence",
                                    "editorGroup": "sequence",
                                    "msg": "There must be at least one task in the sequence"
                                }, {
                                    "editorId": "f7766cfe-a895-4f96-b462-41d6f37e3da0",
                                    "editorType": "textViewer",
                                    "editorGroup": "task",
                                    "msg": "The text object does not have any content. Return to the Text editor and enter content."
                                }, {
                                    "editorId": "42bdb237-b6eb-415c-a4fa-55664b10467f",
                                    "editorType": "cloze_text_viewer",
                                    "editorGroup": "task",
                                    "msg": "Please Insert at least one answer in the answer area"
                                }],
                                "bubbleUp": true,
                                "upperComponentMessage": [{
                                    "editorId": "82700d27-f0a4-4c40-bb6f-d1f2d4c98902",
                                    "editorType": "sequence",
                                    "editorGroup": "sequence",
                                    "msg": "There must be at least one task in the sequence"
                                }]
                            }
                        },
                        "id": "82700d27-f0a4-4c40-bb6f-d1f2d4c98902",
                        "is_modified": true,
                        "convertedData": "<sequence type=\"simple\" id=\"82700d27-f0a4-4c40-bb6f-d1f2d4c98902\"> <task exposureid=\"0\" type=\"cloze\" id=\"ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc\" check_type=\"auto\" sha1=\"d937d1595b047611d6629362b36e81cc4df96c61\"> <mode>dragAndDisable</mode> <question id=\"14d01897-de66-43fd-9e60-cbddb890e20e\" auto_tag=\"auto_tag\"> </question>\n<answer checkable=\"true\"> <clozearea> <cloze> <p><span class=\"normal\"> <subanswer answerid=\"answerfield_42bdb237-b6eb-415c-a4fa-55664b10467f_1\" originalid=\"0\"> <casesensitive>false</casesensitive> <punctuationmarks>false</punctuationmarks> <correct> <ans_option widthem=\"\">0</ans_option> </correct> <partiallycorrect> </partiallycorrect> <incorrectpredicted> </incorrectpredicted> </subanswer>את <subanswer answerid=\"answerfield_42bdb237-b6eb-415c-a4fa-55664b10467f_2\" originalid=\"1\"> <casesensitive>false</casesensitive> <punctuationmarks>false</punctuationmarks> <correct> <ans_option widthem=\"\">1</ans_option> </correct> <partiallycorrect> </partiallycorrect> <incorrectpredicted> </incorrectpredicted> </subanswer>החסרות</span></p> </cloze>\n</clozearea>\n<bank> <subanswer answerid=\"374e1547-e872-4d94-8f18-5a3c3d02e97a\" originalid=\"\"> <textviewer id=\"374e1547-e872-4d94-8f18-5a3c3d02e97a\"> <p><span class=\"normal\">פריט בנק</span></p> </textviewer> </subanswer> <subanswer answerid=\"0\" originalid=\"\"> <textviewer id=\"0\"> <p><span class=\"normal\"><span class=\"normal cgs\">השלם</span></span></p> </textviewer> </subanswer> <subanswer answerid=\"1\" originalid=\"\"> <textviewer id=\"1\"> <p><span class=\"normal\"><span class=\"normal cgs\">המילים</span></span></p> </textviewer> </subanswer> </bank> </answer>\n<progress id=\"461075d6-55e4-4ab0-8273-414e45540684\"> <ignorechecking> </ignorechecking> <points>1</points> <attempts>2</attempts> <checkable>true</checkable> <feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback> </progress> </task>\n</sequence>"
                    },
                    "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc": {
                        "id": "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc",
                        "type": "cloze",
                        "parent": "82700d27-f0a4-4c40-bb6f-d1f2d4c98902",
                        "children": [
                            "14d01897-de66-43fd-9e60-cbddb890e20e",
                            "4ab26a7e-3a86-486a-a552-0c84b1690259",
                            "461075d6-55e4-4ab0-8273-414e45540684"
                        ],
                        "data": {
                            "title": "Fill in the gaps",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": false
                    },
                    "dc56adad-9ae3-4f1f-929b-48749eb8538b": {
                        "id": "dc56adad-9ae3-4f1f-929b-48749eb8538b",
                        "type": "instruction",
                        "parent": "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc",
                        "children": [
                            "703cf7a7-fb49-4194-8113-175d40d50623"
                        ],
                        "data": {
                            "title": "",
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
                    "703cf7a7-fb49-4194-8113-175d40d50623": {
                        "id": "703cf7a7-fb49-4194-8113-175d40d50623",
                        "type": "textViewer",
                        "parent": "dc56adad-9ae3-4f1f-929b-48749eb8538b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">השלימו את תשובותיכם בכל המקומות הריקים.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "14d01897-de66-43fd-9e60-cbddb890e20e": {
                        "id": "14d01897-de66-43fd-9e60-cbddb890e20e",
                        "type": "question",
                        "parent": "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc",
                        "children": [],
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
                    "4ab26a7e-3a86-486a-a552-0c84b1690259": {
                        "id": "4ab26a7e-3a86-486a-a552-0c84b1690259",
                        "type": "cloze_answer",
                        "parent": "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc",
                        "children": [
                            "42bdb237-b6eb-415c-a4fa-55664b10467f",
                            "b2bd168e-d728-41b2-acc2-989537574347"
                        ],
                        "data": {
                            "title": "Answer",
                            "interaction": "dd",
                            "answerType": "cloze_text_viewer",
                            "fieldsNum": "multiple",
                            "fieldsWidth": "longest",
                            "maxHeight": "secondLevel",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "useBank": true,
                            "className": "drag-drop-cloze"
                        }
                    },
                    "42bdb237-b6eb-415c-a4fa-55664b10467f": {
                        "id": "42bdb237-b6eb-415c-a4fa-55664b10467f",
                        "type": "cloze_text_viewer",
                        "parent": "4ab26a7e-3a86-486a-a552-0c84b1690259",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">&nbsp;<answerfield class=\"AnswerField\" type=\"text\" contenteditable=\"false\" style=\"-webkit-user-select: none;\"><span class=\"answerfieldSpan\" id=\"answerfield_42bdb237-b6eb-415c-a4fa-55664b10467f_1\" type=\"text\" contenteditable=\"true\" style=\"-webkit-user-select: initial;\">השלם </span><div contenteditable=\"false\" class=\"x-button\" style=\"-webkit-user-select: none;\">x</div></answerfield>את <answerfield class=\"AnswerField\" type=\"text\" contenteditable=\"false\" style=\"-webkit-user-select: none;\"><span class=\"answerfieldSpan\" id=\"answerfield_42bdb237-b6eb-415c-a4fa-55664b10467f_2\" type=\"text\" contenteditable=\"true\" style=\"-webkit-user-select: initial;\">המילים </span><div contenteditable=\"false\" class=\"x-button\" style=\"-webkit-user-select: none;\">x</div></answerfield>החסרות</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "showNarrationType": true,
                            "answerFields": {
                                "answerfield_42bdb237-b6eb-415c-a4fa-55664b10467f_1": {
                                    "type": "text"
                                },
                                "answerfield_42bdb237-b6eb-415c-a4fa-55664b10467f_2": {
                                    "type": "text"
                                }
                            },
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "type": "text",
                            "noCheckingType": true,
                            "noAdditionalCorrectAnswers": true,
                            "noPartiallyCorrectAnswers": true,
                            "noExpectedWrong": true
                        }
                    },
                    "b2bd168e-d728-41b2-acc2-989537574347": {
                        "type": "clozeBank",
                        "parent": "4ab26a7e-3a86-486a-a552-0c84b1690259",
                        "children": [
                            "c21064a6-e819-44ba-bba1-4620fc2b9893",
                            "ed4412c5-670e-4c26-a845-b7feaebf0ba6",
                            "9448b5c1-8efd-48fb-8b6f-34edc7e4af36"
                        ],
                        "data": {
                            "title": "clozeBank",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "b2bd168e-d728-41b2-acc2-989537574347"
                    },
                    "374e1547-e872-4d94-8f18-5a3c3d02e97a": {
                        "type": "textViewer",
                        "parent": "c21064a6-e819-44ba-bba1-4620fc2b9893",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs bankReadOnly\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"bankReadOnly\">פריט בנק</div>",
                            "showNarrationType": true,
                            "styleOverride": "normal",
                            "textEditorStyle": "texteditor cgs",
                            "mode": "bankStyle",
                            "width": "50%",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "374e1547-e872-4d94-8f18-5a3c3d02e97a"
                    },
                    "461075d6-55e4-4ab0-8273-414e45540684": {
                        "id": "461075d6-55e4-4ab0-8273-414e45540684",
                        "type": "advancedProgress",
                        "parent": "ebbed4c0-1a7e-4e18-9bf0-9a1169a442cc",
                        "children": [
                            "a6b184c8-5c0d-45e0-b90d-4dbdb54e2e9d",
                            "a53a1e95-d489-47b9-ae8d-9763d0ae6cc4",
                            "dc56adad-9ae3-4f1f-929b-48749eb8538b"
                        ],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "feedback_type": "local",
                            "checking_enabled": true,
                            "score": 1,
                            "button_label": "Continue",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "with_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ],
                                "no_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "with_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ],
                                "no_bank": [
                                    "all_correct",
                                    "all_incorrect",
                                    "partly_correct"
                                ]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "a6b184c8-5c0d-45e0-b90d-4dbdb54e2e9d": {
                        "id": "a6b184c8-5c0d-45e0-b90d-4dbdb54e2e9d",
                        "type": "hint",
                        "parent": "461075d6-55e4-4ab0-8273-414e45540684",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "maxAttempts": "2"
                        }
                    },
                    "a53a1e95-d489-47b9-ae8d-9763d0ae6cc4": {
                        "id": "a53a1e95-d489-47b9-ae8d-9763d0ae6cc4",
                        "type": "feedback",
                        "parent": "461075d6-55e4-4ab0-8273-414e45540684",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [],
                            "taskType": "with_bank",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {},
                            "feedbacks_map_specific": {}
                        }
                    },
                    "c21064a6-e819-44ba-bba1-4620fc2b9893": {
                        "children": [
                            "374e1547-e872-4d94-8f18-5a3c3d02e97a"
                        ],
                        "data": {
                            "subItemId": "374e1547-e872-4d94-8f18-5a3c3d02e97a"
                        },
                        "id": "c21064a6-e819-44ba-bba1-4620fc2b9893",
                        "parent": "b2bd168e-d728-41b2-acc2-989537574347",
                        "type": "clozeBankSubItem"
                    },
                    "ed4412c5-670e-4c26-a845-b7feaebf0ba6": {
                        "children": [
                            0
                        ],
                        "data": {
                            "subItemId": 0
                        },
                        "id": "ed4412c5-670e-4c26-a845-b7feaebf0ba6",
                        "parent": "b2bd168e-d728-41b2-acc2-989537574347",
                        "type": "clozeBankSubItem"
                    },
                    "9448b5c1-8efd-48fb-8b6f-34edc7e4af36": {
                        "children": [
                            1
                        ],
                        "data": {
                            "subItemId": 1
                        },
                        "id": "9448b5c1-8efd-48fb-8b6f-34edc7e4af36",
                        "parent": "b2bd168e-d728-41b2-acc2-989537574347",
                        "type": "clozeBankSubItem"
                    }
                }
            },
            'open_question': {
                'id': '9d5e6490-284b-43c9-933c-13a4a8a91541',
                'data': {
                    "9d5e6490-284b-43c9-933c-13a4a8a91541": {
                        "type": "sequence",
                        "parent": "8117de46-59d2-4e13-94ef-bfa2c02ad2d0",
                        "children": [
                            "102beb33-348a-40f3-aecf-68ffeed041f4"
                        ],
                        "data": {
                            "title": "New Sequence 3",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [{
                                    "editorId": "e0dc48ba-889f-4138-87bd-c98695f06768",
                                    "editorType": "textViewer",
                                    "editorGroup": "task",
                                    "msg": "The text object does not have any content. Return to the Text editor and enter content."
                                }],
                                "bubbleUp": true
                            }
                        },
                        "id": "9d5e6490-284b-43c9-933c-13a4a8a91541",
                        "is_modified": true,
                        "convertedData": "<sequence type=\"simple\" id=\"9d5e6490-284b-43c9-933c-13a4a8a91541\"> <task exposureid=\"0\" type=\"opq\" id=\"102beb33-348a-40f3-aecf-68ffeed041f4\" check_type=\"manual\" sha1=\"4091dd5f3c24eb7acfedc6faf477cb3f73f20c49\"> <question id=\"2b7eb5c2-ff85-4429-9db8-e97a414f1156\" auto_tag=\"auto_tag\"> <textviewer id=\"e0dc48ba-889f-4138-87bd-c98695f06768\"> <p><span class=\"normal\">שאלה</span></p> </textviewer> </question>\n<answer checkable=\"\"> <subanswer> <texteditor mode=\"paragraph\" style=\"style1\" enabletoolbar=\"true\" toolbarpreset=\"studentMath\" maxchar=\"150\"> </texteditor>\n</subanswer>\n</answer>\n<progress id=\"ea4cced7-433c-4595-98f6-7a8cdd0a8603\"> <ignorechecking> </ignorechecking> <attempts></attempts> <checkable>true</checkable> </progress> </task>\n</sequence>"
                    },
                    "102beb33-348a-40f3-aecf-68ffeed041f4": {
                        "id": "102beb33-348a-40f3-aecf-68ffeed041f4",
                        "type": "FreeWriting",
                        "parent": "9d5e6490-284b-43c9-933c-13a4a8a91541",
                        "children": [
                            "2b7eb5c2-ff85-4429-9db8-e97a414f1156",
                            "9ccd9f3d-ade0-4140-827d-cea060d2f28b",
                            "ea4cced7-433c-4595-98f6-7a8cdd0a8603"
                        ],
                        "data": {
                            "title": "New Free Writing",
                            "task_check_type": "manual",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": false
                    },
                    "adba79f6-3323-49cb-8b43-93b741a09c67": {
                        "id": "adba79f6-3323-49cb-8b43-93b741a09c67",
                        "type": "instruction",
                        "parent": "102beb33-348a-40f3-aecf-68ffeed041f4",
                        "children": [
                            "85b0cca9-05ab-4eb5-9103-0f8484717cb7"
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
                    "85b0cca9-05ab-4eb5-9103-0f8484717cb7": {
                        "id": "85b0cca9-05ab-4eb5-9103-0f8484717cb7",
                        "type": "textViewer",
                        "parent": "adba79f6-3323-49cb-8b43-93b741a09c67",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">כתבו את תשובתכם.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2b7eb5c2-ff85-4429-9db8-e97a414f1156": {
                        "id": "2b7eb5c2-ff85-4429-9db8-e97a414f1156",
                        "type": "question",
                        "parent": "102beb33-348a-40f3-aecf-68ffeed041f4",
                        "children": [
                            "e0dc48ba-889f-4138-87bd-c98695f06768"
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
                    "e0dc48ba-889f-4138-87bd-c98695f06768": {
                        "type": "textViewer",
                        "parent": "2b7eb5c2-ff85-4429-9db8-e97a414f1156",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: right; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">שאלה</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "mathfieldArray": {}
                        },
                        "id": "e0dc48ba-889f-4138-87bd-c98695f06768"
                    },
                    "9ccd9f3d-ade0-4140-827d-cea060d2f28b": {
                        "id": "9ccd9f3d-ade0-4140-827d-cea060d2f28b",
                        "type": "FreeWritingAnswer",
                        "parent": "102beb33-348a-40f3-aecf-68ffeed041f4",
                        "children": [
                            "61a18ff3-b4fb-4060-a255-af3ec6f6fdb1"
                        ],
                        "data": {
                            "title": "Free Writing Answer",
                            "disableDelete": true,
                            "has_questions": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "61a18ff3-b4fb-4060-a255-af3ec6f6fdb1": {
                        "id": "61a18ff3-b4fb-4060-a255-af3ec6f6fdb1",
                        "type": "textEditor",
                        "parent": "9ccd9f3d-ade0-4140-827d-cea060d2f28b",
                        "children": [],
                        "data": {
                            "title": "Free Writing Answer TextViewer",
                            "disableDelete": true,
                            "answer_size": "Paragraph",
                            "MaxChars": "150",
                            "ShowToolbar": true,
                            "allowedSizes": [{
                                "value": "Line",
                                "text": "Line"
                            }, {
                                "value": "Paragraph",
                                "text": "Paragraph"
                            }, {
                                "value": "FullText",
                                "text": "Full Text"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ea4cced7-433c-4595-98f6-7a8cdd0a8603": {
                        "id": "ea4cced7-433c-4595-98f6-7a8cdd0a8603",
                        "type": "progress",
                        "parent": "102beb33-348a-40f3-aecf-68ffeed041f4",
                        "children": [
                            "398ebced-6379-41f8-8a7f-6c0032b4a486",
                            "adba79f6-3323-49cb-8b43-93b741a09c67"
                        ],
                        "data": {
                            "ignore_defaults": "true",
                            "title": "Progress",
                            "show_hint": false,
                            "button_label": "Continue",
                            "feedback_type": "none",
                            "disableDelete": true,
                            "hint_timing": 1,
                            "showOnlyAlways": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "398ebced-6379-41f8-8a7f-6c0032b4a486": {
                        "id": "398ebced-6379-41f8-8a7f-6c0032b4a486",
                        "type": "hint",
                        "parent": "ea4cced7-433c-4595-98f6-7a8cdd0a8603",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true
                        }
                    }
                }
            }
        },
        'ar_IL': {
            'task': {
                'id': "644b2b36-a503-4a17-bd88-973c0ac12100",
                'data': {
                    "644b2b36-a503-4a17-bd88-973c0ac12100": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["d39e9b45-a867-40fc-83da-eca6c5dc196b", "d5e1c2f9-2d79-48e5-9b21-373962c3daaa"],
                        "data": {
                            "title": "task",
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
                        "id": "644b2b36-a503-4a17-bd88-973c0ac12100",
                        "is_modified": false,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"644b2b36-a503-4a17-bd88-973c0ac12100\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<task exposureid=\"0\" type=\"statement\" id=\"d39e9b45-a867-40fc-83da-eca6c5dc196b\" check_type=\"none\" sha1=\"6cff97ee1825535e9349b8348f6e03a743b57ee2\">\n        <mode>pedagogical</mode>\n    \n\n    \n <tasktitle>\n\n\t<textviewer id=\"55308df7-8555-4fba-9aa8-2ac90b94f2b9\">\n\t    <paragraph><span class=\"pedagogicalTitle\">العنوان</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n</tasktitle>\n<question id=\"631be329-97d8-46fb-8228-7f4c09bdde79\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"8ea25a07-fa8e-464d-8cf9-2830724a77ce\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<progress id=\"cc698056-7476-4cd8-94f3-1a5f9badbb6b\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t\n\t<attempts>0</attempts>\n\t<checkable>true</checkable>\n    \n</progress>\n\n</task>\n<task exposureid=\"1\" type=\"mc\" id=\"d5e1c2f9-2d79-48e5-9b21-373962c3daaa\" check_type=\"auto\" sha1=\"69e64aff8ed9d36293dbc7cfc57b6b9649abd9b7\">\n    \n\n    \n<question id=\"2f05f621-c2af-424f-bee5-675211036b64\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"71e95796-87da-4ad1-845c-3043bee2a7f2\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkingmode=\"generic\" type=\"mc\">\n    <options>\n        \n<option id=\"ad9dc6f5-3add-462b-ac34-ec0dece86f83\" correct=\"true\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"21f78665-3c08-4ac9-b66d-c8773acaf9ae\">\n\t    <paragraph><span class=\"normal\">الإجابة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</option>\n<option id=\"6476688e-39f8-4dbc-bd16-65a2a91cd4e4\" correct=\"false\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"427ce3fe-6187-46f4-b8e8-c58fd3211010\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</option>\n    </options>\n</answer>\n\n<progress id=\"bb0e3223-f8ff-469a-9482-1b1a61a25052\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t\n\t<attempts>2</attempts>\n\t<checkable>true</checkable>\n    \n<hint>\n    <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"1c11dec2-e8f8-44cb-9301-fabac02e3f9d\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n    <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"1c11dec2-e8f8-44cb-9301-fabac02e3f9d\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n    <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"1c11dec2-e8f8-44cb-9301-fabac02e3f9d\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n</hint>\n\n<feedback>\n\t\t\t\t<message attempt=\"first\" type=\"allCorrect\">\n\n\t<textviewer id=\"44533b01-74ce-4fe8-bcf8-5b2c0007ddd1\">\n\t    <paragraph><span class=\"feedback\">ممتاز!</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"last\" type=\"allCorrect\">\n\n\t<textviewer id=\"57df3aab-3e47-4c76-a5bd-3f05b9befc85\">\n\t    <paragraph><span class=\"feedback\">جيد جدًّا!</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"first\" type=\"allIncorrect\">\n\n\t<textviewer id=\"2ac58ee8-472c-427a-9200-04eee441692f\">\n\t    <paragraph><span class=\"feedback\">إجابة خاطئة. انقر على \"أعد المحاولة\".</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"last\" type=\"allIncorrect\">\n\n\t<textviewer id=\"a69130e8-49f1-47b6-a0db-c0fd3b7b49c1\">\n\t    <paragraph><span class=\"feedback\">انقر على \"أظهر الإجابة\" واهتم بالإجابات الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"9854bd96-fd8d-4942-a74e-01f7677b9370\">\n    \n\n\t<textviewer id=\"da8dbf57-4940-44b3-b645-a149376f72b0\">\n\t    <paragraph><span class=\"instruction\">اختر الإجابة الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n</sequence>"
                    },
                    "d39e9b45-a867-40fc-83da-eca6c5dc196b": {
                        "id": "d39e9b45-a867-40fc-83da-eca6c5dc196b",
                        "type": "pedagogicalStatement",
                        "parent": "644b2b36-a503-4a17-bd88-973c0ac12100",
                        "children": ["6fecb318-ecd9-456f-82bd-ff594e37c9a6", "631be329-97d8-46fb-8228-7f4c09bdde79", "cc698056-7476-4cd8-94f3-1a5f9badbb6b"],
                        "data": {
                            "title": "New Pedagogical Statement",
                            "task_check_type": "none",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true,
                        "ReadOnly": false
                    },
                    "6fecb318-ecd9-456f-82bd-ff594e37c9a6": {
                        "id": "6fecb318-ecd9-456f-82bd-ff594e37c9a6",
                        "type": "title",
                        "parent": "d39e9b45-a867-40fc-83da-eca6c5dc196b",
                        "children": ["55308df7-8555-4fba-9aa8-2ac90b94f2b9"],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "show": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "55308df7-8555-4fba-9aa8-2ac90b94f2b9": {
                        "id": "55308df7-8555-4fba-9aa8-2ac90b94f2b9",
                        "type": "textViewer",
                        "parent": "6fecb318-ecd9-456f-82bd-ff594e37c9a6",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs pedagogicalTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"pedagogicalTitle\">العنوان</div>",
                            "styleOverride": "pedagogicalTitle",
                            "mode": "singleStyle",
                            "disableDelete": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAI6UlEQ…uBAgoooIACCiigQB4Bg2oeNc9RQAEFFFBAAQUUqLvAPwFKO1NRH3sJTwAAAABJRU5ErkJggg=="
                        }
                    },
                    "631be329-97d8-46fb-8228-7f4c09bdde79": {
                        "id": "631be329-97d8-46fb-8228-7f4c09bdde79",
                        "type": "question",
                        "parent": "d39e9b45-a867-40fc-83da-eca6c5dc196b",
                        "children": ["8ea25a07-fa8e-464d-8cf9-2830724a77ce"],
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
                    "8ea25a07-fa8e-464d-8cf9-2830724a77ce": {
                        "type": "textViewer",
                        "parent": "631be329-97d8-46fb-8228-7f4c09bdde79",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "8ea25a07-fa8e-464d-8cf9-2830724a77ce"
                    },
                    "cc698056-7476-4cd8-94f3-1a5f9badbb6b": {
                        "id": "cc698056-7476-4cd8-94f3-1a5f9badbb6b",
                        "type": "progress",
                        "parent": "d39e9b45-a867-40fc-83da-eca6c5dc196b",
                        "children": [],
                        "data": {
                            "ignore_defaults": "true",
                            "title": "Progress",
                            "show_hint": false,
                            "button_label": "Continue",
                            "disableDelete": true,
                            "num_of_attempts": "0",
                            "hint_timing": 1,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d5e1c2f9-2d79-48e5-9b21-373962c3daaa": {
                        "id": "d5e1c2f9-2d79-48e5-9b21-373962c3daaa",
                        "type": "mc",
                        "parent": "644b2b36-a503-4a17-bd88-973c0ac12100",
                        "children": ["2f05f621-c2af-424f-bee5-675211036b64", "7b9548be-7190-4b33-8949-9db34e60575f", "bb0e3223-f8ff-469a-9482-1b1a61a25052"],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "9854bd96-fd8d-4942-a74e-01f7677b9370": {
                        "id": "9854bd96-fd8d-4942-a74e-01f7677b9370",
                        "type": "instruction",
                        "parent": "d5e1c2f9-2d79-48e5-9b21-373962c3daaa",
                        "children": ["da8dbf57-4940-44b3-b645-a149376f72b0"],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "da8dbf57-4940-44b3-b645-a149376f72b0": {
                        "id": "da8dbf57-4940-44b3-b645-a149376f72b0",
                        "type": "textViewer",
                        "parent": "9854bd96-fd8d-4942-a74e-01f7677b9370",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">اختر الإجابة الصحيحة.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAEhklEQ…CAwJYCguqW26IoAgQIECBAgAABQdUZIECAAAECBAgQ2FLgN0c67ELGgVrBAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2f05f621-c2af-424f-bee5-675211036b64": {
                        "id": "2f05f621-c2af-424f-bee5-675211036b64",
                        "type": "question",
                        "parent": "d5e1c2f9-2d79-48e5-9b21-373962c3daaa",
                        "children": ["71e95796-87da-4ad1-845c-3043bee2a7f2"],
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
                    "71e95796-87da-4ad1-845c-3043bee2a7f2": {
                        "type": "textViewer",
                        "parent": "2f05f621-c2af-424f-bee5-675211036b64",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "71e95796-87da-4ad1-845c-3043bee2a7f2"
                    },
                    "7b9548be-7190-4b33-8949-9db34e60575f": {
                        "id": "7b9548be-7190-4b33-8949-9db34e60575f",
                        "type": "mcAnswer",
                        "parent": "d5e1c2f9-2d79-48e5-9b21-373962c3daaa",
                        "children": ["ad9dc6f5-3add-462b-ac34-ec0dece86f83", "6476688e-39f8-4dbc-bd16-65a2a91cd4e4"],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ad9dc6f5-3add-462b-ac34-ec0dece86f83": {
                        "id": "ad9dc6f5-3add-462b-ac34-ec0dece86f83",
                        "type": "option",
                        "parent": "7b9548be-7190-4b33-8949-9db34e60575f",
                        "children": ["21f78665-3c08-4ac9-b66d-c8773acaf9ae"],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "21f78665-3c08-4ac9-b66d-c8773acaf9ae": {
                        "id": "21f78665-3c08-4ac9-b66d-c8773acaf9ae",
                        "type": "textViewer",
                        "parent": "ad9dc6f5-3add-462b-ac34-ec0dece86f83",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;١</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHYklEQ…pMWNkpAggggAACCCCAQFABgmpQQdojgAACCCCAAAIIxETgX8MLm0J1qW1aAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "6476688e-39f8-4dbc-bd16-65a2a91cd4e4": {
                        "id": "6476688e-39f8-4dbc-bd16-65a2a91cd4e4",
                        "type": "option",
                        "parent": "7b9548be-7190-4b33-8949-9db34e60575f",
                        "children": ["427ce3fe-6187-46f4-b8e8-c58fd3211010"],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "427ce3fe-6187-46f4-b8e8-c58fd3211010": {
                        "id": "427ce3fe-6187-46f4-b8e8-c58fd3211010",
                        "type": "textViewer",
                        "parent": "6476688e-39f8-4dbc-bd16-65a2a91cd4e4",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٢</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHjUlEQ…VOEUAAAQQQQAABBPwKEFT9CtIeAQQQQAABBBBAIBCB/wHWbcFCg8i4JwAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bb0e3223-f8ff-469a-9482-1b1a61a25052": {
                        "id": "bb0e3223-f8ff-469a-9482-1b1a61a25052",
                        "type": "progress",
                        "parent": "d5e1c2f9-2d79-48e5-9b21-373962c3daaa",
                        "children": ["079b4ba5-2c7e-4dfe-837f-b9c95ae99d32", "b1f3418c-cf0e-4666-ae2f-9d30edd767d9", "9854bd96-fd8d-4942-a74e-01f7677b9370"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong", "all_incorrect"]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "079b4ba5-2c7e-4dfe-837f-b9c95ae99d32": {
                        "id": "079b4ba5-2c7e-4dfe-837f-b9c95ae99d32",
                        "type": "hint",
                        "parent": "bb0e3223-f8ff-469a-9482-1b1a61a25052",
                        "children": ["1c11dec2-e8f8-44cb-9301-fabac02e3f9d"],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "1c11dec2-e8f8-44cb-9301-fabac02e3f9d": {
                        "type": "textViewer",
                        "parent": "079b4ba5-2c7e-4dfe-837f-b9c95ae99d32",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">تلميح</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAUAAAAjCAYAAADsQ7NMAAAHX0lEQ…ECBAgQIECAAIFGBIQCjehZlwABAgQIECBAgAABAgQIVFjgTx0Cu2GGGy+zAAAAAElFTkSuQmCC"
                        },
                        "id": "1c11dec2-e8f8-44cb-9301-fabac02e3f9d"
                    },
                    "b1f3418c-cf0e-4666-ae2f-9d30edd767d9": {
                        "id": "b1f3418c-cf0e-4666-ae2f-9d30edd767d9",
                        "type": "feedback",
                        "parent": "bb0e3223-f8ff-469a-9482-1b1a61a25052",
                        "children": ["44533b01-74ce-4fe8-bcf8-5b2c0007ddd1", "57df3aab-3e47-4c76-a5bd-3f05b9befc85", "2ac58ee8-472c-427a-9200-04eee441692f", "a69130e8-49f1-47b6-a0db-c0fd3b7b49c1"],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect"],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "44533b01-74ce-4fe8-bcf8-5b2c0007ddd1",
                                    "final": "57df3aab-3e47-4c76-a5bd-3f05b9befc85"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "2ac58ee8-472c-427a-9200-04eee441692f",
                                    "final": "a69130e8-49f1-47b6-a0db-c0fd3b7b49c1"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "mc_single_answer_generic"
                    },
                    "44533b01-74ce-4fe8-bcf8-5b2c0007ddd1": {
                        "type": "textViewer",
                        "parent": "b1f3418c-cf0e-4666-ae2f-9d30edd767d9",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">ممتاز!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAACEElEQ…SjTqJEoAQBQipRZkkikIMAIeWokygRKEGAkEqUWZII5CDwC/HIDDOvaCuEAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "44533b01-74ce-4fe8-bcf8-5b2c0007ddd1",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "57df3aab-3e47-4c76-a5bd-3f05b9befc85": {
                        "type": "textViewer",
                        "parent": "b1f3418c-cf0e-4666-ae2f-9d30edd767d9",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">جيد جدًّا!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAACN0lEQ…lQs6SKQHYChJS9w+pDIBABQgrULKkikJ0AIWXvsPoQCETgHzrLGDP58FF0AAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "57df3aab-3e47-4c76-a5bd-3f05b9befc85",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "2ac58ee8-472c-427a-9200-04eee441692f": {
                        "type": "textViewer",
                        "parent": "b1f3418c-cf0e-4666-ae2f-9d30edd767d9",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">إجابة خاطئة. انقر على \"أعد المحاولة\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAE4UlEQ…GgIY2hZCASIIEuARpSlyD3kwAJjBGgIY2hZCASIIEugX/eG7hvAMU/QwAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "2ac58ee8-472c-427a-9200-04eee441692f",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "a69130e8-49f1-47b6-a0db-c0fd3b7b49c1": {
                        "type": "textViewer",
                        "parent": "b1f3418c-cf0e-4666-ae2f-9d30edd767d9",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">انقر على \"أظهر الإجابة\" واهتم بالإجابات الصحيحة.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAsCAYAAADM3cU1AAAF8klEQ…1AKkunjlLgOgXYu5rRhxnvBqPDHgHpupjSzFJAChgFfgORZ/CHVpt+OgAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "a69130e8-49f1-47b6-a0db-c0fd3b7b49c1",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'mc': {
                'id': "7915d6ed-ae58-4bf5-be57-1c06323676d0",
                'data': {
                    "7915d6ed-ae58-4bf5-be57-1c06323676d0": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["b430f340-fb0a-4461-874e-797393f71b07"],
                        "data": {
                            "title": "mc",
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
                        "id": "7915d6ed-ae58-4bf5-be57-1c06323676d0",
                        "is_modified": false,
                        "convertedData": "<sequence type=\"simple\" id=\"7915d6ed-ae58-4bf5-be57-1c06323676d0\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<task exposureid=\"0\" type=\"mc\" id=\"b430f340-fb0a-4461-874e-797393f71b07\" check_type=\"auto\" sha1=\"e045c5899868ba116441f46af057c27003e82f8a\">\n    \n\n    \n<question id=\"ce85f7ed-9e8d-47ca-91fe-d586a30ce268\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"1a6c7675-9611-4fa9-8659-0b7093d54d6d\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkingmode=\"generic\" type=\"mc\">\n    <options>\n        \n<option id=\"f33e897b-b42a-4e8e-ba00-e6f9aaec800b\" correct=\"true\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"ca273d60-b2a3-48af-9022-d0c0ce42ac31\">\n\t    <paragraph><span class=\"normal\">الإجابة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</option>\n<option id=\"c74a9055-6a4d-40b1-bc47-2dc545bea5e2\" correct=\"false\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"5b2dfaef-f999-4f48-b948-5eba62fd18cc\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</option>\n    </options>\n</answer>\n\n<progress id=\"30a83677-1f5e-450e-801e-8191a47d53d5\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t\n\t<attempts>2</attempts>\n\t<checkable>true</checkable>\n    \n<hint>\n    <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"553a4838-bb5a-4665-b7b4-005a5ec6fed0\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n    <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"553a4838-bb5a-4665-b7b4-005a5ec6fed0\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n    <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"553a4838-bb5a-4665-b7b4-005a5ec6fed0\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n</hint>\n\n<feedback>\n\t\t\t\t<message attempt=\"first\" type=\"allCorrect\">\n\n\t<textviewer id=\"54469ad5-c692-42b8-81cb-cf5863da10f5\">\n\t    <paragraph><span class=\"feedback\">ممتاز!</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"last\" type=\"allCorrect\">\n\n\t<textviewer id=\"09005fe4-17b9-4bce-8d82-e04fd4ad2df0\">\n\t    <paragraph><span class=\"feedback\">جيد جدًّا!</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"first\" type=\"allIncorrect\">\n\n\t<textviewer id=\"60714967-036a-4102-ad7d-d8457704def6\">\n\t    <paragraph><span class=\"feedback\">إجابة خاطئة. انقر على \"أعد المحاولة\".</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"last\" type=\"allIncorrect\">\n\n\t<textviewer id=\"774d63ef-d5f1-4bf9-a550-9953160201fe\">\n\t    <paragraph><span class=\"feedback\">انقر على \"أظهر الإجابة\" واهتم بالإجابات الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"8a3a7a60-f166-4227-9cb1-4b99e164eaa4\">\n    \n\n\t<textviewer id=\"30732186-3bff-4264-a651-71bb945c7ad7\">\n\t    <paragraph><span class=\"instruction\">اختر الإجابة الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n</sequence>"
                    },
                    "b430f340-fb0a-4461-874e-797393f71b07": {
                        "id": "b430f340-fb0a-4461-874e-797393f71b07",
                        "type": "mc",
                        "parent": "7915d6ed-ae58-4bf5-be57-1c06323676d0",
                        "children": ["ce85f7ed-9e8d-47ca-91fe-d586a30ce268", "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6", "30a83677-1f5e-450e-801e-8191a47d53d5"],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "8a3a7a60-f166-4227-9cb1-4b99e164eaa4": {
                        "id": "8a3a7a60-f166-4227-9cb1-4b99e164eaa4",
                        "type": "instruction",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["30732186-3bff-4264-a651-71bb945c7ad7"],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "30732186-3bff-4264-a651-71bb945c7ad7": {
                        "id": "30732186-3bff-4264-a651-71bb945c7ad7",
                        "type": "textViewer",
                        "parent": "8a3a7a60-f166-4227-9cb1-4b99e164eaa4",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">اختر الإجابة الصحيحة.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAEhklEQ…CAwJYCguqW26IoAgQIECBAgAABQdUZIECAAAECBAgQ2FLgN0c67ELGgVrBAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ce85f7ed-9e8d-47ca-91fe-d586a30ce268": {
                        "id": "ce85f7ed-9e8d-47ca-91fe-d586a30ce268",
                        "type": "question",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["1a6c7675-9611-4fa9-8659-0b7093d54d6d"],
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
                    "1a6c7675-9611-4fa9-8659-0b7093d54d6d": {
                        "type": "textViewer",
                        "parent": "ce85f7ed-9e8d-47ca-91fe-d586a30ce268",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "1a6c7675-9611-4fa9-8659-0b7093d54d6d"
                    },
                    "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6": {
                        "id": "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6",
                        "type": "mcAnswer",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["f33e897b-b42a-4e8e-ba00-e6f9aaec800b", "c74a9055-6a4d-40b1-bc47-2dc545bea5e2"],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f33e897b-b42a-4e8e-ba00-e6f9aaec800b": {
                        "id": "f33e897b-b42a-4e8e-ba00-e6f9aaec800b",
                        "type": "option",
                        "parent": "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6",
                        "children": ["ca273d60-b2a3-48af-9022-d0c0ce42ac31"],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ca273d60-b2a3-48af-9022-d0c0ce42ac31": {
                        "id": "ca273d60-b2a3-48af-9022-d0c0ce42ac31",
                        "type": "textViewer",
                        "parent": "f33e897b-b42a-4e8e-ba00-e6f9aaec800b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;١</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHYklEQ…pMWNkpAggggAACCCCAQFABgmpQQdojgAACCCCAAAIIxETgX8MLm0J1qW1aAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c74a9055-6a4d-40b1-bc47-2dc545bea5e2": {
                        "id": "c74a9055-6a4d-40b1-bc47-2dc545bea5e2",
                        "type": "option",
                        "parent": "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6",
                        "children": ["5b2dfaef-f999-4f48-b948-5eba62fd18cc"],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5b2dfaef-f999-4f48-b948-5eba62fd18cc": {
                        "id": "5b2dfaef-f999-4f48-b948-5eba62fd18cc",
                        "type": "textViewer",
                        "parent": "c74a9055-6a4d-40b1-bc47-2dc545bea5e2",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٢</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHjUlEQ…VOEUAAAQQQQAABBPwKEFT9CtIeAQQQQAABBBBAIBCB/wHWbcFCg8i4JwAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "30a83677-1f5e-450e-801e-8191a47d53d5": {
                        "id": "30a83677-1f5e-450e-801e-8191a47d53d5",
                        "type": "progress",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42", "0f6c2ebd-2369-432c-8d06-c366edd04082", "8a3a7a60-f166-4227-9cb1-4b99e164eaa4"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong", "all_incorrect"]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42": {
                        "id": "bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42",
                        "type": "hint",
                        "parent": "30a83677-1f5e-450e-801e-8191a47d53d5",
                        "children": ["553a4838-bb5a-4665-b7b4-005a5ec6fed0"],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "553a4838-bb5a-4665-b7b4-005a5ec6fed0": {
                        "type": "textViewer",
                        "parent": "bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">تلميح</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAUAAAAjCAYAAADsQ7NMAAAHX0lEQ…ECBAgQIECAAIFGBIQCjehZlwABAgQIECBAgAABAgQIVFjgTx0Cu2GGGy+zAAAAAElFTkSuQmCC"
                        },
                        "id": "553a4838-bb5a-4665-b7b4-005a5ec6fed0"
                    },
                    "0f6c2ebd-2369-432c-8d06-c366edd04082": {
                        "id": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "type": "feedback",
                        "parent": "30a83677-1f5e-450e-801e-8191a47d53d5",
                        "children": ["54469ad5-c692-42b8-81cb-cf5863da10f5", "09005fe4-17b9-4bce-8d82-e04fd4ad2df0", "60714967-036a-4102-ad7d-d8457704def6", "774d63ef-d5f1-4bf9-a550-9953160201fe"],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect"],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "54469ad5-c692-42b8-81cb-cf5863da10f5",
                                    "final": "09005fe4-17b9-4bce-8d82-e04fd4ad2df0"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "60714967-036a-4102-ad7d-d8457704def6",
                                    "final": "774d63ef-d5f1-4bf9-a550-9953160201fe"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "mc_single_answer_generic"
                    },
                    "54469ad5-c692-42b8-81cb-cf5863da10f5": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">ممتاز!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAEgUlEQ…KAQpJQYoYESEALAQpJC2YehARIQEKAQpJQYoYESEALgd+XY7czNz0GgAAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "54469ad5-c692-42b8-81cb-cf5863da10f5",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "09005fe4-17b9-4bce-8d82-e04fd4ad2df0": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">جيد جدًّا!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAFY0lEQ…wiIEGya72UrQiEmoAEKdTLq8mJgF0EJEh2rZeyFYFQE/gX/BcwQnLZN5oAAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "09005fe4-17b9-4bce-8d82-e04fd4ad2df0",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "60714967-036a-4102-ad7d-d8457704def6": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">إجابة خاطئة. انقر على \"أعد المحاولة\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAPNklEQ…QNT4OAQSASAsYhRYLNVDIIGATiQMA4pDhQNTwNAgaBSAj8F2ZZhbo6l6GfAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "60714967-036a-4102-ad7d-d8457704def6",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "774d63ef-d5f1-4bf9-a550-9953160201fe": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">انقر على \"أظهر الإجابة\" واهتم بالإجابات الصحيحة.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAqCAYAAAAahCYoAAARsUlEQ…hnCGwBaM0nG9qQOEYT4WHTlVUhjUIqK+QNXYOAQaAEAv8H1mdQ39CvagIAAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "774d63ef-d5f1-4bf9-a550-9953160201fe",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'progress': {
                'id': "7915d6ed-ae58-4bf5-be57-1c06323676d0",
                'data': {
                    "7915d6ed-ae58-4bf5-be57-1c06323676d0": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["b430f340-fb0a-4461-874e-797393f71b07"],
                        "data": {
                            "title": "mc",
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
                        "id": "7915d6ed-ae58-4bf5-be57-1c06323676d0",
                        "is_modified": false,
                        "convertedData": "<sequence type=\"simple\" id=\"7915d6ed-ae58-4bf5-be57-1c06323676d0\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<task exposureid=\"0\" type=\"mc\" id=\"b430f340-fb0a-4461-874e-797393f71b07\" check_type=\"auto\" sha1=\"e045c5899868ba116441f46af057c27003e82f8a\">\n    \n\n    \n<question id=\"ce85f7ed-9e8d-47ca-91fe-d586a30ce268\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"1a6c7675-9611-4fa9-8659-0b7093d54d6d\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkingmode=\"generic\" type=\"mc\">\n    <options>\n        \n<option id=\"f33e897b-b42a-4e8e-ba00-e6f9aaec800b\" correct=\"true\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"ca273d60-b2a3-48af-9022-d0c0ce42ac31\">\n\t    <paragraph><span class=\"normal\">الإجابة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</option>\n<option id=\"c74a9055-6a4d-40b1-bc47-2dc545bea5e2\" correct=\"false\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"5b2dfaef-f999-4f48-b948-5eba62fd18cc\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</option>\n    </options>\n</answer>\n\n<progress id=\"30a83677-1f5e-450e-801e-8191a47d53d5\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t\n\t<attempts>2</attempts>\n\t<checkable>true</checkable>\n    \n<hint>\n    <message attempt=\"first\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"553a4838-bb5a-4665-b7b4-005a5ec6fed0\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n    <message attempt=\"mid\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"553a4838-bb5a-4665-b7b4-005a5ec6fed0\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n    <message attempt=\"last\" attempt-num=\"1\" max-attempts=\"2\">\n        \n\n\t<textviewer id=\"553a4838-bb5a-4665-b7b4-005a5ec6fed0\">\n\t    <paragraph><span class=\"normal\">تلميح</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n    </message>\n</hint>\n\n<feedback>\n\t\t\t\t<message attempt=\"first\" type=\"allCorrect\">\n\n\t<textviewer id=\"54469ad5-c692-42b8-81cb-cf5863da10f5\">\n\t    <paragraph><span class=\"feedback\">ممتاز!</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"last\" type=\"allCorrect\">\n\n\t<textviewer id=\"09005fe4-17b9-4bce-8d82-e04fd4ad2df0\">\n\t    <paragraph><span class=\"feedback\">جيد جدًّا!</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"first\" type=\"allIncorrect\">\n\n\t<textviewer id=\"60714967-036a-4102-ad7d-d8457704def6\">\n\t    <paragraph><span class=\"feedback\">إجابة خاطئة. انقر على \"أعد المحاولة\".</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n\t\t\t\t<message attempt=\"last\" type=\"allIncorrect\">\n\n\t<textviewer id=\"774d63ef-d5f1-4bf9-a550-9953160201fe\">\n\t    <paragraph><span class=\"feedback\">انقر على \"أظهر الإجابة\" واهتم بالإجابات الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\t\t</message>\n\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"8a3a7a60-f166-4227-9cb1-4b99e164eaa4\">\n    \n\n\t<textviewer id=\"30732186-3bff-4264-a651-71bb945c7ad7\">\n\t    <paragraph><span class=\"instruction\">اختر الإجابة الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n</sequence>"
                    },
                    "b430f340-fb0a-4461-874e-797393f71b07": {
                        "id": "b430f340-fb0a-4461-874e-797393f71b07",
                        "type": "mc",
                        "parent": "7915d6ed-ae58-4bf5-be57-1c06323676d0",
                        "children": ["ce85f7ed-9e8d-47ca-91fe-d586a30ce268", "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6", "30a83677-1f5e-450e-801e-8191a47d53d5"],
                        "data": {
                            "title": "New Multiple Choice",
                            "task_check_type": "auto",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "8a3a7a60-f166-4227-9cb1-4b99e164eaa4": {
                        "id": "8a3a7a60-f166-4227-9cb1-4b99e164eaa4",
                        "type": "instruction",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["30732186-3bff-4264-a651-71bb945c7ad7"],
                        "data": {
                            "title": "Instruction",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "30732186-3bff-4264-a651-71bb945c7ad7": {
                        "id": "30732186-3bff-4264-a651-71bb945c7ad7",
                        "type": "textViewer",
                        "parent": "8a3a7a60-f166-4227-9cb1-4b99e164eaa4",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">اختر الإجابة الصحيحة.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAEhklEQ…CAwJYCguqW26IoAgQIECBAgAABQdUZIECAAAECBAgQ2FLgN0c67ELGgVrBAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ce85f7ed-9e8d-47ca-91fe-d586a30ce268": {
                        "id": "ce85f7ed-9e8d-47ca-91fe-d586a30ce268",
                        "type": "question",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["1a6c7675-9611-4fa9-8659-0b7093d54d6d"],
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
                    "1a6c7675-9611-4fa9-8659-0b7093d54d6d": {
                        "type": "textViewer",
                        "parent": "ce85f7ed-9e8d-47ca-91fe-d586a30ce268",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "1a6c7675-9611-4fa9-8659-0b7093d54d6d"
                    },
                    "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6": {
                        "id": "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6",
                        "type": "mcAnswer",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["f33e897b-b42a-4e8e-ba00-e6f9aaec800b", "c74a9055-6a4d-40b1-bc47-2dc545bea5e2"],
                        "data": {
                            "title": "Answer",
                            "disableDelete": true,
                            "answerMode": "mc",
                            "optionsType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f33e897b-b42a-4e8e-ba00-e6f9aaec800b": {
                        "id": "f33e897b-b42a-4e8e-ba00-e6f9aaec800b",
                        "type": "option",
                        "parent": "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6",
                        "children": ["ca273d60-b2a3-48af-9022-d0c0ce42ac31"],
                        "data": {
                            "title": "option",
                            "correct": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ca273d60-b2a3-48af-9022-d0c0ce42ac31": {
                        "id": "ca273d60-b2a3-48af-9022-d0c0ce42ac31",
                        "type": "textViewer",
                        "parent": "f33e897b-b42a-4e8e-ba00-e6f9aaec800b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;١</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHYklEQ…pMWNkpAggggAACCCCAQFABgmpQQdojgAACCCCAAAIIxETgX8MLm0J1qW1aAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c74a9055-6a4d-40b1-bc47-2dc545bea5e2": {
                        "id": "c74a9055-6a4d-40b1-bc47-2dc545bea5e2",
                        "type": "option",
                        "parent": "74dc2b28-f9b2-4efc-b680-ba0ddd9fa1b6",
                        "children": ["5b2dfaef-f999-4f48-b948-5eba62fd18cc"],
                        "data": {
                            "title": "option",
                            "correct": false,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5b2dfaef-f999-4f48-b948-5eba62fd18cc": {
                        "id": "5b2dfaef-f999-4f48-b948-5eba62fd18cc",
                        "type": "textViewer",
                        "parent": "c74a9055-6a4d-40b1-bc47-2dc545bea5e2",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٢</div>",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHjUlEQ…VOEUAAAQQQQAABBPwKEFT9CtIeAQQQQAABBBBAIBCB/wHWbcFCg8i4JwAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "30a83677-1f5e-450e-801e-8191a47d53d5": {
                        "id": "30a83677-1f5e-450e-801e-8191a47d53d5",
                        "type": "progress",
                        "parent": "b430f340-fb0a-4461-874e-797393f71b07",
                        "children": ["bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42", "0f6c2ebd-2369-432c-8d06-c366edd04082", "8a3a7a60-f166-4227-9cb1-4b99e164eaa4"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": true,
                            "hint_timing": "1",
                            "on_attempt": 1,
                            "feedback_type": "generic",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "mc": ["all_correct", "all_incorrect"],
                                "mmc": ["all_correct", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong", "all_incorrect"]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Generic",
                                "value": "generic"
                            }, {
                                "name": "Generic and Specific",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42": {
                        "id": "bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42",
                        "type": "hint",
                        "parent": "30a83677-1f5e-450e-801e-8191a47d53d5",
                        "children": ["553a4838-bb5a-4665-b7b4-005a5ec6fed0"],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": true,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "553a4838-bb5a-4665-b7b4-005a5ec6fed0": {
                        "type": "textViewer",
                        "parent": "bc1d5afe-2daf-4ee3-b07c-e46d49aa0d42",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">تلميح</div>",
                            "mode": "singleStyleNoInfoBaloon",
                            "textEditorStyle": "texteditor cgs",
                            "mathfieldArray": {},
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAUAAAAjCAYAAADsQ7NMAAAHX0lEQ…ECBAgQIECAAIFGBIQCjehZlwABAgQIECBAgAABAgQIVFjgTx0Cu2GGGy+zAAAAAElFTkSuQmCC"
                        },
                        "id": "553a4838-bb5a-4665-b7b4-005a5ec6fed0"
                    },
                    "0f6c2ebd-2369-432c-8d06-c366edd04082": {
                        "id": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "type": "feedback",
                        "parent": "30a83677-1f5e-450e-801e-8191a47d53d5",
                        "children": ["54469ad5-c692-42b8-81cb-cf5863da10f5", "09005fe4-17b9-4bce-8d82-e04fd4ad2df0", "60714967-036a-4102-ad7d-d8457704def6", "774d63ef-d5f1-4bf9-a550-9953160201fe"],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect"],
                            "taskType": "mc",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {
                                "all_correct": {
                                    "type": "generic",
                                    "preliminary": "54469ad5-c692-42b8-81cb-cf5863da10f5",
                                    "final": "09005fe4-17b9-4bce-8d82-e04fd4ad2df0"
                                },
                                "all_incorrect": {
                                    "type": "generic",
                                    "preliminary": "60714967-036a-4102-ad7d-d8457704def6",
                                    "final": "774d63ef-d5f1-4bf9-a550-9953160201fe"
                                }
                            },
                            "feedbacks_map_specific": {}
                        },
                        "predefined_list": "mc_single_answer_generic"
                    },
                    "54469ad5-c692-42b8-81cb-cf5863da10f5": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">ممتاز!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAEgUlEQ…KAQpJQYoYESEALAQpJC2YehARIQEKAQpJQYoYESEALgd+XY7czNz0GgAAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allCorrect"
                        },
                        "id": "54469ad5-c692-42b8-81cb-cf5863da10f5",
                        "stage_preview_container": "#td_p_all_correct"
                    },
                    "09005fe4-17b9-4bce-8d82-e04fd4ad2df0": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">جيد جدًّا!</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAFY0lEQ…wiIEGya72UrQiEmoAEKdTLq8mJgF0EJEh2rZeyFYFQE/gX/BcwQnLZN5oAAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allCorrect"
                        },
                        "id": "09005fe4-17b9-4bce-8d82-e04fd4ad2df0",
                        "stage_preview_container": "#td_f_all_correct"
                    },
                    "60714967-036a-4102-ad7d-d8457704def6": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">إجابة خاطئة. انقر على \"أعد المحاولة\".</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAjCAYAAAA9i3fgAAAPNklEQ…QNT4OAQSASAsYhRYLNVDIIGATiQMA4pDhQNTwNAgaBSAj8F2ZZhbo6l6GfAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "first",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "60714967-036a-4102-ad7d-d8457704def6",
                        "stage_preview_container": "#td_p_all_incorrect"
                    },
                    "774d63ef-d5f1-4bf9-a550-9953160201fe": {
                        "type": "textViewer",
                        "parent": "0f6c2ebd-2369-432c-8d06-c366edd04082",
                        "childConfig": {},
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs feedback\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"feedback\">انقر على \"أظهر الإجابة\" واهتم بالإجابات الصحيحة.</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "feedback",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAAAqCAYAAAAahCYoAAARsUlEQ…hnCGwBaM0nG9qQOEYT4WHTlVUhjUIqK+QNXYOAQaAEAv8H1mdQ39CvagIAAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "message": true,
                            "attempt": "last",
                            "feedback_type": "allIncorrect"
                        },
                        "id": "774d63ef-d5f1-4bf9-a550-9953160201fe",
                        "stage_preview_container": "#td_f_all_incorrect"
                    }
                }
            },
            'header': {
                "id": "16f14ca6-a71d-4008-baf6-59f251b2e1b1",
                "data": {
                    "16f14ca6-a71d-4008-baf6-59f251b2e1b1": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["7cccb5cb-a4b8-4b91-9e27-58e4e44dba0a", "997e2330-8541-4f4f-98a3-4ee32444d603"],
                        "data": {
                            "title": "header",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "id": "16f14ca6-a71d-4008-baf6-59f251b2e1b1",
                        "is_modified": false,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"16f14ca6-a71d-4008-baf6-59f251b2e1b1\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<header id=\"7cccb5cb-a4b8-4b91-9e27-58e4e44dba0a\">\n    \t\n\t<textviewer id=\"ecdcfdcc-99a7-4ad3-99c0-83ef1852de7c\">\n\t    <paragraph><span class=\"sequenceTitle\">العنوان</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</header>\n\n\t<instruction show=\"true\">\n\t<textviewer id=\"0e5880b5-fbf4-4925-916a-20fe70fc832f\">\n\t    <paragraph><span class=\"sequenceSubTitle\">تعليمات</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n}</instruction>\n\n<task exposureid=\"1\" type=\"questionOnly\" id=\"997e2330-8541-4f4f-98a3-4ee32444d603\" check_type=\"manual\" sha1=\"76082bedb37735b41cab1488dd889488a75bea9e\">\n    \n\n    \n<question id=\"5c90df0f-4421-4ffa-bb24-7376e575da25\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"4a10eae0-0cf7-49a5-8241-48fc22afa850\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<progress id=\"fef0ee41-49e3-4b14-87f9-b4700867ae22\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>0</attempts>\n\t<checkable>true</checkable>\n    \n\n\n</progress>\n\n</task>\n</sequence>"
                    },
                    "7cccb5cb-a4b8-4b91-9e27-58e4e44dba0a": {
                        "id": "7cccb5cb-a4b8-4b91-9e27-58e4e44dba0a",
                        "type": "header",
                        "parent": "16f14ca6-a71d-4008-baf6-59f251b2e1b1",
                        "children": ["de4c0107-9261-4573-9895-e9ad7e9fbeb7", "c48d0f2f-6abb-46f3-8eeb-f82138773cbd"],
                        "data": {
                            "title": "New header",
                            "task_check_type": "none",
                            "showGenericTitle": true,
                            "showGenericSubTitle": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "isCourse": false,
                        "toggleButton": true
                    },
                    "de4c0107-9261-4573-9895-e9ad7e9fbeb7": {
                        "id": "de4c0107-9261-4573-9895-e9ad7e9fbeb7",
                        "type": "genericTitle",
                        "parent": "7cccb5cb-a4b8-4b91-9e27-58e4e44dba0a",
                        "children": ["ecdcfdcc-99a7-4ad3-99c0-83ef1852de7c"],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "ecdcfdcc-99a7-4ad3-99c0-83ef1852de7c": {
                        "id": "ecdcfdcc-99a7-4ad3-99c0-83ef1852de7c",
                        "type": "textViewer",
                        "parent": "de4c0107-9261-4573-9895-e9ad7e9fbeb7",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs sequenceTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"sequenceTitle\">العنوان</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "sequenceTitle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAtCAYAAABmr0kjAAAN/0lEQ…2mpuaVPXv2nLyYOCRULyZd2RYBERABERABERABEUhM4P9e0uWIpdT6NgAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c48d0f2f-6abb-46f3-8eeb-f82138773cbd": {
                        "id": "c48d0f2f-6abb-46f3-8eeb-f82138773cbd",
                        "type": "genericSubTitle",
                        "parent": "7cccb5cb-a4b8-4b91-9e27-58e4e44dba0a",
                        "children": ["0e5880b5-fbf4-4925-916a-20fe70fc832f"],
                        "data": {
                            "title": "title",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "0e5880b5-fbf4-4925-916a-20fe70fc832f": {
                        "id": "0e5880b5-fbf4-4925-916a-20fe70fc832f",
                        "type": "textViewer",
                        "parent": "c48d0f2f-6abb-46f3-8eeb-f82138773cbd",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs sequenceSubTitle\" style=\"min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"sequenceSubTitle\">تعليمات</div>",
                            "disableDelete": true,
                            "mode": "singleStyleNoInfoBaloon",
                            "styleOverride": "sequenceSubTitle",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAKUklEQ…oSkIAEJCABCUhAAiUhoFAtCWY7kYAEJCABCUhAAhJIS+B/I8kJ5B3CPK4AAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "997e2330-8541-4f4f-98a3-4ee32444d603": {
                        "id": "997e2330-8541-4f4f-98a3-4ee32444d603",
                        "type": "questionOnly",
                        "parent": "16f14ca6-a71d-4008-baf6-59f251b2e1b1",
                        "children": ["5c90df0f-4421-4ffa-bb24-7376e575da25", "fef0ee41-49e3-4b14-87f9-b4700867ae22"],
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
                    "26908368-df43-4807-af49-f01c5b8c6269": {
                        "id": "26908368-df43-4807-af49-f01c5b8c6269",
                        "type": "instruction",
                        "parent": "997e2330-8541-4f4f-98a3-4ee32444d603",
                        "children": ["1377c2ab-fbbf-48ce-8340-155869c01df3"],
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
                    "1377c2ab-fbbf-48ce-8340-155869c01df3": {
                        "id": "1377c2ab-fbbf-48ce-8340-155869c01df3",
                        "type": "textViewer",
                        "parent": "26908368-df43-4807-af49-f01c5b8c6269",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">Click to edit the instruction</div>",
                            "mode": "singleStylePlainText",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "availbleNarrationTypes": [{
                                "name": "None",
                                "value": ""
                            }, {
                                "name": "General",
                                "value": "1"
                            }],
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true
                        }
                    },
                    "5c90df0f-4421-4ffa-bb24-7376e575da25": {
                        "id": "5c90df0f-4421-4ffa-bb24-7376e575da25",
                        "type": "question",
                        "parent": "997e2330-8541-4f4f-98a3-4ee32444d603",
                        "children": ["4a10eae0-0cf7-49a5-8241-48fc22afa850"],
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
                    "4a10eae0-0cf7-49a5-8241-48fc22afa850": {
                        "type": "textViewer",
                        "parent": "5c90df0f-4421-4ffa-bb24-7376e575da25",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "4a10eae0-0cf7-49a5-8241-48fc22afa850"
                    },
                    "fef0ee41-49e3-4b14-87f9-b4700867ae22": {
                        "id": "fef0ee41-49e3-4b14-87f9-b4700867ae22",
                        "type": "progress",
                        "parent": "997e2330-8541-4f4f-98a3-4ee32444d603",
                        "children": ["e464e048-6066-4788-a122-1487409ab2af", "26908368-df43-4807-af49-f01c5b8c6269"],
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
                    "e464e048-6066-4788-a122-1487409ab2af": {
                        "id": "e464e048-6066-4788-a122-1487409ab2af",
                        "type": "hint",
                        "parent": "fef0ee41-49e3-4b14-87f9-b4700867ae22",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "maxAttempts": "0"
                        }
                    }
                }
            },
            'mtq': {
                "id": "d49b0efe-7467-4252-aac0-66738c45b6c5",
                "data": {
                    "0": {
                        "id": 0,
                        "type": "mtqSubAnswer",
                        "parent": "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb",
                        "children": ["38954bd5-e49d-4bcf-8d81-d811a1a2c730"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "1": {
                        "id": 1,
                        "type": "mtqSubAnswer",
                        "parent": "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb",
                        "children": ["70bc9624-7327-44a3-be8c-09a440c3f24c"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d49b0efe-7467-4252-aac0-66738c45b6c5": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["ec6e433e-a46e-4af3-93dc-3682508a1629", "b78f74d8-507a-4b26-a476-90c57a1a3e34", "ea0e84f1-22b5-4e98-95f5-e064138213dc"],
                        "data": {
                            "title": "match",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "id": "d49b0efe-7467-4252-aac0-66738c45b6c5",
                        "is_modified": false,
                        "isCourse": false,
                        "convertedData": "<sequence type=\"simple\" id=\"d49b0efe-7467-4252-aac0-66738c45b6c5\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<task exposureid=\"0\" type=\"mtq\" id=\"ec6e433e-a46e-4af3-93dc-3682508a1629\" check_type=\"auto\" sha1=\"52a4c1149c5ac3f4630ec821dd5e10e67f6300a7\">\n        <mode>matching</mode>\n    \n\n    <!-- in mtq task -->\n\t\t\n\t\t<placeholders>true</placeholders>\t\t\n\t\t<bank>true</bank>\n\t\t<bankrandom>false</bankrandom>\n\t\t<!--dragAndCopy - reusable bank, dragAndDisable - not reusable -->\n\t\t<bankmode>dragAndDisable</bankmode>\n\t\t<mistakefactor>0</mistakefactor>\n\t\t\n    \n<question id=\"c32a2d6a-4ec5-43f1-87d7-958c23ac6277\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"11cf8bc6-a3c3-4c8f-af28-9a19761161ee\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\" checkingmode=\"local\">\n\t\n<mtqarea id=\"b7797287-a00a-4cfb-bd26-72b369dcf218\" auto_tag=\"auto_tag\">\n\t\n<mtqsubquestion id=\"1dba4a31-b7ef-4799-a492-ed587161c11d\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"64099e0c-b6f7-41e5-9506-53455ea17a16\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"d14148df-0d31-46d6-9dd9-93fc1325bc7d\">\n\t    <paragraph><span class=\"definition\">تعريف ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n\t<subanswer answerid=\"b741faee-32e9-4873-85fb-0e0b0bd65b45\">\n\n\t\t\t<correct>\n\t\t\t\t<option>0</option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqsubquestion>\n<mtqsubquestion id=\"9e618e3c-51b6-445a-92be-7eb7bfd55108\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"e5cc8893-2b57-4b96-ba31-f60da620bcae\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"52d11219-2d52-490c-acb0-f32346b0cdf8\">\n\t    <paragraph><span class=\"definition\">تعريف ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n\t<subanswer answerid=\"139e3b95-4f38-4480-949b-92d9ff709061\">\n\n\t\t\t<correct>\n\t\t\t\t<option>1</option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqsubquestion>\n</mtqarea>\n<mtqbank id=\"d734e9b9-349a-44a8-bbc4-0eb7abcbddfb\" auto_tag=\"auto_tag\">\n\t\n\t<subanswer answerid=\"047a264e-0d83-4787-a341-5f2cd1b3572f\">\n\t\t\t\n\n\t<textviewer id=\"51eeba11-3971-407d-a046-2cfeb30e9d18\">\n\t    <paragraph><span class=\"normal\">اختيار من بنك الأسئلة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"9f5f0ebd-cba8-4d73-afa6-8e578085c802\">\n\t\t\t\n\n\t<textviewer id=\"20a7454b-ebde-4ae8-b081-9c1cc41f2d13\">\n\t    <paragraph><span class=\"normal\">اختيار من بنك الأسئلة ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"0\">\n\t\t\t\n\n\t<textviewer id=\"38954bd5-e49d-4bcf-8d81-d811a1a2c730\">\n\t    <paragraph><span class=\"normal\">الإجابة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n\t<subanswer answerid=\"1\">\n\t\t\t\n\n\t<textviewer id=\"70bc9624-7327-44a3-be8c-09a440c3f24c\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t\t\t<correct>\n\t\t\t\t<option></option>\n\t\t\t</correct>\t\n\t</subanswer>\n\n</mtqbank>\n</answer>\n<progress id=\"c257db97-7d05-4eb5-8fd1-e9c29a66e30f\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>2</attempts>\n\t\t<type>oneCompletion</type>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n<instruction id=\"7d6383bd-733c-49d7-b396-57e55e1cf442\">\n    \n\n\t<textviewer id=\"6073de84-539e-44e0-9c8c-7e6d5aa98ac4\">\n\t    <paragraph><span class=\"instruction\">طابق البنود مع التعريفات الصحيحة.</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</instruction>\n\n</progress>\n\n</task>\n<task exposureid=\"1\" type=\"mtq\" id=\"b78f74d8-507a-4b26-a476-90c57a1a3e34\" check_type=\"auto\" sha1=\"fdfc54bca4d1d610d3f52f292cdc54b19186bf4b\">\n        <mode>sorting</mode>\n    \n\n    <!-- in mtq task -->\n\t\t\n\t\t<placeholders>true</placeholders>\t\t\n\t\t<bank>false</bank>\n\t\t<bankrandom>false</bankrandom>\n\t\t<!--dragAndCopy - reusable bank, dragAndDisable - not reusable -->\n\t\t<bankmode>dragAndDisable</bankmode>\n\t\t<mistakefactor>1</mistakefactor>\n\t\t\n    \n<question id=\"c1cc1f35-bf76-4929-9d57-3f623e02845b\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"ebe92f9f-537f-48e0-a797-84ce2269c802\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\" checkingmode=\"local\">\n\t\n<mtqarea id=\"f4ab5810-c8a8-4d65-aad0-f9a4cb9d4e08\" auto_tag=\"auto_tag\">\n\t\n<mtqmultisubquestion id=\"e1cb3654-450e-4250-b3fe-1ba203180290\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"190e538a-84e3-4bbb-bb96-30e958292fdf\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"4420b134-d399-4dad-b4be-86951c0c7a2c\">\n\t    <paragraph><span class=\"definition\">تعريف ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n <multisubanswer id=\"0dc19867-ba5d-4085-80db-7f4780d41d03\">\n \t\t\n\t<subanswer answerid=\"6e6f5c7c-62a7-4ae6-8647-08f042d56db6\">\n\t\t\t\n\n\t<textviewer id=\"f9a38bca-37b2-4c05-ae2a-f7f24422d864\">\n\t    <paragraph><span class=\"normal\">الإجابة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n \t<correct>\n\t\t<set>6e6f5c7c-62a7-4ae6-8647-08f042d56db6</set>\n\t</correct>\n</multisubanswer>\n</mtqmultisubquestion>\n<mtqmultisubquestion id=\"895a76c3-31db-4b78-84e7-78a61665951a\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"17d9cb8a-0a9c-4e77-9925-1296837c036d\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"b1fd84ea-fed8-4958-8aa8-f5f5ff30ab2b\">\n\t    <paragraph><span class=\"definition\">تعريف ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n <multisubanswer id=\"47be2872-fc53-41c4-94c5-83ad4d0a358d\">\n \t\t\n\t<subanswer answerid=\"7737a8ea-bf76-4983-a98d-3fd51341a9af\">\n\t\t\t\n\n\t<textviewer id=\"763cd510-4d0e-4f1c-8e6b-76b08310764c\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢.١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n\t<subanswer answerid=\"1c5d2baa-20d5-4eda-ab30-943d071e4276\">\n\t\t\t\n\n\t<textviewer id=\"470ec454-bf4d-4a31-be90-a65468f256cf\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢.٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n \t<correct>\n\t\t<set>7737a8ea-bf76-4983-a98d-3fd51341a9af,1c5d2baa-20d5-4eda-ab30-943d071e4276</set>\n\t</correct>\n</multisubanswer>\n</mtqmultisubquestion>\n</mtqarea>\n</answer>\n<progress id=\"2ae6f877-ee4c-40d2-8010-828761d5112d\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>1</attempts>\n\t\t<type>oneCompletion</type>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n\n</progress>\n\n</task>\n<task exposureid=\"2\" type=\"mtq\" id=\"ea0e84f1-22b5-4e98-95f5-e064138213dc\" check_type=\"auto\" sha1=\"e886c5ea0643fc11ac02ab12c36ca27d4aaf45b6\">\n        <mode>sequencing</mode>\n    \n\n    <!-- in mtq task -->\n\t\t\n\t\t<placeholders>false</placeholders>\t\t\n\t\t<bank>false</bank>\n\t\t<bankrandom>false</bankrandom>\n\t\t<!--dragAndCopy - reusable bank, dragAndDisable - not reusable -->\n\t\t<bankmode>dragAndDisable</bankmode>\n\t\t<mistakefactor>0</mistakefactor>\n\t\t\n    \n<question id=\"320b8e3f-e8cd-4a2b-ad9f-8f1c8a9d1565\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"5fd27dc1-55b7-4c12-bb63-0cb163bd41f4\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\" checkingmode=\"local\">\n\t\n<mtqarea id=\"510a19cd-8241-4abf-ae06-06e92c82ebcd\" auto_tag=\"auto_tag\">\n\t\n<mtqmultisubquestion id=\"92fa9808-e9bb-4902-9ab3-46164343da1f\" auto_tag=\"auto_tag\">\n\t\n<definition id=\"99defd64-9305-41aa-beab-9a35e7a69d07\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"bff23563-8f2f-472c-aa7e-cc7927d5ef18\">\n\t    <paragraph><span class=\"definition\">تعريف ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n <multisubanswer id=\"9abc7103-11dd-432b-9fe8-482eef7095c5\">\n \t\t\n\t<subanswer answerid=\"9c026993-cb76-42d2-b26d-0fb903bd7af8\">\n\t\t\t\n\n\t<textviewer id=\"9601032d-92e1-47e3-93ec-3b1c7e0a9d09\">\n\t    <paragraph><span class=\"normal\">الإجابة ١</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n\t<subanswer answerid=\"b0f6a543-b2e1-4f62-9a6e-5bc168bb652b\">\n\t\t\t\n\n\t<textviewer id=\"b2ccbdb6-b155-440a-9ba3-c48db2ed14fa\">\n\t    <paragraph><span class=\"normal\">الإجابة ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n\t<subanswer answerid=\"796c0012-9bd9-42a1-a51e-9a80497f5942\">\n\t\t\t\n\n\t<textviewer id=\"5791755a-3f85-453a-8466-2d24a607dd5f\">\n\t    <paragraph><span class=\"normal\">الإجابة ٣</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n\t</subanswer>\n\n \t<correct>\n\t\t<set>9c026993-cb76-42d2-b26d-0fb903bd7af8,b0f6a543-b2e1-4f62-9a6e-5bc168bb652b,796c0012-9bd9-42a1-a51e-9a80497f5942</set>\n\t</correct>\n</multisubanswer>\n<definition id=\"97247136-2bfc-48cf-ac32-0f9b31290248\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"85f6f1ac-3588-4d66-b1a0-f9444def31c2\">\n\t    <paragraph><span class=\"definition\">تعريف ٢</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</definition>\n</mtqmultisubquestion>\n</mtqarea>\n</answer>\n<progress id=\"040afbdf-62aa-4bcf-8a31-61171fba6564\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>2</attempts>\n\t\t<type>oneCompletion</type>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n\n</progress>\n\n</task>\n</sequence>"
                    },
                    "ec6e433e-a46e-4af3-93dc-3682508a1629": {
                        "id": "ec6e433e-a46e-4af3-93dc-3682508a1629",
                        "type": "matching",
                        "parent": "d49b0efe-7467-4252-aac0-66738c45b6c5",
                        "children": ["c32a2d6a-4ec5-43f1-87d7-958c23ac6277", "5531070a-fd6e-4994-a420-e72be25026a4", "c257db97-7d05-4eb5-8fd1-e9c29a66e30f"],
                        "data": {
                            "title": "New mtq matching editor",
                            "task_check_type": "auto",
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
                    "7d6383bd-733c-49d7-b396-57e55e1cf442": {
                        "id": "7d6383bd-733c-49d7-b396-57e55e1cf442",
                        "type": "instruction",
                        "parent": "ec6e433e-a46e-4af3-93dc-3682508a1629",
                        "children": ["6073de84-539e-44e0-9c8c-7e6d5aa98ac4"],
                        "data": {
                            "title": "",
                            "show": true,
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "dontAllowChildren": false
                            }
                        }
                    },
                    "6073de84-539e-44e0-9c8c-7e6d5aa98ac4": {
                        "id": "6073de84-539e-44e0-9c8c-7e6d5aa98ac4",
                        "type": "textViewer",
                        "parent": "7d6383bd-733c-49d7-b396-57e55e1cf442",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">طابق البنود مع التعريفات الصحيحة.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAFsElEQ…YCguotl0VTBAgQIECAAAECgqo9QIAAAQIECBAgcEuB/wG1VOxg8byWCgAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c32a2d6a-4ec5-43f1-87d7-958c23ac6277": {
                        "id": "c32a2d6a-4ec5-43f1-87d7-958c23ac6277",
                        "type": "question",
                        "parent": "ec6e433e-a46e-4af3-93dc-3682508a1629",
                        "children": ["11cf8bc6-a3c3-4c8f-af28-9a19761161ee"],
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
                    "11cf8bc6-a3c3-4c8f-af28-9a19761161ee": {
                        "type": "textViewer",
                        "parent": "c32a2d6a-4ec5-43f1-87d7-958c23ac6277",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "11cf8bc6-a3c3-4c8f-af28-9a19761161ee"
                    },
                    "5531070a-fd6e-4994-a420-e72be25026a4": {
                        "id": "5531070a-fd6e-4994-a420-e72be25026a4",
                        "type": "matchingAnswer",
                        "parent": "ec6e433e-a46e-4af3-93dc-3682508a1629",
                        "children": ["b7797287-a00a-4cfb-bd26-72b369dcf218", "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb"],
                        "data": {
                            "title": "matchingAnswer",
                            "placeHolder": true,
                            "mtqMode": "one_to_one",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "interaction_type": "drag_and_drop",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "useBank": true
                        }
                    },
                    "b7797287-a00a-4cfb-bd26-72b369dcf218": {
                        "id": "b7797287-a00a-4cfb-bd26-72b369dcf218",
                        "type": "mtqArea",
                        "parent": "5531070a-fd6e-4994-a420-e72be25026a4",
                        "children": ["1dba4a31-b7ef-4799-a492-ed587161c11d", "9e618e3c-51b6-445a-92be-7eb7bfd55108"],
                        "data": {
                            "title": "MtqArea",
                            "useBank": true,
                            "mtqAnswerType": "matchingAnswer",
                            "hasMultiSubAnswers": false,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "canDeleteChildren": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "1dba4a31-b7ef-4799-a492-ed587161c11d": {
                        "id": "1dba4a31-b7ef-4799-a492-ed587161c11d",
                        "type": "mtqSubQuestion",
                        "parent": "b7797287-a00a-4cfb-bd26-72b369dcf218",
                        "children": ["64099e0c-b6f7-41e5-9506-53455ea17a16", "b741faee-32e9-4873-85fb-0e0b0bd65b45"],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "64099e0c-b6f7-41e5-9506-53455ea17a16": {
                        "id": "64099e0c-b6f7-41e5-9506-53455ea17a16",
                        "type": "definition",
                        "parent": "1dba4a31-b7ef-4799-a492-ed587161c11d",
                        "children": ["d14148df-0d31-46d6-9dd9-93fc1325bc7d"],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d14148df-0d31-46d6-9dd9-93fc1325bc7d": {
                        "id": "d14148df-0d31-46d6-9dd9-93fc1325bc7d",
                        "type": "textViewer",
                        "parent": "64099e0c-b6f7-41e5-9506-53455ea17a16",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\" Click to edit definition. \">تعريف&nbsp;١</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHXUlEQ…SzuQIKKKCAAgoooEAyAgbVZJwdRQEFFFBAAQUUUCCmwL9npjAh3lqG4wAAAABJRU5ErkJggg==",
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b741faee-32e9-4873-85fb-0e0b0bd65b45": {
                        "id": "b741faee-32e9-4873-85fb-0e0b0bd65b45",
                        "type": "mtqSubAnswer",
                        "parent": "1dba4a31-b7ef-4799-a492-ed587161c11d",
                        "children": ["38954bd5-e49d-4bcf-8d81-d811a1a2c730"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 0
                        }
                    },
                    "38954bd5-e49d-4bcf-8d81-d811a1a2c730": {
                        "id": "38954bd5-e49d-4bcf-8d81-d811a1a2c730",
                        "type": "textViewer",
                        "parent": "b741faee-32e9-4873-85fb-0e0b0bd65b45",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;١</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "isValid": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAH+ElEQ…B0FaQ9AggggAACCCCAgJUAwdOKiSIEEEAAAQQQQAABV4F/Af+Hm0tvnsh1AAAAAElFTkSuQmCC",
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "9e618e3c-51b6-445a-92be-7eb7bfd55108": {
                        "id": "9e618e3c-51b6-445a-92be-7eb7bfd55108",
                        "type": "mtqSubQuestion",
                        "parent": "b7797287-a00a-4cfb-bd26-72b369dcf218",
                        "children": ["e5cc8893-2b57-4b96-ba31-f60da620bcae", "139e3b95-4f38-4480-949b-92d9ff709061"],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e5cc8893-2b57-4b96-ba31-f60da620bcae": {
                        "id": "e5cc8893-2b57-4b96-ba31-f60da620bcae",
                        "type": "definition",
                        "parent": "9e618e3c-51b6-445a-92be-7eb7bfd55108",
                        "children": ["52d11219-2d52-490c-acb0-f32346b0cdf8"],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "52d11219-2d52-490c-acb0-f32346b0cdf8": {
                        "id": "52d11219-2d52-490c-acb0-f32346b0cdf8",
                        "type": "textViewer",
                        "parent": "e5cc8893-2b57-4b96-ba31-f60da620bcae",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\" Click to edit definition. \">تعريف&nbsp;٢</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHkklEQ…UimMUVUEABBRRQQAEF4hEwqMbjbCsKKKCAAgoooIACEQX+BauDQCER1z72AAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "139e3b95-4f38-4480-949b-92d9ff709061": {
                        "id": "139e3b95-4f38-4480-949b-92d9ff709061",
                        "type": "mtqSubAnswer",
                        "parent": "9e618e3c-51b6-445a-92be-7eb7bfd55108",
                        "children": ["70bc9624-7327-44a3-be8c-09a440c3f24c"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "correct": 1
                        }
                    },
                    "70bc9624-7327-44a3-be8c-09a440c3f24c": {
                        "id": "70bc9624-7327-44a3-be8c-09a440c3f24c",
                        "type": "textViewer",
                        "parent": "139e3b95-4f38-4480-949b-92d9ff709061",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٢</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAIHElEQ…A8XQXpRwABBBBAAAEEELASIHhaMVGEAAIIIIAAAggg4CrwPy/lwUtCrbuyAAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb": {
                        "type": "mtqBank",
                        "parent": "5531070a-fd6e-4994-a420-e72be25026a4",
                        "children": ["047a264e-0d83-4787-a341-5f2cd1b3572f", "9f5f0ebd-cba8-4d73-afa6-8e578085c802", 0, 1],
                        "data": {
                            "title": "MtqBank",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb"
                    },
                    "047a264e-0d83-4787-a341-5f2cd1b3572f": {
                        "id": "047a264e-0d83-4787-a341-5f2cd1b3572f",
                        "type": "mtqSubAnswer",
                        "parent": "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb",
                        "children": ["51eeba11-3971-407d-a046-2cfeb30e9d18"],
                        "data": {
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "51eeba11-3971-407d-a046-2cfeb30e9d18": {
                        "id": "51eeba11-3971-407d-a046-2cfeb30e9d18",
                        "type": "textViewer",
                        "parent": "047a264e-0d83-4787-a341-5f2cd1b3572f",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">اختيار من بنك الأسئلة&nbsp;١</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAP9ElEQ…iIgAiIgAiIgAjkFwEJz/yab41WBERABERABERABLJG4D/It/iWUDBWOwAAAABJRU5ErkJggg==",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "9f5f0ebd-cba8-4d73-afa6-8e578085c802": {
                        "id": "9f5f0ebd-cba8-4d73-afa6-8e578085c802",
                        "type": "mtqSubAnswer",
                        "parent": "d734e9b9-349a-44a8-bbc4-0eb7abcbddfb",
                        "children": ["20a7454b-ebde-4ae8-b081-9c1cc41f2d13"],
                        "data": {
                            "disableDelete": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "20a7454b-ebde-4ae8-b081-9c1cc41f2d13": {
                        "id": "20a7454b-ebde-4ae8-b081-9c1cc41f2d13",
                        "type": "textViewer",
                        "parent": "9f5f0ebd-cba8-4d73-afa6-8e578085c802",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">اختيار من بنك الأسئلة&nbsp;٢</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAQDklEQ…IsAiIgAiIgAiIgAsVFQMKzuOZboxUBERABERABERCBvBH4D2pz85aT6ez+AAAAAElFTkSuQmCC",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "c257db97-7d05-4eb5-8fd1-e9c29a66e30f": {
                        "id": "c257db97-7d05-4eb5-8fd1-e9c29a66e30f",
                        "type": "progress",
                        "parent": "ec6e433e-a46e-4af3-93dc-3682508a1629",
                        "children": ["6824c0ef-d8e8-4ba7-8d3a-c5e274f8bec7", "a2ddd67d-d49d-475a-a1d1-feb0733800f7", "7d6383bd-733c-49d7-b396-57e55e1cf442"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "local",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect", "partly_correct"],
                            "AdvancedFeedbacksToDisplay": ["all_correct", "all_incorrect", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80"],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "6824c0ef-d8e8-4ba7-8d3a-c5e274f8bec7": {
                        "id": "6824c0ef-d8e8-4ba7-8d3a-c5e274f8bec7",
                        "type": "hint",
                        "parent": "c257db97-7d05-4eb5-8fd1-e9c29a66e30f",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "a2ddd67d-d49d-475a-a1d1-feb0733800f7": {
                        "id": "a2ddd67d-d49d-475a-a1d1-feb0733800f7",
                        "type": "feedback",
                        "parent": "c257db97-7d05-4eb5-8fd1-e9c29a66e30f",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect", "partly_correct"],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b78f74d8-507a-4b26-a476-90c57a1a3e34": {
                        "id": "b78f74d8-507a-4b26-a476-90c57a1a3e34",
                        "type": "sorting",
                        "parent": "d49b0efe-7467-4252-aac0-66738c45b6c5",
                        "children": ["c1cc1f35-bf76-4929-9d57-3f623e02845b", "c19ca646-0fed-49c3-a245-36b690ba153a", "2ae6f877-ee4c-40d2-8010-828761d5112d"],
                        "data": {
                            "title": "New mtq sorting editor",
                            "task_check_type": "auto",
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
                    "cfed7baa-2617-4f67-a1c0-c69882e12c05": {
                        "id": "cfed7baa-2617-4f67-a1c0-c69882e12c05",
                        "type": "instruction",
                        "parent": "b78f74d8-507a-4b26-a476-90c57a1a3e34",
                        "children": ["94cc4d04-5d7b-4565-a183-be833d8435dc"],
                        "data": {
                            "title": "",
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
                    "94cc4d04-5d7b-4565-a183-be833d8435dc": {
                        "id": "94cc4d04-5d7b-4565-a183-be833d8435dc",
                        "type": "textViewer",
                        "parent": "cfed7baa-2617-4f67-a1c0-c69882e12c05",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">صنِّف البنود في فئاتها المماثلة.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true
                        }
                    },
                    "c1cc1f35-bf76-4929-9d57-3f623e02845b": {
                        "id": "c1cc1f35-bf76-4929-9d57-3f623e02845b",
                        "type": "question",
                        "parent": "b78f74d8-507a-4b26-a476-90c57a1a3e34",
                        "children": ["ebe92f9f-537f-48e0-a797-84ce2269c802"],
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
                    "ebe92f9f-537f-48e0-a797-84ce2269c802": {
                        "type": "textViewer",
                        "parent": "c1cc1f35-bf76-4929-9d57-3f623e02845b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg=="
                        },
                        "id": "ebe92f9f-537f-48e0-a797-84ce2269c802"
                    },
                    "c19ca646-0fed-49c3-a245-36b690ba153a": {
                        "id": "c19ca646-0fed-49c3-a245-36b690ba153a",
                        "type": "sortingAnswer",
                        "parent": "b78f74d8-507a-4b26-a476-90c57a1a3e34",
                        "children": ["f4ab5810-c8a8-4d65-aad0-f9a4cb9d4e08"],
                        "data": {
                            "title": "sortingAnswer",
                            "useBank": false,
                            "mtqMode": "one_to_one",
                            "placeHolder": true,
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "interaction_type": "drag_and_drop",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f4ab5810-c8a8-4d65-aad0-f9a4cb9d4e08": {
                        "id": "f4ab5810-c8a8-4d65-aad0-f9a4cb9d4e08",
                        "type": "mtqArea",
                        "parent": "c19ca646-0fed-49c3-a245-36b690ba153a",
                        "children": ["e1cb3654-450e-4250-b3fe-1ba203180290", "895a76c3-31db-4b78-84e7-78a61665951a"],
                        "data": {
                            "title": "MtqArea",
                            "useBank": false,
                            "mtqAnswerType": "sortingAnswer",
                            "hasMultiSubAnswers": true,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e1cb3654-450e-4250-b3fe-1ba203180290": {
                        "id": "e1cb3654-450e-4250-b3fe-1ba203180290",
                        "type": "mtqSubQuestion",
                        "parent": "f4ab5810-c8a8-4d65-aad0-f9a4cb9d4e08",
                        "children": ["190e538a-84e3-4bbb-bb96-30e958292fdf", "0dc19867-ba5d-4085-80db-7f4780d41d03"],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "190e538a-84e3-4bbb-bb96-30e958292fdf": {
                        "id": "190e538a-84e3-4bbb-bb96-30e958292fdf",
                        "type": "definition",
                        "parent": "e1cb3654-450e-4250-b3fe-1ba203180290",
                        "children": ["4420b134-d399-4dad-b4be-86951c0c7a2c"],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "4420b134-d399-4dad-b4be-86951c0c7a2c": {
                        "id": "4420b134-d399-4dad-b4be-86951c0c7a2c",
                        "type": "textViewer",
                        "parent": "190e538a-84e3-4bbb-bb96-30e958292fdf",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\" Click to edit definition. \">تعريف&nbsp;١</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHXUlEQ…SzuQIKKKCAAgoooEAyAgbVZJwdRQEFFFBAAQUUUCCmwL9npjAh3lqG4wAAAABJRU5ErkJggg=="
                        }
                    },
                    "0dc19867-ba5d-4085-80db-7f4780d41d03": {
                        "id": "0dc19867-ba5d-4085-80db-7f4780d41d03",
                        "type": "mtqMultiSubAnswer",
                        "parent": "e1cb3654-450e-4250-b3fe-1ba203180290",
                        "children": ["6e6f5c7c-62a7-4ae6-8647-08f042d56db6"],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sortingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "6e6f5c7c-62a7-4ae6-8647-08f042d56db6": {
                        "id": "6e6f5c7c-62a7-4ae6-8647-08f042d56db6",
                        "type": "mtqSubAnswer",
                        "parent": "0dc19867-ba5d-4085-80db-7f4780d41d03",
                        "children": ["f9a38bca-37b2-4c05-ae2a-f7f24422d864"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f9a38bca-37b2-4c05-ae2a-f7f24422d864": {
                        "id": "f9a38bca-37b2-4c05-ae2a-f7f24422d864",
                        "type": "textViewer",
                        "parent": "6e6f5c7c-62a7-4ae6-8647-08f042d56db6",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;١</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAH+ElEQ…B0FaQ9AggggAACCCCAgJUAwdOKiSIEEEAAAQQQQAABV4F/Af+Hm0tvnsh1AAAAAElFTkSuQmCC"
                        }
                    },
                    "895a76c3-31db-4b78-84e7-78a61665951a": {
                        "id": "895a76c3-31db-4b78-84e7-78a61665951a",
                        "type": "mtqSubQuestion",
                        "parent": "f4ab5810-c8a8-4d65-aad0-f9a4cb9d4e08",
                        "children": ["17d9cb8a-0a9c-4e77-9925-1296837c036d", "47be2872-fc53-41c4-94c5-83ad4d0a358d"],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "17d9cb8a-0a9c-4e77-9925-1296837c036d": {
                        "id": "17d9cb8a-0a9c-4e77-9925-1296837c036d",
                        "type": "definition",
                        "parent": "895a76c3-31db-4b78-84e7-78a61665951a",
                        "children": ["b1fd84ea-fed8-4958-8aa8-f5f5ff30ab2b"],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b1fd84ea-fed8-4958-8aa8-f5f5ff30ab2b": {
                        "id": "b1fd84ea-fed8-4958-8aa8-f5f5ff30ab2b",
                        "type": "textViewer",
                        "parent": "17d9cb8a-0a9c-4e77-9925-1296837c036d",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\" Click to edit definition. \">تعريف&nbsp;٢</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "disableSelect": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHkklEQ…UimMUVUEABBRRQQAEF4hEwqMbjbCsKKKCAAgoooIACEQX+BauDQCER1z72AAAAAElFTkSuQmCC"
                        }
                    },
                    "47be2872-fc53-41c4-94c5-83ad4d0a358d": {
                        "id": "47be2872-fc53-41c4-94c5-83ad4d0a358d",
                        "type": "mtqMultiSubAnswer",
                        "parent": "895a76c3-31db-4b78-84e7-78a61665951a",
                        "children": ["7737a8ea-bf76-4983-a98d-3fd51341a9af", "1c5d2baa-20d5-4eda-ab30-943d071e4276"],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sortingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "canDeleteChildren": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "7737a8ea-bf76-4983-a98d-3fd51341a9af": {
                        "id": "7737a8ea-bf76-4983-a98d-3fd51341a9af",
                        "type": "mtqSubAnswer",
                        "parent": "47be2872-fc53-41c4-94c5-83ad4d0a358d",
                        "children": ["763cd510-4d0e-4f1c-8e6b-76b08310764c"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "763cd510-4d0e-4f1c-8e6b-76b08310764c": {
                        "id": "763cd510-4d0e-4f1c-8e6b-76b08310764c",
                        "type": "textViewer",
                        "parent": "7737a8ea-bf76-4983-a98d-3fd51341a9af",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٢.١</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAIv0lEQ…6CtEcAAQQQQAABBBCwEiB4WjFRhAACCCCAAAIIIOAq8A/KfBBaA6QWdAAAAABJRU5ErkJggg=="
                        }
                    },
                    "1c5d2baa-20d5-4eda-ab30-943d071e4276": {
                        "id": "1c5d2baa-20d5-4eda-ab30-943d071e4276",
                        "type": "mtqSubAnswer",
                        "parent": "47be2872-fc53-41c4-94c5-83ad4d0a358d",
                        "children": ["470ec454-bf4d-4a31-be90-a65468f256cf"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "470ec454-bf4d-4a31-be90-a65468f256cf": {
                        "id": "470ec454-bf4d-4a31-be90-a65468f256cf",
                        "type": "textViewer",
                        "parent": "1c5d2baa-20d5-4eda-ab30-943d071e4276",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة ٢.٢</div>",
                            "width": "100%",
                            "disableDelete": true,
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAI80lEQ…wqSHsEEEAAAQQQQAABKwGCpxUTRQgggAACCCCAAAJBBf4B+ss2WgX8+igAAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "2ae6f877-ee4c-40d2-8010-828761d5112d": {
                        "id": "2ae6f877-ee4c-40d2-8010-828761d5112d",
                        "type": "progress",
                        "parent": "b78f74d8-507a-4b26-a476-90c57a1a3e34",
                        "children": ["a5071ee6-e0d8-4a1a-8d1b-e87bc33652c3", "d6dcaa74-8b76-4080-bd29-c5654a6b0cfd", "cfed7baa-2617-4f67-a1c0-c69882e12c05"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "1",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "local",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect", "partly_correct"],
                            "AdvancedFeedbacksToDisplay": ["all_correct", "all_incorrect", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong"],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "a5071ee6-e0d8-4a1a-8d1b-e87bc33652c3": {
                        "id": "a5071ee6-e0d8-4a1a-8d1b-e87bc33652c3",
                        "type": "hint",
                        "parent": "2ae6f877-ee4c-40d2-8010-828761d5112d",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "1"
                        }
                    },
                    "d6dcaa74-8b76-4080-bd29-c5654a6b0cfd": {
                        "id": "d6dcaa74-8b76-4080-bd29-c5654a6b0cfd",
                        "type": "feedback",
                        "parent": "2ae6f877-ee4c-40d2-8010-828761d5112d",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect", "partly_correct"],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "ea0e84f1-22b5-4e98-95f5-e064138213dc": {
                        "id": "ea0e84f1-22b5-4e98-95f5-e064138213dc",
                        "type": "sequencing",
                        "parent": "d49b0efe-7467-4252-aac0-66738c45b6c5",
                        "children": ["320b8e3f-e8cd-4a2b-ad9f-8f1c8a9d1565", "2f36e690-e1b7-49b5-aad0-84e7349d18be", "040afbdf-62aa-4bcf-8a31-61171fba6564"],
                        "data": {
                            "title": "New mtq sequencing editor",
                            "task_check_type": "auto",
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
                    "0058618c-bd88-4604-b6e2-18a9f4765d02": {
                        "id": "0058618c-bd88-4604-b6e2-18a9f4765d02",
                        "type": "instruction",
                        "parent": "ea0e84f1-22b5-4e98-95f5-e064138213dc",
                        "children": ["9ebcb1ce-5874-48af-9f3e-76e2a9edbb8a"],
                        "data": {
                            "title": "",
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
                    "9ebcb1ce-5874-48af-9f3e-76e2a9edbb8a": {
                        "id": "9ebcb1ce-5874-48af-9f3e-76e2a9edbb8a",
                        "type": "textViewer",
                        "parent": "0058618c-bd88-4604-b6e2-18a9f4765d02",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">رتِّب البنود في ترتيبها الصحيح.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true
                        }
                    },
                    "320b8e3f-e8cd-4a2b-ad9f-8f1c8a9d1565": {
                        "id": "320b8e3f-e8cd-4a2b-ad9f-8f1c8a9d1565",
                        "type": "question",
                        "parent": "ea0e84f1-22b5-4e98-95f5-e064138213dc",
                        "children": ["5fd27dc1-55b7-4c12-bb63-0cb163bd41f4"],
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
                    "5fd27dc1-55b7-4c12-bb63-0cb163bd41f4": {
                        "type": "textViewer",
                        "parent": "320b8e3f-e8cd-4a2b-ad9f-8f1c8a9d1565",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg=="
                        },
                        "id": "5fd27dc1-55b7-4c12-bb63-0cb163bd41f4"
                    },
                    "2f36e690-e1b7-49b5-aad0-84e7349d18be": {
                        "id": "2f36e690-e1b7-49b5-aad0-84e7349d18be",
                        "type": "sequencingAnswer",
                        "parent": "ea0e84f1-22b5-4e98-95f5-e064138213dc",
                        "children": ["510a19cd-8241-4abf-ae06-06e92c82ebcd"],
                        "data": {
                            "title": "sequencingAnswer",
                            "useBank": false,
                            "placeHolder": false,
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "510a19cd-8241-4abf-ae06-06e92c82ebcd": {
                        "id": "510a19cd-8241-4abf-ae06-06e92c82ebcd",
                        "type": "mtqArea",
                        "parent": "2f36e690-e1b7-49b5-aad0-84e7349d18be",
                        "children": ["92fa9808-e9bb-4902-9ab3-46164343da1f"],
                        "data": {
                            "title": "MtqArea",
                            "useBank": false,
                            "mtqAnswerType": "sequencingAnswer",
                            "hasMultiSubAnswers": true,
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "definitionType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "92fa9808-e9bb-4902-9ab3-46164343da1f": {
                        "id": "92fa9808-e9bb-4902-9ab3-46164343da1f",
                        "type": "mtqSubQuestion",
                        "parent": "510a19cd-8241-4abf-ae06-06e92c82ebcd",
                        "children": ["99defd64-9305-41aa-beab-9a35e7a69d07", "9abc7103-11dd-432b-9fe8-482eef7095c5", "97247136-2bfc-48cf-ac32-0f9b31290248"],
                        "data": {
                            "title": "mtqSubQuestion",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "99defd64-9305-41aa-beab-9a35e7a69d07": {
                        "id": "99defd64-9305-41aa-beab-9a35e7a69d07",
                        "type": "definition",
                        "parent": "92fa9808-e9bb-4902-9ab3-46164343da1f",
                        "children": ["bff23563-8f2f-472c-aa7e-cc7927d5ef18"],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "bff23563-8f2f-472c-aa7e-cc7927d5ef18": {
                        "id": "bff23563-8f2f-472c-aa7e-cc7927d5ef18",
                        "type": "textViewer",
                        "parent": "99defd64-9305-41aa-beab-9a35e7a69d07",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\" Click to edit definition. \">تعريف&nbsp;١</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHXUlEQ…SzuQIKKKCAAgoooEAyAgbVZJwdRQEFFFBAAQUUUCCmwL9npjAh3lqG4wAAAABJRU5ErkJggg=="
                        }
                    },
                    "9abc7103-11dd-432b-9fe8-482eef7095c5": {
                        "id": "9abc7103-11dd-432b-9fe8-482eef7095c5",
                        "type": "mtqMultiSubAnswer",
                        "parent": "92fa9808-e9bb-4902-9ab3-46164343da1f",
                        "children": ["9c026993-cb76-42d2-b26d-0fb903bd7af8", "b0f6a543-b2e1-4f62-9a6e-5bc168bb652b", "796c0012-9bd9-42a1-a51e-9a80497f5942"],
                        "data": {
                            "title": "mtqMultiSubAnswer",
                            "mtqAnswerType": "sequencingAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "answerType": "textViewer",
                            "canDeleteChildren": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "9c026993-cb76-42d2-b26d-0fb903bd7af8": {
                        "id": "9c026993-cb76-42d2-b26d-0fb903bd7af8",
                        "type": "mtqSubAnswer",
                        "parent": "9abc7103-11dd-432b-9fe8-482eef7095c5",
                        "children": ["9601032d-92e1-47e3-93ec-3b1c7e0a9d09"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "9601032d-92e1-47e3-93ec-3b1c7e0a9d09": {
                        "id": "9601032d-92e1-47e3-93ec-3b1c7e0a9d09",
                        "type": "textViewer",
                        "parent": "9c026993-cb76-42d2-b26d-0fb903bd7af8",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;١</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAH+ElEQ…B0FaQ9AggggAACCCCAgJUAwdOKiSIEEEAAAQQQQAABV4F/Af+Hm0tvnsh1AAAAAElFTkSuQmCC"
                        }
                    },
                    "b0f6a543-b2e1-4f62-9a6e-5bc168bb652b": {
                        "id": "b0f6a543-b2e1-4f62-9a6e-5bc168bb652b",
                        "type": "mtqSubAnswer",
                        "parent": "9abc7103-11dd-432b-9fe8-482eef7095c5",
                        "children": ["b2ccbdb6-b155-440a-9ba3-c48db2ed14fa"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "b2ccbdb6-b155-440a-9ba3-c48db2ed14fa": {
                        "id": "b2ccbdb6-b155-440a-9ba3-c48db2ed14fa",
                        "type": "textViewer",
                        "parent": "b0f6a543-b2e1-4f62-9a6e-5bc168bb652b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٢</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAIHElEQ…A8XQXpRwABBBBAAAEEELASIHhaMVGEAAIIIIAAAggg4CrwPy/lwUtCrbuyAAAAAElFTkSuQmCC"
                        }
                    },
                    "796c0012-9bd9-42a1-a51e-9a80497f5942": {
                        "id": "796c0012-9bd9-42a1-a51e-9a80497f5942",
                        "type": "mtqSubAnswer",
                        "parent": "9abc7103-11dd-432b-9fe8-482eef7095c5",
                        "children": ["5791755a-3f85-453a-8466-2d24a607dd5f"],
                        "data": {
                            "title": "mtqSubAnswer",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5791755a-3f85-453a-8466-2d24a607dd5f": {
                        "id": "5791755a-3f85-453a-8466-2d24a607dd5f",
                        "type": "textViewer",
                        "parent": "796c0012-9bd9-42a1-a51e-9a80497f5942",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"normal\">الإجابة&nbsp;٣</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAAsCAYAAADM67jEAAAIQklEQ…j6CtKPAAIIIIAAAgggYCVA8LRioggBBBBAAAEEEEDAV+AfNofXS+8fWxoAAAAASUVORK5CYII="
                        }
                    },
                    "97247136-2bfc-48cf-ac32-0f9b31290248": {
                        "id": "97247136-2bfc-48cf-ac32-0f9b31290248",
                        "type": "definition",
                        "parent": "92fa9808-e9bb-4902-9ab3-46164343da1f",
                        "children": ["85f6f1ac-3588-4d66-b1a0-f9444def31c2"],
                        "data": {
                            "title": "definition",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "85f6f1ac-3588-4d66-b1a0-f9444def31c2": {
                        "id": "85f6f1ac-3588-4d66-b1a0-f9444def31c2",
                        "type": "textViewer",
                        "parent": "97247136-2bfc-48cf-ac32-0f9b31290248",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs definition\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: auto;\" contenteditable=\"false\" customstyle=\"definition\" data-placeholder=\" Click to edit definition. \">تعريف&nbsp;٢</div>",
                            "styleOverride": "definition",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mode": "singleStyle",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "data-placeholder": " Click to edit definition. ",
                            "showNarrationType": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHkklEQ…UimMUVUEABBRRQQAEF4hEwqMbjbCsKKKCAAgoooIACEQX+BauDQCER1z72AAAAAElFTkSuQmCC"
                        }
                    },
                    "040afbdf-62aa-4bcf-8a31-61171fba6564": {
                        "id": "040afbdf-62aa-4bcf-8a31-61171fba6564",
                        "type": "progress",
                        "parent": "ea0e84f1-22b5-4e98-95f5-e064138213dc",
                        "children": ["5c1ba1d5-8fee-49ff-a907-fcec5670e562", "d1fee918-16e4-4d1c-8ee8-27e8d33278cd", "0058618c-bd88-4604-b6e2-18a9f4765d02"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "score": 1,
                            "on_attempt": 1,
                            "feedback_type": "local",
                            "button_label": "Check",
                            "disableDelete": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect", "partly_correct"],
                            "AdvancedFeedbacksToDisplay": ["all_correct", "all_incorrect", "missing_item", "partly_correct_missing_item", "partly_correct_more_80", "partly_correct_less_80", "all_correct_and_wrong"],
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "5c1ba1d5-8fee-49ff-a907-fcec5670e562": {
                        "id": "5c1ba1d5-8fee-49ff-a907-fcec5670e562",
                        "type": "hint",
                        "parent": "040afbdf-62aa-4bcf-8a31-61171fba6564",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "attemptNum": 1,
                            "maxAttempts": "2"
                        }
                    },
                    "d1fee918-16e4-4d1c-8ee8-27e8d33278cd": {
                        "id": "d1fee918-16e4-4d1c-8ee8-27e8d33278cd",
                        "type": "feedback",
                        "parent": "040afbdf-62aa-4bcf-8a31-61171fba6564",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": ["all_correct", "all_incorrect", "partly_correct"],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    }
                }
            },
            'cloze': {
                "id": "73c9858a-a5d3-4cc3-9f56-252af077ca89",
                "data": {
                    "0": {
                        "type": "textViewer",
                        "data": {
                            "title": "إملأ",
                            "textEditorStyle": "texteditor cgs",
                            "styleOverride": ""
                        },
                        "id": 0,
                        "parent": "d95bf39f-cba0-4153-9995-b9a339e051c1"
                    },
                    "1": {
                        "type": "textViewer",
                        "data": {
                            "title": "الكلمات",
                            "textEditorStyle": "texteditor cgs",
                            "styleOverride": ""
                        },
                        "id": 1,
                        "parent": "09d616ee-969f-4326-bfbe-5998bea312bf"
                    },
                    "73c9858a-a5d3-4cc3-9f56-252af077ca89": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["108e4a2a-5e80-411e-a7ef-1764dd8136e6"],
                        "data": {
                            "title": "fill in the gaps",
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
                        "id": "73c9858a-a5d3-4cc3-9f56-252af077ca89",
                        "is_modified": false,
                        "convertedData": "<sequence type=\"simple\" id=\"73c9858a-a5d3-4cc3-9f56-252af077ca89\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<task exposureid=\"0\" type=\"cloze\" id=\"108e4a2a-5e80-411e-a7ef-1764dd8136e6\" check_type=\"auto\" sha1=\"7079d8df8423139f1bc2318b1b4cc34bfdf11056\">\n        <mode>dragAndDisable</mode>\n    \n\n    \n<question id=\"a5a6924e-c6b3-43f6-84db-654d68fb6809\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"63d62621-f776-499e-b314-2b056925e652\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"true\">\n\t\n<clozearea>\n\t<cloze>\n\t\t<p><span class=\"normal\">  <subanswer answerid=\"answerfield_5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4_2\" originalid=\"0\">\n\n                <casesensitive>false</casesensitive>\n                <punctuationmarks>false</punctuationmarks>\n                <correct>\n\t\t\t\t\t<ans_option widthem=\"\">0</ans_option>\n                </correct>\n\n                <partiallycorrect>\n                </partiallycorrect>\n\n                <incorrectpredicted>\n                </incorrectpredicted>\n\n\n\n</subanswer> مكان <subanswer answerid=\"answerfield_5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4_1\" originalid=\"1\">\n\n                <casesensitive>false</casesensitive>\n                <punctuationmarks>false</punctuationmarks>\n                <correct>\n\t\t\t\t\t<ans_option widthem=\"\">1</ans_option>\n                </correct>\n\n                <partiallycorrect>\n                </partiallycorrect>\n\n                <incorrectpredicted>\n                </incorrectpredicted>\n\n\n\n</subanswer> الفارغة</span></p>\n\t</cloze>\n</clozearea>\n<bank>\n\n<subanswer answerid=\"26ed4f21-8a3d-45ac-bac8-8fe9946ce4ff\" originalid=\"\">\n\t\n\n\t<textviewer id=\"26ed4f21-8a3d-45ac-bac8-8fe9946ce4ff\">\n\t    <paragraph><span class=\"normal\">اختيار من بنك الأسئلة</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n</subanswer>\n\n<subanswer answerid=\"0\" originalid=\"\">\n\t\n\n\t<textviewer id=\"0\">\n\t    <paragraph><span class=\"normal\">إملأ</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n</subanswer>\n\n<subanswer answerid=\"1\" originalid=\"\">\n\t\n\n\t<textviewer id=\"1\">\n\t    <paragraph><span class=\"normal\">الكلمات</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n\n</subanswer>\n\n</bank>\n\n</answer>\n<progress id=\"8ab51ecd-1441-4c48-9bd2-e3d6ffbfd2e3\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t<points>1</points>\n\t<attempts>2</attempts>\n\t<checkable>true</checkable>\n    \n\n<feedback>\n</feedback>\n<specificfeedback>\n</specificfeedback>\n\n</progress>\n\n</task>\n</sequence>",
                        "isCourse": false
                    },
                    "108e4a2a-5e80-411e-a7ef-1764dd8136e6": {
                        "id": "108e4a2a-5e80-411e-a7ef-1764dd8136e6",
                        "type": "cloze",
                        "parent": "73c9858a-a5d3-4cc3-9f56-252af077ca89",
                        "children": ["a5a6924e-c6b3-43f6-84db-654d68fb6809", "ebaae195-e4fe-4f9f-ac99-9aa20253998b", "8ab51ecd-1441-4c48-9bd2-e3d6ffbfd2e3"],
                        "data": {
                            "title": "Fill in the gaps",
                            "task_check_type": "auto",
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
                    "09b49cf3-ffad-413a-8d55-cb639f30f808": {
                        "id": "09b49cf3-ffad-413a-8d55-cb639f30f808",
                        "type": "instruction",
                        "parent": "108e4a2a-5e80-411e-a7ef-1764dd8136e6",
                        "children": ["aa292fef-2160-4221-a04b-4129a1f0a0ca"],
                        "data": {
                            "title": "",
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
                    "aa292fef-2160-4221-a04b-4129a1f0a0ca": {
                        "id": "aa292fef-2160-4221-a04b-4129a1f0a0ca",
                        "type": "textViewer",
                        "parent": "09b49cf3-ffad-413a-8d55-cb639f30f808",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">أكمل إجاباتك في جميع المساحات الفارغة.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true
                        }
                    },
                    "a5a6924e-c6b3-43f6-84db-654d68fb6809": {
                        "id": "a5a6924e-c6b3-43f6-84db-654d68fb6809",
                        "type": "question",
                        "parent": "108e4a2a-5e80-411e-a7ef-1764dd8136e6",
                        "children": ["63d62621-f776-499e-b314-2b056925e652"],
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
                    "63d62621-f776-499e-b314-2b056925e652": {
                        "type": "textViewer",
                        "parent": "a5a6924e-c6b3-43f6-84db-654d68fb6809",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg=="
                        },
                        "id": "63d62621-f776-499e-b314-2b056925e652"
                    },
                    "ebaae195-e4fe-4f9f-ac99-9aa20253998b": {
                        "id": "ebaae195-e4fe-4f9f-ac99-9aa20253998b",
                        "type": "cloze_answer",
                        "parent": "108e4a2a-5e80-411e-a7ef-1764dd8136e6",
                        "children": ["5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4", "0a135020-77d1-481c-82eb-9908160e985c"],
                        "data": {
                            "title": "Answer",
                            "interaction": "dd",
                            "answerType": "cloze_text_viewer",
                            "fieldsNum": "multiple",
                            "fieldsWidth": "longest",
                            "maxHeight": "firstLevel",
                            "disableDelete": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "useBank": true,
                            "className": "drag-drop-cloze"
                        }
                    },
                    "5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4": {
                        "id": "5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4",
                        "type": "cloze_text_viewer",
                        "parent": "ebaae195-e4fe-4f9f-ac99-9aa20253998b",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">&nbsp;&nbsp;<answerfield class=\"AnswerField\" type=\"text\" contenteditable=\"false\" style=\"-webkit-user-select: none;\"><span class=\"answerfieldSpan\" id=\"answerfield_5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4_2\" type=\"text\" contenteditable=\"true\" style=\"-webkit-user-select: initial;\">إملأ</span><div contenteditable=\"false\" class=\"x-button\" style=\"-webkit-user-select: none;\">x</div></answerfield> مكان <answerfield class=\"AnswerField\" type=\"text\" contenteditable=\"false\" style=\"-webkit-user-select: none;\"><span class=\"answerfieldSpan\" id=\"answerfield_5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4_1\" type=\"text\" contenteditable=\"true\" style=\"-webkit-user-select: initial;\">الكلمات</span><div contenteditable=\"false\" class=\"x-button\" style=\"-webkit-user-select: none;\">x</div></answerfield> الفارغة</div>",
                            "disableDelete": true,
                            "stageReadOnlyMode": false,
                            "width": "100%",
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true,
                            "answerFields": {
                                "answerfield_5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4_1": {
                                    "type": "text"
                                },
                                "answerfield_5ee2a3e5-5a8e-4a2a-b37a-deb6ab365ec4_2": {
                                    "type": "text"
                                }
                            },
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABMoAAAAkCAYAAAB48tbYAAAUeklEQ…Xp+mYUlwiIgAiIgAiIgAiIgAiIgAiIgAiIgAiIQEoJ/A8NbjWsfxAshwAAAABJRU5ErkJggg==",
                            "type": "text",
                            "noCheckingType": true,
                            "noAdditionalCorrectAnswers": true,
                            "noPartiallyCorrectAnswers": true,
                            "noExpectedWrong": true
                        }
                    },
                    "0a135020-77d1-481c-82eb-9908160e985c": {
                        "type": "clozeBank",
                        "parent": "ebaae195-e4fe-4f9f-ac99-9aa20253998b",
                        "children": ["f97cdcac-1afb-4529-868d-a4896855be24", "d95bf39f-cba0-4153-9995-b9a339e051c1", "09d616ee-969f-4326-bfbe-5998bea312bf"],
                        "data": {
                            "title": "clozeBank",
                            "disableDelete": true,
                            "width": "100%",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "0a135020-77d1-481c-82eb-9908160e985c"
                    },
                    "26ed4f21-8a3d-45ac-bac8-8fe9946ce4ff": {
                        "type": "textViewer",
                        "parent": "f97cdcac-1afb-4529-868d-a4896855be24",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">اختيار من بنك الأسئلة</div>",
                            "disableDelete": false,
                            "showNarrationType": true,
                            "styleOverride": "normal",
                            "textEditorStyle": "texteditor cgs",
                            "mode": "bankStyle",
                            "width": "50%",
                            "mathfieldArray": {},
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVUAAAAjCAYAAAAkAJlGAAANZElEQ…chYAjkHAJGqjnXpdYgQ8AQqE4EjFSrE33TbQgYAjmHwP8AhUOsjam/m38AAAAASUVORK5CYII=",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        },
                        "id": "26ed4f21-8a3d-45ac-bac8-8fe9946ce4ff"
                    },
                    "8ab51ecd-1441-4c48-9bd2-e3d6ffbfd2e3": {
                        "id": "8ab51ecd-1441-4c48-9bd2-e3d6ffbfd2e3",
                        "type": "advancedProgress",
                        "parent": "108e4a2a-5e80-411e-a7ef-1764dd8136e6",
                        "children": ["aaaff25b-500b-4a65-b18f-9b4015fd7e51", "c264c6b3-ce58-4570-9efa-c29676a7d0f2", "09b49cf3-ffad-413a-8d55-cb639f30f808"],
                        "data": {
                            "title": "Progress",
                            "num_of_attempts": "2",
                            "show_hint": false,
                            "hint_timing": "1",
                            "feedback_type": "local",
                            "checking_enabled": true,
                            "score": 1,
                            "button_label": "Continue",
                            "disableDelete": true,
                            "feedbacksToDisplay": {
                                "with_bank": ["all_correct", "all_incorrect", "partly_correct"],
                                "no_bank": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "AdvancedFeedbacksToDisplay": {
                                "with_bank": ["all_correct", "all_incorrect", "partly_correct"],
                                "no_bank": ["all_correct", "all_incorrect", "partly_correct"]
                            },
                            "availbleProgressTypes": [{
                                "name": "Local",
                                "value": "local"
                            }, {
                                "name": "Basic",
                                "value": "generic"
                            }, {
                                "name": "Advanced",
                                "value": "advanced"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "aaaff25b-500b-4a65-b18f-9b4015fd7e51": {
                        "id": "aaaff25b-500b-4a65-b18f-9b4015fd7e51",
                        "type": "hint",
                        "parent": "8ab51ecd-1441-4c48-9bd2-e3d6ffbfd2e3",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true,
                            "maxAttempts": "2"
                        }
                    },
                    "c264c6b3-ce58-4570-9efa-c29676a7d0f2": {
                        "id": "c264c6b3-ce58-4570-9efa-c29676a7d0f2",
                        "type": "feedback",
                        "parent": "8ab51ecd-1441-4c48-9bd2-e3d6ffbfd2e3",
                        "children": [],
                        "data": {
                            "title": "Feedback",
                            "show_partly_correct": true,
                            "feedbacksToDisplay": [],
                            "taskType": "with_bank",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "feedbacks_map": {},
                            "feedbacks_map_specific": {}
                        }
                    },
                    "f97cdcac-1afb-4529-868d-a4896855be24": {
                        "children": ["26ed4f21-8a3d-45ac-bac8-8fe9946ce4ff"],
                        "data": {
                            "subItemId": "26ed4f21-8a3d-45ac-bac8-8fe9946ce4ff"
                        },
                        "id": "f97cdcac-1afb-4529-868d-a4896855be24",
                        "parent": "0a135020-77d1-481c-82eb-9908160e985c",
                        "type": "clozeBankSubItem"
                    },
                    "d95bf39f-cba0-4153-9995-b9a339e051c1": {
                        "children": [0],
                        "data": {
                            "subItemId": 0
                        },
                        "id": "d95bf39f-cba0-4153-9995-b9a339e051c1",
                        "parent": "0a135020-77d1-481c-82eb-9908160e985c",
                        "type": "clozeBankSubItem"
                    },
                    "09d616ee-969f-4326-bfbe-5998bea312bf": {
                        "children": [1],
                        "data": {
                            "subItemId": 1
                        },
                        "id": "09d616ee-969f-4326-bfbe-5998bea312bf",
                        "parent": "0a135020-77d1-481c-82eb-9908160e985c",
                        "type": "clozeBankSubItem"
                    }
                }
            },
            'open_question': {
                "id": "b2a4f47a-dd3a-45d1-8511-862a7ddb64d4",
                "data": {
                    "b2a4f47a-dd3a-45d1-8511-862a7ddb64d4": {
                        "type": "sequence",
                        "parent": "ec289487-3916-4eee-9285-8fb1c2b413d1",
                        "children": ["426d7a50-6bf1-439a-ad92-869d8f688f85"],
                        "data": {
                            "title": "free writing",
                            "type": "simple",
                            "exposure": "one_by_one",
                            "sharedBefore": false,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": [],
                                "bubbleUp": true
                            },
                            "selectedStandards": []
                        },
                        "id": "b2a4f47a-dd3a-45d1-8511-862a7ddb64d4",
                        "is_modified": false,
                        "convertedData": "<sequence type=\"simple\" id=\"b2a4f47a-dd3a-45d1-8511-862a7ddb64d4\" cgsversion=\"7.0.28.63\">\n\t\n\n    \n<task exposureid=\"0\" type=\"opq\" id=\"426d7a50-6bf1-439a-ad92-869d8f688f85\" check_type=\"manual\" sha1=\"2ff2fb058bec57379be5c5b56204991d0765030e\">\n    \n\n    \n<question id=\"1018da55-e26a-4290-871e-852271e37b53\" auto_tag=\"auto_tag\">\n\t\n\n\t<textviewer id=\"1be8c77a-4397-441a-b2c6-f82d5f2e59a3\">\n\t    <paragraph><span class=\"normal\">السؤال</span></paragraph>\n\n\n\t    \n\t</textviewer>\n\n\n</question>\n<answer checkable=\"\">\n\t\n<subanswer>\n\t<texteditor mode=\"paragraph\" style=\"style1\" enabletoolbar=\"true\" toolbarpreset=\"studentMath\" maxchar=\"150\">\n\t</texteditor>\n</subanswer>\n</answer>\n<progress id=\"daad58c9-6fe8-4fc6-84e8-3924ed6adc40\">\n\t<ignorechecking>\n\t</ignorechecking>\n\t\n\t<attempts></attempts>\n\t<checkable>true</checkable>\n    \n\n\n</progress>\n\n</task>\n</sequence>",
                        "isCourse": false
                    },
                    "426d7a50-6bf1-439a-ad92-869d8f688f85": {
                        "id": "426d7a50-6bf1-439a-ad92-869d8f688f85",
                        "type": "FreeWriting",
                        "parent": "b2a4f47a-dd3a-45d1-8511-862a7ddb64d4",
                        "children": ["1018da55-e26a-4290-871e-852271e37b53", "d91e2a98-93bc-4c14-bc34-61f501330a9f", "daad58c9-6fe8-4fc6-84e8-3924ed6adc40"],
                        "data": {
                            "title": "New Free Writing",
                            "task_check_type": "manual",
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
                    "0d819a95-af47-4cd1-afaf-c091b5d5f8b2": {
                        "id": "0d819a95-af47-4cd1-afaf-c091b5d5f8b2",
                        "type": "instruction",
                        "parent": "426d7a50-6bf1-439a-ad92-869d8f688f85",
                        "children": ["512fe3f3-d9d2-4342-a0d7-cea5a75cf739"],
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
                    "512fe3f3-d9d2-4342-a0d7-cea5a75cf739": {
                        "id": "512fe3f3-d9d2-4342-a0d7-cea5a75cf739",
                        "type": "textViewer",
                        "parent": "0d819a95-af47-4cd1-afaf-c091b5d5f8b2",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customstyle=\"instruction\">اكتب إجابتك.</div>",
                            "styleOverride": "instruction",
                            "disableDelete": true,
                            "stageReadOnlyMode": true,
                            "mathfieldArray": {},
                            "textEditorStyle": "texteditor cgs",
                            "showNarrationType": true
                        }
                    },
                    "1018da55-e26a-4290-871e-852271e37b53": {
                        "id": "1018da55-e26a-4290-871e-852271e37b53",
                        "type": "question",
                        "parent": "426d7a50-6bf1-439a-ad92-869d8f688f85",
                        "children": ["1be8c77a-4397-441a-b2c6-f82d5f2e59a3"],
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
                    "1be8c77a-4397-441a-b2c6-f82d5f2e59a3": {
                        "type": "textViewer",
                        "parent": "1018da55-e26a-4290-871e-852271e37b53",
                        "children": [],
                        "data": {
                            "title": "<div class=\"cgs normal\" style=\"width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;\" contenteditable=\"false\" customstyle=\"normal\">السؤال</div>",
                            "showNarrationType": true,
                            "textEditorStyle": "texteditor cgs",
                            "width": "100%",
                            "mathfieldArray": {},
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "tvPlaceholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqoAAAAjCAYAAABcpShTAAAHUUlEQ…XbYgoooIACCiiggAJRBQyqUaUcp4ACCiiggAIKKBCrwP+L+n50B8PREQAAAABJRU5ErkJggg=="
                        },
                        "id": "1be8c77a-4397-441a-b2c6-f82d5f2e59a3"
                    },
                    "d91e2a98-93bc-4c14-bc34-61f501330a9f": {
                        "id": "d91e2a98-93bc-4c14-bc34-61f501330a9f",
                        "type": "FreeWritingAnswer",
                        "parent": "426d7a50-6bf1-439a-ad92-869d8f688f85",
                        "children": ["f72e5bde-b009-46ba-8f07-224dcd22120e"],
                        "data": {
                            "title": "Free Writing Answer",
                            "disableDelete": true,
                            "has_questions": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "f72e5bde-b009-46ba-8f07-224dcd22120e": {
                        "id": "f72e5bde-b009-46ba-8f07-224dcd22120e",
                        "type": "textEditor",
                        "parent": "d91e2a98-93bc-4c14-bc34-61f501330a9f",
                        "children": [],
                        "data": {
                            "title": "Free Writing Answer TextViewer",
                            "disableDelete": true,
                            "answer_size": "Paragraph",
                            "MaxChars": "150",
                            "ShowToolbar": true,
                            "allowedSizes": [{
                                "value": "Line",
                                "text": "Line"
                            }, {
                                "value": "Paragraph",
                                "text": "Paragraph"
                            }, {
                                "value": "FullText",
                                "text": "Full Text"
                            }],
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "daad58c9-6fe8-4fc6-84e8-3924ed6adc40": {
                        "id": "daad58c9-6fe8-4fc6-84e8-3924ed6adc40",
                        "type": "progress",
                        "parent": "426d7a50-6bf1-439a-ad92-869d8f688f85",
                        "children": ["e59428e3-6b0e-4ae9-aa50-a83e3a3cc047", "0d819a95-af47-4cd1-afaf-c091b5d5f8b2"],
                        "data": {
                            "ignore_defaults": "true",
                            "title": "Progress",
                            "show_hint": false,
                            "button_label": "Continue",
                            "feedback_type": "none",
                            "disableDelete": true,
                            "hint_timing": 1,
                            "showOnlyAlways": true,
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            }
                        }
                    },
                    "e59428e3-6b0e-4ae9-aa50-a83e3a3cc047": {
                        "id": "e59428e3-6b0e-4ae9-aa50-a83e3a3cc047",
                        "type": "hint",
                        "parent": "daad58c9-6fe8-4fc6-84e8-3924ed6adc40",
                        "children": [],
                        "data": {
                            "title": "Hint",
                            "isValid": true,
                            "invalidMessage": {
                                "valid": true,
                                "report": []
                            },
                            "show_hint": false,
                            "first": true,
                            "mid": true,
                            "last": true
                        }
                    }
                }
            }
        }
    }

});