define({
    "basicTemplate": {
        "definitionChildIndex": 1,
        "answerChildIndex": 2,
        "template":  '[\
            {   "id":"{{id1}}",\
                "type": "linking_pair",\
                "parent": "{{parentId}}",\
                "children": ["{{id2}}", "{{id3}}"],\
                "data": {"definitionTypeId": "{{id2}}", "answerTypeId": "{{id3}}", "disableDelete": false, "oneToManyMode" : false}\
            }, \
            {   "id":"{{id2}}",\
                "type": "{{definitionType}}",\
                "parent": "{{id1}}",\
                "children": [],\
                "data": {"title": "", "disableDelete":true, "width":"99%", "isValid": false}\
            }, \
            {   "id":"{{id3}}",\
                "type": "{{answerType}}",\
                "parent": "{{id1}}",\
                "children": [],\
                "data": {"title": "", "disableDelete":true, "width":"99%", "isValid": false}\
            }]'
    },
    "multiTemplate":{
        "definitionChildIndex": 1,
        "answerChildIndex": 4,
        "template": '[\
            {   "id":"{{id1}}",\
                "type": "linking_pair",\
                "parent": "{{parentId}}",\
                "children": ["{{id2}}", "{{id3}}"],\
                "data": {"definitionTypeId": "{{id2}}", "answerTypeId": "{{id3}}", "disableDelete": false, "oneToManyMode" : true}\
            }, \
            {   "id":"{{id2}}",\
                "type": "{{definitionType}}",\
                "parent": "{{id1}}",\
                "children": [],\
                "data": {"title": "", "disableDelete":true, "width":"99%", "isValid": false}\
            }, \
            {   "id":"{{id3}}",\
                "type":"mtqMultiSubAnswer",\
                "parent":"{{id1}}",\
                "children": ["{{id4}}"],\
                "data": {"title": "mtqMultiSubAnswer", "mtqAnswerType": "sortingAnswer", "disableDelete":true, "width":"100%", "answerType":"{{answerType}}", "linkingMode":true}\
            },\
            {   "id":"{{id4}}",\
                "type": "linkingSubAnswer",\
                "parent": "{{id3}}",\
                "children": ["{{id5}}"],\
                "data": {"title": "LinkingSubAnswer", "disableDelete":true, "width":"100%"}\
            },\
            {   "id":"{{id5}}",\
                "type": "{{answerType}}",\
                "parent": "{{id4}}",\
                "children": [],\
                "data": {"title": "", "disableDelete":true, "width":"99%", "isValid": false}\
            }]'
    }
});