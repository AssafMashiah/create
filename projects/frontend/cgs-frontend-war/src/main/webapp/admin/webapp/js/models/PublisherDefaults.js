define(['consts'], function (consts) {
    var _defaults = {
        "_class": "com.mongodb.BasicDBObject",
        "name": "New Account",
        "contentLocales": {
            "options": [
                "en_US",
                "fr_FR",
                "iw_IL",
                "nl_NL",
                "pt_BR",
                "ar_IL",
                "zn_CN",
                "zn_HK",
                "ko_KR"
            ],
            "selected": ""
        },
        "accountMode": "TRIAL",
        "interfaceLocales": {
            'options': ['en_US', 'fr_FR', 'pt_BR', 'zn_CN', 'zn_HK', 'ko_KR'],
            'selected': 'en_US'
        },
        "sequenceExposureDefault": {
            'options': ['one_by_one', 'all_exposed'],
            'selected': 'one_by_one'
        },
        "customMetadata": [],
        "customMetadataPackages": [],
        "customization": {
            "isSecured": false,
            "enableHiddenLessons": false,
            "enableCoachMarks": false,
            "enableHints": false,
            "enableQuiz": false,
            "enableLearningObjects": false,
            "enableStandards": false,
            "enableReferences": false,
            "enableCourseMiscSettings": false,
            "enableReviewTab": false,
            "enableTextToSpeach": false,
            "enableNarrationAdditionalLanguages": false,
            "enableAssetOrdering": false,
            "enableDiffLevels": false,
            "enableAssessment" : true,
            "enableBookAlive" : true,
            "enableBornDigital" : true,
            "enableLivePage": false,
            "enablePdf2t2k": false,
            "enableFullSpellChecker": false,
            "enableMediaEncoding": false,
            "logLevel": consts.logLevels.DEBUG,
	        "pdfConversionLibrary":"IDR",
			"enablePdfConversionLibrarySelection": true,
	        "enableDemoPublishView":false,
            "enableSampleCourse": false,
            "enableEpubConversion":false,
            "ePubConversionConfDelay": 10,
            "enableIndependentAssessment": false,
            "enablePlacementAssessment": false,
            "customIconsPacks": [],
            "publishSettings": {
                "courses": {
                    "enablePublishToFile": true,
                    "enablePublishToCatalog": true,
                    "enablePublishToUrl": true
                },
                "lessons": {
                    "enablePublishToFile": true,
                    "enablePublishToCatalog": false,
                    "enableCourseLevelsCustomizationForScorm": false,
                    "enablePublishToUrl": true
                },
				publishPlayServerUrl: 'http://play.timetoknow.com/play/',
				publishUploadServerUrl: 'http://play.timetoknow.com/upload/'
            }
        },
        "gradeLevels": [
            {
                'locale': 'en_US',
                'value': [
                    {"id": "First"},
                    {"id": "Second"},
                    {"id": "Third"},
                    {"id": "Fourth"},
                    {"id": "Fifth"},
                    {"id": "Sixth"},
                    {"id": "Seventh"},
                    {"id": "Eighth"},
                    {"id": "Ninth"},
                    {"id": "Tenth"},
                    {"id": "Eleventh"}
                ]
            },
            {
                'locale': 'fr_FR',
                'value': [
                    {"id": "CM1"},
                    {"id": "CM2"},
                    {"id": "6ème"},
                    {"id": "5ème"},
                    {"id": "4ème"},
                    {"id": "3ème"},
                    {"id": "2nde"},
                    {"id": "Première ES"},
                    {"id": "Première L"},
                    {"id": "Première S"},
                    {"id": "Première ST2S"},
                    {"id": "Première STL / STI2D / STI2A"},
                    {"id": "Première STMG"},
                    {"id": "Terminale ES"},
                    {"id": "Terminale L"},
                    {"id": "Terminale S"},
                    {"id": "Terminales S - AP Approfondissement"},
                    {"id": "Terminales S - AP Soutien"},
                    {"id": "Terminale ST2S"},
                    {"id": "Terminale STMG"},
                    {"id": "Terminale STI2D"},
                    {"id": "Terminale STL"}
                ]
            },
            {
                'locale': 'iw_IL',
                'value': [
                    {"id": "כיתה א"},
                    {"id": "כיתה ב"},
                    {"id": "כיתה ג"},
                    {"id": "כיתה ד"},
                    {"id": "כיתה ה"},
                    {"id": "כיתה ו"},
                    {"id": "כיתה ז"},
                    {"id": "כיתה ח"},
                    {"id": "כיתה ט"},
                    {"id": "כיתה י"},
                    {"id": "כיתה יא"},
                    {"id": "כיתה יב"}
                ]
            },
            {
                'locale': 'nl_NL',
                'value': [
                    {"id": "Groep 1"},
                    {"id": "Groep 2"},
                    {"id": "Groep 3"},
                    {"id": "Groep 4"},
                    {"id": "Groep 5"},
                    {"id": "Groep 6"},
                    {"id": "Groep 7"},
                    {"id": "Groep 8"},
                    {"id": "Klas 1"},
                    {"id": "Klas 2"},
                    {"id": "Klas 3"},
                    {"id": "Klas 4"},
                    {"id": "Klas 5"},
                    {"id": "Klas 6"}
                ]
            },
            {
                'locale': 'pt_BR',
                'value': [
                    {"id": "Primeiro"},
                    {"id": "Segundo"},
                    {"id": "Terceiro"},
                    {"id": "Quarto"},
                    {"id": "Quinto"},
                    {"id": "Sexto"},
                    {"id": "Sétimo"},
                    {"id": "Oitavo"},
                    {"id": "Nono"},
                    {"id": "Décimo"},
                    {"id": "Décimo Primeiro"}
                ]
            },
            {
                'locale': 'ja_JP',
                'value': [
                    {"id": "First"},
                    {"id": "Second"},
                    {"id": "Third"},
                    {"id": "Fourth"},
                    {"id": "Fifth"},
                    {"id": "Sixth"},
                    {"id": "Seventh"},
                    {"id": "Eighth"},
                    {"id": "Ninth"},
                    {"id": "Tenth"},
                    {"id": "Eleventh"}
                ]
            },
            {
                'locale': 'zn_CN',
                'value': [
                    {"id": "第一"},
                    {"id": "第二"},
                    {"id": "第三"},
                    {"id": "第四"},
                    {"id": "第五"},
                    {"id": "第六"},
                    {"id": "第七"},
                    {"id": "第八"},
                    {"id": "第九"},
                    {"id": "第十"},
                    {"id": "第十一"}
                ]
            },
            {
                'locale': 'zn_HK',
                'value': [
                    {"id": "第一"},
                    {"id": "第二"},
                    {"id": "第三"},
                    {"id": "第四"},
                    {"id": "第五"},
                    {"id": "第六"},
                    {"id": "第七"},
                    {"id": "第八"},
                    {"id": "第九"},
                    {"id": "第十"},
                    {"id": "第十一"}
                ]
            },
            {
                'locale': 'ko_KR',
                'value': [
                    {"id": "첫번째"},
                    {"id": "두번째"},
                    {"id": "세번째"},
                    {"id": "네번째"},
                    {"id": "다섯번째"},
                    {"id": "여섯번째"},
                    {"id": "일곱번째"},
                    {"id": "여덟번째"},
                    {"id": "아홉번째"},
                    {"id": "열번째"},
                    {"id": "열한번째"}
                ]
            },
            {
                'locale': 'ar_IL',
                'value': []
            }
        ],
        "subjectAreas": [
            {
                'locale': 'en_US',
                'value': [
                    {"id": "Math"},
                    {"id": "Hebrew"},
                    {"id": "English"},
                    {"id": "LanguageArts"},
                    {"id": "ESL"},
                    {"id": "Science"},
                    {"id": "RoadSafety"},
                    {"id": "Reading"},
                    {"id": "Theology"}
                ]
            },
            {
                'locale': 'fr_FR',
                'value': [
                    {"id": "Français"},
                    {"id": "Mathématiques"},
                    {"id": "Géographie"},
                    {"id": "Histoire"},
                    {"id": "Histoire-Géographie"},
                    {"id": "Economie"},
                    {"id": "Physique-Chimie"}
                ]
            },
            {
                'locale': 'iw_IL',
                'value': [
                    {"id": "אזרחות"},
                    {"id": "ביולוגיה"},
                    {"id": "גאוגרפיה"},
                    {"id": "גיאומטריה"},
                    {"id": "היסטוריה"},
                    {"id": "הנדסה"},
                    {"id": "חינוך לשוני"},
                    {"id": "חשבון"},
                    {"id": "טבע"},
                    {"id": "כימיה"},
                    {"id": "לימודי ארץ-ישראל"},
                    {"id": "לימודי יהדות"},
                    {"id": "מדע וטכנולוגיה"},
                    {"id": "מדעים"},
                    {"id": "מתמטיקה"},
                    {"id": "ספרות"},
                    {"id": "פיזיקה"},
                    {"id": "תורה"},
                    {"id": "תנך"}
                ]
            },
            {
                'locale': 'nl_NL',
                'value': [
                    {"id": "Rekenen"},
                    {"id": "Taal"},
                    {"id": "spelling"},
                    {"id": "lezen"},
                    {"id": "Engels"},
                    {"id": "Wereldorientatie"},
                    {"id": "Aardrijkskunde"},
                    {"id": "Geschiedenis"},
                    {"id": "Biologie"},
                    {"id": "Godsdienst"}
                ]
            },
            {
                'locale': 'pt_BR',
                'value': [
                    {"id": "Matemática"},
                    {"id": "Hebraico"},
                    {"id": "Inglês"},
                    {"id": "Língua Portuguesa e Literatura"},
                    {"id": "Inglês como segunda língua"},
                    {"id": "Ciências"},
                    {"id": "Segurança Rodoviária"},
                    {"id": "Leitura"},
                    {"id": "Teologia"}
                ]
            },
            {
                'locale': 'ja_JP',
                'value': [
                    {"id": "Matemática"},
                    {"id": "Hebraico"},
                    {"id": "Inglês"},
                    {"id": "Língua Portuguesa e Literatura"},
                    {"id": "Inglês como segunda língua"},
                    {"id": "Ciências"},
                    {"id": "Segurança Rodoviária"},
                    {"id": "Leitura"},
                    {"id": "Teologia"}
                ]
            },
            {
                'locale': 'zn_CN',
                'value': [
                    {"id": "数学"},
                    {"id": "希伯来语"},
                    {"id": "英语"},
                    {"id": "语言艺术"},
                    {"id": "非母语英语课程ESL"},
                    {"id": "科学"},
                    {"id": "道路交通安全"},
                    {"id": "阅读"},
                    {"id": "神学"}
                ]
            },
            {
                'locale': 'zn_HK',
                'value': [
                    {"id": "數學"},
                    {"id": "希伯來語"},
                    {"id": "英語"},
                    {"id": "語言藝術"},
                    {"id": "非母語英語課程ESL"},
                    {"id": "科學"},
                    {"id": "道路交通安全"},
                    {"id": "閱讀"},
                    {"id": "神學"}
                ]
            },
            {
                'locale': 'ko_KR',
                'value': [
                    {"id": "수학"},
                    {"id": "히브리어"},
                    {"id": "영어"},
                    {"id": "언어"},
                    {"id": "과학"},
                    {"id": "과학"},
                    {"id": "교통 안전"},
                    {"id": "읽기"},
                    {"id": "신학"}
                ]
            },
            {
                'locale': 'ar_IL',
                'value': []
            }
        ],
        "loTypes": [
            {
                "id": "warmUp",
                "display": "Warm up"
            },
            {
                "id": "engage",
                "display": "Engage"
            },
            {
                "id": "explore",
                "display": "Explore"
            },
            {
                "id": "summary",
                "display": "Summarize"
            },
            {
                "id": "practice",
                "display": "Practice"
            },
            {
                "id": "reconnect",
                "display": "Reconnect"
            },
            {
                "id": "reflect",
                "display": "Reflect"
            },
            {
                "id": "homework",
                "display": "Homework"
            }
        ],
        "fileSizeLimits": [
            {
                "type": "image",
                "size": 1048576,
                "mimeTypes": [
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/bmp"
                ]
            },
            {
                "type": "audio",
                "size": 15728640,
                "mimeTypes": [
                    "audio/wav",
                    "audio/x-wav",
                    "audio/mpeg3",
                    "audio/x-mpeg-3"
                ]
            },
            {
                "type": "video",
                "size": 15728640,
                "mimeTypes": [
                    "video/mpeg",
                    "video/x-mpeg",
                    "video/mp4"
                ]
            },
	        {
		        "type": "PDF",
		        "size": 5.24288e+008,
		        "mimeTypes": [
			        "application/pdf"
		        ]
	        },
	        {
		        "type" : "epub",
		        "size" : 1073741824,
		        "mimeTypes" : [
			        "application/epub+zip",
			        "application/epub"
		        ]
	        },
	        {
		        "type": "Unity3D",
		        "size": 41943040,
		        "mimeTypes": [
			        "application/vnd.unity"
		        ]
	        },
            {
                "type": "HTML",
                "size": 15728640,
                "mimeTypes": [
                    "text/plain",
                    "text/html",
                    "text/css",
                    "text/css",
                    "application/x-javascript",
                    "application/json",
                    "application/xml"
                ]
            },
            {
                "type": "attachment",
                "size": 15728640,
                "mimeTypes": []
            },

            {
                "type": "default",
                "size": 15728640,
                "mimeTypes": []
            }
        ],
        "skills": {
            "ref": "/publishers/1/skills/skills_us"
        },
        "elementsLimit" : {
            "maxEBookPages" : 100,
            "maxEmbeddedInteractionsOnPage" : 3
        }
    };

    return _defaults;
});