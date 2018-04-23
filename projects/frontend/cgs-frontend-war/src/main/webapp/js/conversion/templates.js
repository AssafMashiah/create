define( [ 'lodash', 'jquery', 'mustache',
				'conversion/custom/alignTextViewerData',
				"conversion/custom/alignProgress",
				"conversion/custom/alignFeedback",
				"conversion/custom/alignSequence",
				"conversion/custom/alignAnswer",
				"conversion/custom/alignTask",
				"conversion/custom/alignTaskOnDone",
				"conversion/custom/alignMtq",
				"conversion/custom/alignMtqAnswer",
				"conversion/custom/alignLinking",
				"conversion/custom/alignMtqmultisubanswer",
				"conversion/custom/alignMtqSubAnswer",
				"conversion/custom/alignTableCell",
				"conversion/custom/alignTable",
				"conversion/custom/alignCloze",
				"conversion/custom/alignClozeTextViewer",
	            "conversion/custom/alignClozeBank",
				"conversion/custom/alignAnswerFieldTypeMathfield",
				"conversion/custom/alignAnswerFieldTypeText",
				"conversion/custom/alignMtqOnDone",
				"conversion/custom/alignClozeOnDone",
				"text!conversion/templates/sequence.xml",
				"text!conversion/templates/separator.xml",
				"text!conversion/templates/html.xml",
				"text!conversion/templates/url_sequence.xml",
				"text!conversion/templates/header.xml",
				"text!conversion/templates/shared.xml",
				"text!conversion/templates/task.xml",
				"text!conversion/templates/imageViewer.xml",
				"text!conversion/templates/textViewer.xml",
				"text!conversion/templates/mediaPlayer.xml",
				"text!conversion/templates/instruction.xml",
				"text!conversion/templates/group.xml",
				"text!conversion/templates/unmapped.xml",
				"text!conversion/templates/answer.xml",
				"text!conversion/templates/textEditor.xml",
				"text!conversion/templates/subQuestion.xml",
				"text!conversion/templates/mcAnswer.xml",
				"text!conversion/templates/hint.xml",
				"text!conversion/templates/applet.xml",
				"text!conversion/templates/progress.xml",
				"text!conversion/templates/mtqSubAnswer.xml",
				"text!conversion/templates/bank.xml",
				"text!conversion/templates/multiSubAnswer.xml",
				"text!conversion/templates/creativeWrapper.xml",
				"text!conversion/templates/title.xml",
				"text!conversion/templates/mathfield.xml",
				"text!conversion/templates/table.xml",
				"text!conversion/templates/tableRow.xml",
				"text!conversion/templates/tableCell.xml",
				"text!conversion/templates/clozeTextViewer.xml",
	            "text!conversion/templates/clozeBank.xml",
				"text!conversion/templates/answerFieldTypeMathfield.xml",
				"text!conversion/templates/answerFieldTypeText.xml",
				"text!conversion/templates/shortAnswerAnswer.xml",
                "text!conversion/templates/helpContext.xml",
                "text!conversion/templates/help.xml",
                "text!conversion/templates/assessment_question.xml",
                "text!conversion/templates/clozeBankSubItem.xml",
                "text!conversion/templates/feedback.xml",
                "text!conversion/templates/invalidTemplate.xml",
                "text!conversion/templates/invalidTemplateImg.xml",
                "text!conversion/templates/invalidTaskTemplate.xml",
                "text!conversion/templates/invalidSharedTemplate.xml",
                "text!conversion/templates/invalidHeaderTemplate.xml"

         ], function(
			_,
			$,
			mustache,
			alignTextViewerData,
			alignProgress,
			alignFeedback,
			alignSequence,
			alignAnswer,
			alignTask,
			alignTaskOnDone,
			alignMtq,
			alignMtqAnswer,
			alignLinking,
			alignMtqmultisubanswer,
			alignMtqSubAnswer,
			alignTableCell,
			alignTable,
			alignCloze,
			alignClozeTextViewer,
			alignClozeBank,
			alignAnswerFieldTypeMathfield,
			alignAnswerFieldTypeText,
			alignMtqOnDone,
			alignClozeOnDone,
			sequence,
			separator,
			html,
			url_sequence,
			header,
			shared,
			task,
			imageViewer,
			textViewer,
			mediaPlayer,
			instruction,
			group,
			unmapped,
			answer,
			textEditor,
			subquestion,
			mcanswer,
			hint,
			applet,
			progress,
			mtqSubAnswer,
			bank,
			multiSubAnswer,
			creativeWrapper,
			title,
			mathfield,
			table,
			tableRow,
			tableCell,
			clozeTextViewer,
			clozeBank,
			answerFieldTypeMathfield,
			AnswerFieldTypeText,
			ShortAnswerAnswer,
            helpContext,
            helpItem,
            assessment_question,
            clozeBankSubItem,
            feedback,
            invalidTemplate,
            invalidTemplateImg,
            invalidTaskTemplate,
            invalidSharedTemplate,
            invalidHeaderTemplate
         ) {

	function templates(){
		// map types to templates and content container for children be added in
		this.map = {
			'assessment_question' : {
				template: assessment_question
			},
			'sequence'		: {
				template: sequence,
                alignData: alignSequence
			},
			'separator'		: {
				template: separator,
				props: { 'sequenceType': 'buffer' },
				alignData : function(data, json){

					var imgChild = json[json[data.id].children[0]] ,
						titleChild = json[json[data.id].children[1]] ,
						subTitleChild = json[json[data.id].children[2]];

						if(data.showImage){
							data.separatorImage = require('json2xml').convert(json,imgChild.id);
						}
						if(data.showTitle){
							var separatorTitle = require('json2xml').convert(json,titleChild.children[0]);
							data.separatorTitle = separatorTitle.replace(/normal/g,'Title');
						}
						if(data.showSubTitle){
							var separatorSubTitle = require('json2xml').convert(json,subTitleChild.children[0]);
							data.separatorSubTitle = separatorSubTitle.replace(/normal/g, 'Subtitle');
						}
				}
			},
			'html_sequence'		: {
				template: html,
				props: { 'sequenceType': 'html' }
			},
			'url_sequence'		: {
				template: url_sequence,
				props: { 'sequenceType': 'url_sequence' }
			},
			'sharedcontent'		: {
				template: shared,
				props:{
                    sequenceType:'shared'
                },
                alignData: function(data, json){

					data.sharedBefore = json[data.parent].data.sharedBefore;
					if(json[data.id].children.length == 1){
						data.displayType = true;
						var type = json[json[data.id].children[0]].type;
						
						//the position of the shared object on the sequence
						switch(type){
							case 'imageViewer':
								data.childType = 'image';
							break;
							case 'textViewer':
								data.childType = 'text';
							break;
							case 'videoPlayer':
							case 'audioPlayer':
							case 'soundButton':
								data.childType = 'media';
							break;
							case 'appletWrapper':
								data.childType = 'applet';
							break;
	                	}
					}
				},
				invalidTemplate : invalidSharedTemplate
			},
			'header'		: { 
				template: header,
				invalidTemplate:invalidHeaderTemplate,
				isTask: true,
				alignData : function(data, json){

					var firstChild = json[json[data.id].children[0]] ;
					var secondChild = json[json[data.id].children[1]] ;

					data.genericTitle = require('json2xml').convert(json,firstChild.children[0]);
					data.genericSubTitle = require('json2xml').convert(json,secondChild.children[0]);
				}
			},
			'task_help' :{
                template : helpContext
            },
            'help' : {
                template : helpItem
            },
            'textviewer'	: {
				template: textViewer,
				transform: { 'title': 'text' },
                dontCompileChildren: true,
                invalidTemplate : invalidTemplate,
                alignData: function(data, json) {
					return alignTextViewerData.alignData(data,json);
				},
				alignDataOnDone: function(data, renderedXML, json) {
					
					return renderedXML;
					//DL will handle spacing based on customization pack
					/*
					return renderedXML.replace(/ (:|;|!|\?|,|\.|»)/g, '&nbsp;$1')
						.replace(/(«) /g, '$1&nbsp;')
						.replace(/ (\+|-|x|×|÷|=) /g, '&nbsp;$1&nbsp;');
					*/
				
				}
			},
			'imageviewer'	: {
				template: imageViewer,
				transform: {
					'image': 'src',
					'sound': 'src_sound'
				},
                invalidTemplate : invalidTemplate,
                alignData: function(data, json) {
					data.minimumReadable = parseFloat( data.minimumReadable ) / 100 ;
					return data;
				}
			},
			'instruction': {
				template: instruction,
				alignData : function(data, json){
					if(!json[json[data.id].children[0]].data.narration){
						data.emphasize = false;
					}

				}
			},
			
			'title': {
				template: title
			},
			
			'questiononly'	: {
				template: task,
				alignData: function(data, json){
					data.task_check_type = 'manual';
					alignTask(data,json);
				},
				alignDataOnDone: alignTaskOnDone,
	            invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'entityType' : 'questionOnly'
				}

			},
			'pedagogicalstatement'	: {
				template: task,
				alignData: alignTask,
				alignDataOnDone: alignTaskOnDone,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'mode': "pedagogical" ,
					'entityType' : 'statement'
				}
			},
			'selfcheck'	: {
				template: task,
				alignData: alignTask,
				alignDataOnDone: alignTaskOnDone,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'mode': "self_check" ,
					'entityType' : 'statement'
				}
			},
			'narrative'	: {
				template: task,
				alignData: alignTask,
				alignDataOnDone: alignTaskOnDone,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'mode': "nerrative" ,
					'entityType' : 'statement'
				}
			},
            'soundbutton'	: {
                template: mediaPlayer,
                props: {
                    contentType: "soundButton",
                    ignoreSize: true
                },
                transform: { 'sound': 'src' },
				invalidTemplate : invalidTemplate,
            },
            'audioplayer'	: {
                template:mediaPlayer,
                props: {
                    contentType: "audio"
                },
                 defaults: {
					height: "150",
                    width: "250"
                },
				invalidTemplate : invalidTemplate,
                transform: { 'audio': 'src' }
            },
            'videoplayer'	: {
                template: mediaPlayer,
                props: { contentType: "video" },
                defaults: {
					height: "450",
					width: "600"
                },
                transform: { 'video': 'src' },
				invalidTemplate : invalidTemplate

            },
            'compare':{
                template:group,
                props:{
                    type:"comparison"
                }
            },
            'freewriting': {
                template:task,
				alignData: function(data, json){
					alignTask(data,json);
				},
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				alignDataOnDone: alignTaskOnDone,
                props: {
                    entityType: "opq"
                }
            },
            'freewritinganswer': {
                template: answer,
	            alignData: alignAnswer
            },
            'texteditor': {
                template: textEditor,
                alignData: function(data, json) {
                    data.answer_size = data.answer_size.toLowerCase();
                    data.answer_size = data.answer_size == "fulltext" ? "fullText" : data.answer_size ;
                    var parent = json[data.parent];
                    data.answer_type = parent.data.answer_type ? parent.data.answer_type : 'studentMath' 	;
                    return data;
                }
            },
            'subquestion': {
                template: subquestion
            },
            'mc': {
                template: task,
	            alignData: alignTask,
	            alignDataOnDone: alignTaskOnDone,
	            invalidTemplate : invalidTaskTemplate,
	            isTask : true,
                props:{
                    entityType: 'mc'
                }
            },
            'mcanswer': {
                template: mcanswer,
	            alignData: alignMtqAnswer
            },
            'option': {
                template: unmapped,
                attr: {
                    'correct': 'correct'
                },
                props: {
                    'lowerName': 'option'
                }
            },
            'hint': {
                template:hint
            },
			'advancedprogress': {  //lowercase always
				template:progress,
				alignData: alignProgress
			},
            'progress': {
                template:progress,
                alignData: alignProgress
            },
            'feedback': {
                template: feedback,
                dontCompileChildren: true,
                props: {
                    lowerName: 'feedback'
                },
                alignData: alignFeedback

            },
            'appletwrapper': {
				template: "{{{content}}}"
            },
            'applet':  {
				template: applet,
				alignData: function(data, json) {
					var appletData =  JSON.stringify(data.appletData); // JSON.stringify passed with null becuase we don't need indentation that will consume a lot of memory
																	   // solved memory issue caused by stringifying applet data.because there are applets that use huge JSONs,
					data.appletData = appletData.replace(/</ig,"&lt;").replace(/>/ig,"&gt;").replace(/&quot;/ig,"\\\"");
					data.hasDimensions = !!(data.playSize && data.playSize.minSize && data.playSize.optimumSize);
					return data;
				},
				invalidTemplate: invalidTemplate,
            },
            'applettask'	: {
				template: task,
				alignData: function(data,json){
					alignTask(data,json);
					//get check type from applet answer
					data.task_check_type = json[json[data.id].children[1]].data.isCheckable ? 'auto' : 'manual';
				},
				alignDataOnDone: alignTaskOnDone,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'entityType' : 'applet'
				}
			},
			'appletanswer':{
				template: answer,
				alignData: alignAnswer
			},
			'matching': {
				template: task,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'isMtq': true
				},
				alignData: function(data, json){
					alignTask(data,json);
					alignMtq(data, json);
				},
				alignDataOnDone: function(data, renderedXML, json) {
					return alignMtqOnDone(data, alignTaskOnDone(data, renderedXML, json), json);
				}
			},
			'sorting': {
				template: task,
				invalidTemplate : invalidTaskTemplate,
				isTask : true,
				props: {
					'isMtq': true
				},
				alignData: function(data, json){
					alignTask(data,json);
					alignMtq(data, json);
				},
				alignDataOnDone: function(data, renderedXML, json) {
					return alignMtqOnDone(data, alignTaskOnDone(data, renderedXML, json), json);
				}
			},
			'sequencing': {
				template: task,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				props: {
					'isMtq': true
				},
				alignData: function(data, json){
					alignTask(data,json);
					alignMtq(data, json);
				},
				alignDataOnDone: alignTaskOnDone
			},
			'matchinganswer': {
				template: answer,
				alignData: alignMtqAnswer
			},
			'linking': {
				template: answer,
				alignData: alignLinking
			},
			'sortinganswer': {
				template: answer,
				alignData: alignMtqAnswer
			},
			'sequencinganswer': {
				template: answer,
				alignData: alignMtqAnswer
			},
			'mtqarea': {
				template: unmapped,
				props: {
                    'lowerName': 'mtqArea'
                }
			},

			'mtqsubquestion': {
				template: unmapped,
				alignData: function (data, json) {
					//set mtq multi sub question to sorting and sequencing, and mtq sub question to matching
					data.lowerName = json[data.parent].data.mtqAnswerType == "matchingAnswer" ? "mtqSubQuestion" : "mtqMultiSubQuestion" ;
				}
			},

			'mtqsubanswer': {
				template: mtqSubAnswer,
				alignData: alignMtqSubAnswer
			},
			'mtqmultisubanswer' : {
				template: multiSubAnswer,
				alignData: alignMtqmultisubanswer
			},

			'definition': {
				template: unmapped,
				props: {
                    'lowerName': 'definition'
                }
			},
			'mtqBank': {
				template : bank,
				alignData: function(data, json){
					data.useBank = json[data.parent].data.useBank;
				}
			},
			'mathfield': {
				template: mathfield,
				alignData: function (data, json) {
					if (data.isCompletionType) data.editMode = 'completion';
				},
				attr: {
					'colorShapes' : 'colorShapes' ,					
					'maxHeight' : 'maxHeight',
					'editMode' : 'editMode',
					'italicVariables' : 'italicVariables',
					'validate':'validate',
                    'autoComma':'autoComma',
                    'widthEM' : 'widthEM'
                }
			},
            'mathfieldeditor' :{
                template: mathfield,
                attr: {
                    'colorShapes' : 'colorShapes' ,
                    'maxHeight' : 'maxHeight',
                    'editMode' : 'editMode',
                    'italicVariables' : 'italicVariables',
                    'validate':'validate',
                    'autoComma':'autoComma',
                    'completionType': 'completionType'
                }
            },
			'creativeWrapper': {
				template : creativeWrapper,
				alignData: function(data, json){
					data.footer_small = json[data.creativeWrapper]['footer_small'];
					data.footer_big = json[data.creativeWrapper]['footer_big'];
					data.margin = json[data.creativeWrapper]['margin'];
				},
				props: {
					'entityType' : 'automatic',
					'lowerName': 'creativeSet'
				}
			},
			'table': {
				template: table,
				alignData: alignTable
			},
			'tablerow': {
				template: tableRow
			},
			'tablecell': {
				template: tableCell,
				alignData: alignTableCell
			},
			//cloze
			'cloze':{
				template:task,
				invalidTemplate : invalidTaskTemplate,
	            isTask : true,
				alignData:function (data, json) {
					alignTask(data, json);
					alignCloze(data, json);
				},
				alignDataOnDone: function(data, renderedXML, json) {
					return alignClozeOnDone(data, alignTaskOnDone(data, renderedXML, json), json);
				}
			},
			'cloze_answer': {
				template: answer,
				alignData: alignAnswer
			},
			'cloze_text_viewer':{
				template:clozeTextViewer,
				alignData:function (data, json) {
					alignTextViewerData.alignData(data, json);
					alignClozeTextViewer.alignData(data, json);
				},
				alignDataOnDone: function(data, renderedXML, json) {
					renderedXML = temps.map.textviewer.alignDataOnDone(data, renderedXML, json);
					var wrapper = $('<wrapper>').html(renderedXML);
					wrapper.find('subanswer').replaceWith(function() {
						return $(this.outerHTML.replace(new RegExp('&nbsp;', 'g'), ' '));
					});
					return wrapper.html();
				}
			},
			'clozebank':{
				template: clozeBank,
				alignData: alignClozeBank
			},
			'answerfieldtypemathfield' : {
				template: answerFieldTypeMathfield,
				alignData: alignAnswerFieldTypeMathfield
			},
			'answerfieldtypetext' : {
				template: AnswerFieldTypeText,
				alignData: alignAnswerFieldTypeText
			},
			'shortanswer': {
                template: task,
                invalidTemplate : invalidTaskTemplate,
	            isTask : true,
                alignData: function(data, json){
	   				data.fieldsSize = 'manual';
	                alignTask(data,json);
                },
                alignDataOnDone: alignTaskOnDone,
                props:{
                    entityType: 'shortAnswer'
                }
			},
            'shortansweranswer' : {
                template : ShortAnswerAnswer,
	            alignData: alignAnswer

            },
            'clozebanksubitem':{
            	template: clozeBankSubItem
            },
            'sets': {
            	template: unmapped,
            	attr: {
            		'type': 'type'
            	},
            	props: {
                    'lowerName': 'sets'
                }
            },
            'lists': {
            	template: unmapped,
            	attr: {
            		'randomize': 'randomize'
            	},
            	props: {
                    'lowerName': 'lists'
                }
            },
            'list': {
            	template: unmapped,
            	attr: {
            		'randomize': 'randomize',
            		'title': 'title'
            	},
            	props: {
                    'lowerName': 'list'
                }
            }
		};

	}
		
	templates.prototype = {
		
		get: function( name ) {
			
			// work with lower to prevent case issuers
			var lowerName = name.toLowerCase() ;
			
			// try to get a mapped objects
			var mapped = this.map[ lowerName ] ;
			

			// by default generate auto tag when no template
			var auto ;

			if( !mapped ) {
				auto = {
					template: mustache.render(unmapped, {
						lowerName: lowerName,
						id: "{{{id}}}",
						content: "{{{content}}}"
					} )
				} ;
			}
			
			var templateObj = auto || mapped ;

			if( templateObj.wrapInOriginal ) {
				templateObj.template = 
					"<"+ lowerName +">" +
					templateObj.template +
					"</"+ lowerName +">" ;
			}
			
			return templateObj ;
			
		}

	};

	var temps = new templates();
	
	return temps;
	
});

