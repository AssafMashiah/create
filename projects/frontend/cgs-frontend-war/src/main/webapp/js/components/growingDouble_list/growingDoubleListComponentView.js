define(['jquery','BaseView','mustache', 'localeModel', 'text!components/growingDouble_list/html/growingDoubleList.html',
	'text!components/growingDouble_list/html/growingDoubleListRow.html', 'components/mathfield/MathField'],
	function($, BaseView, mustache, localeModel, template, row_template, MathFieldView){

	var growingDoubleListCompnentView = BaseView.extend({
		events : {
			"click .js-growing-add" : "newInnerList",
			"click .newInnerList" : "newInnerList",
			"click .newOuterList" : "newOuterList",
			"click .js-growing-remove" : "remove_row",
			"click .js-growing-remove-condition" : "remove_condition",
			"click .openSplitButtonList" :"showAddNewTypes",
			"change .comparisonSelect": "comparisonChange"

		},

		initialize : function f1417(options){
			this.options = options;

			this.data = [];

			//add default value
			if(!options.data){
				var defaultData = this.createEmptyListData();
				defaultData.idx = 0;
				this.data.push(defaultData);
			}else{
				this.data = require('cgsUtil').cloneObject(options.data);
			}
			this.has_data = this.data.length;
			this.update_model_callback = options.update_model_callback;

			this._super();
		},

		render : function f1418(updateModel){
			this._super(template,{row:row_template});

			//set drop down values of lists

			_.each(this.$('.outerList'),_.bind(function(list, index){
				_.each($(list).find('.growinglist-row'),_.bind(function(innerList, innerIndex){
					$(innerList).find('.comparisonSelect').val(this.data[index].innerList[innerIndex].condition);
				},this));
			}, this));

			clearTimeout(this.defer);
			_.invoke(this.mathfieldArray, 'dispose');
			this.initMathfields();

			if( this.$( '.outerList' ).length < 2 ){

				this.$( '.js-growing-remove-condition' ).parent().addClass( 'hide' );

			}

           // $(this.el).scrollParent().scrollTop(this.$('.outerList')[0].scrollHeight);
			//render and call update model callback
			if(updateModel){
				this.updateModel();
			}
		},
		onEndEditMathfield: function f1419() {
			//after edit save all the list data
			_.each(this.data, _.bind(function(conditionList, conditionIndex){
				_.each(conditionList.innerList, _.bind(function(ruleList,ruleIndex){
					var mathfieldElementView = this.mathfieldArray[conditionIndex+"_"+ruleIndex].mathField.view;

					ruleList.markup = mathfieldElementView.getMarkUpValue();
					ruleList.value = mathfieldElementView.getValue();

	      		},this));
			},this));
			this.updateModel();

			delete this.selectedMathfield;
	    },
	   	setKeyboardEvent: function f1420() {
	   		$(document).one("mousedown.doublelist", function f1421(e) {
	   			this.selectedMathfield && this.selectedMathfield.mathField.view.endEdit();
	   		}.bind(this))
	   	},
		//init mathfields components
		initMathfields : function(){
			_.each(this.data, _.bind(function(conditionList, conditionIndex){
				_.each(conditionList.innerList, _.bind(function(ruleList,ruleIndex){

					var attributes = require('cgsUtil').getRepoDefaultData('mathfield');
					attributes.maxHeight = 'dynamic'; // ovverride default value (second level)

					_.extend(attributes, localeModel.getConfig('mfConfig'));

					var mfData = jQuery('<mathField/>').attr(attributes);
					var iframeContainer = $("<iframe></iframe>").css({
						height: '90px', 
						border: '0'
					});
					var iframeParent = this.$('.outerList[idx='+conditionIndex+'] .growinglist-row[idx='+ruleIndex+'] .mathfieldContainer');

					iframeParent.css({
						'width': '1237px',
						'height': '89px',
                     	'overflow':'hidden'
					})

					var initHTML = '<!DOCTYPE html>';
	                    initHTML += '<html style="overflow: hidden;">';
	                    initHTML += '<head>';
	                        initHTML += "<style>.mathField_button{position:absolute;top:200px;left:10px}.mathField_button_value{position:absolute;top:170px;left:10px}.mathField_button_correctness{position:absolute;top:140px;left:10px}.mathField_button_reduction{position:absolute;top:110px;left:10px}@font-face{font-family:'MF_T2K_US-Regular';src:local(\"MF_T2K_US-Regular\"),url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Bold-Italic.ttf\") format(\"truetype\");font-weight:bold;font-style:italic}.mathField.italicVariables .letter{font-style:italic}.mathField.colorShapes .shape{color:red}.mathField .blowup{position:absolute;z-index:60;display:none;overflow:hidden}.mathField.blowup .blowup{display:block;border:1px solid #b3b3b3;cursor:pointer}.mathField.blowup .blowup:hover{border:1px solid #2ed5ff}.mathField.blowup .blowup .blowupZoom{width:22px;height:22px;position:absolute;top:0;right:0;background:transparent url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 0 -312px no-repeat}.mathField.blowup .blowup:hover .blowupZoom{background-position:0 -334px}.blowupContainer,.task>.blowupContainer,.mathField .blowupContainer{position:fixed;padding:10px;padding-top:21px;border:1px solid #BBB;background-color:#FFF;box-shadow:0 3px 8px 2px rgba(119,118,118,0.7);z-index:80;margin:0;overflow:auto}.mathField .blowupContainer{display:none}.hide{position:absolute !important;top:-9999px !important;left:-9999px !important}.blowupContainer .x,.task>.blowupContainer .x,.mathField .blowupContainer .x{width:40px;height:22px;position:absolute;top:0;cursor:pointer;background:transparent url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 0 -156px no-repeat}.blowupContainer .x:hover,.task>.blowupContainer .x:hover,.mathField .blowupContainer .x:hover{background-position:0 -182px}.mathField .masc{position:absolute;background-color:white;opacity:.01;z-index:40}.completion.structure.placeholder{padding:2px;border:1px solid #ccc;color:#ccc;width:1.4em;height:1.4em;font-size:.6em;display:inline-block;text-align:center;position:relative;top:-0.2em;margin:0 1px}.divider .completion.structure.placeholder{top:.1em;left:.1em}.divided .completion.structure.placeholder{top:.1em}.numerator .completion.structure.placeholder{top:-0.2em}.denominator .completion.structure.placeholder{top:-0.3em}.power .completion.structure.placeholder{top:-0.3em}.absolute .completion.structure.placeholder{top:-0.1em}.completion.structure.placeholder .remainder{top:-0.2em}.mathField.completion.focus .frame{outline:#fff7c2 solid 2px !important;outline-offset:0;background:rgba(255,247,194,0.8)}.mathField .frame{outline-offset:1px;position:absolute;top:0;min-height:1em}.mathField.blowup .frame{outline:none !important}.mathField.blur .frame{outline:1px solid #b3b3b3;background:rgba(255,255,255,0.2)}.mathField.blur.readOnly .frame{background:0}.mathField.blowup.blur .frame{outline:1px solid #b3b3b3;background:rgba(255,255,255,0.2)}.mathField.focus .frame{outline:1px solid #f93;background:rgba(255,255,255,0.2)}.mathField.focus{line-height:normal;vertical-align:baseline}.mathField .frame.not_valid{background:rgba(255,255,255,0.2);outline:solid 1px #d6424c}.mathField.completion .frame.not_valid{border:0;outline:#fee2de solid 2px;outline-offset:0;background:rgba(254,226,222,0.8)}.mathField,.mathField.usa,.mathField.us{font-family:MF_T2K_US-Regular}.mathField.il{font-family:MF_T2K_HE-Regular}.mathField.fr{font-family:MF_T2K_FR-Regular}.mathField.nl{font-family:MF_T2K_NL-Regular}.mathField .symbol,.mathField .caret{display:inline-block;vertical-align:bottom;height:1.05em}.ie9 .mathField .symbol{height:.9em}.ie9 .longDivision .mathField .symbol{height:.9em}@-webkit-keyframes blink-caret{from,to{border-color:black}50%{border-color:transparent}}@keyframes blink-caret{from,to{border-color:black}50%{border-color:transparent}}.mathField .caret{-webkit-animation:blink-caret 1s step-end infinite;-ms-animation:blink-caret 1s step-end infinite;-moz-animation:blink-caret 1s step-end infinite;-o-animation:blink-caret 1s step-end infinite;animation:blink-caret 1s step-end infinite;text-decoration:blink;border-color:black;border-left:0;margin-left:0;border-right:.1em solid transparent;margin-right:-.1em;position:relative;top:1px;width:2px}.mathField{display:inline-block;position:relative;white-space:nowrap;cursor:text;min-height:1.2em;line-height:normal}.mathField .mathField_content .icon{width:auto}.mathField.readOnly{min-height:1em}.mathField .mathField_content{display:inline-block;vertical-align:bottom;min-width:1.3em;min-height:1.3em;position:relative;color:#444;line-height:normal;white-space:inherit !important}.mathField.readOnly .mathField_content,.mathField.empty .mathField_content{min-width:.5em}.mtqBank .mathField.readOnly .mathField_content{vertical-align:bottom}.texteditor .mathField.readOnly{margin:0}.subQuestion>div>.mathField,.subQuestion .subAnswer.mathfield .mathField{display:block}.texteditor .mathField .mathField_content{color:inherit}.mathField .selection{background-color:#9ec6f1}.mathField .not_valid{color:#d6424c}.mpsWrapper.show.not_valid{background-color:#fdaba2 !important;border:none !important}.mathField .mpsAnchor{display:inline-block;vertical-align:bottom;width:0;height:1em;background-color:transparent;position:relative;top:0;margin:0;padding:0}.mathField .fraction .mpsAnchor{width:0;background-color:transparent;margin-top:.5em}.mathField .fraction .numerator .mpsAnchor,.mathField .fraction .denominator .mpsAnchor{width:0;background-color:transparent;margin-top:0}.mathField.readOnly .fraction .numerator .mpsAnchor,.mathField.readOnly .fraction .denominator .mpsAnchor{margin-top:-0.5em}.mathField .mpsLasso{height:1em;width:0;background-color:transparent;display:inline-block;vertical-align:bottom}.mathField .mpsContent{white-space:nowrap !important;height:1.1em;min-width:.5em;left:0;max-width:100%;-webkit-transform-style:preserve-3d}.mathField .power{font-size:.75em;top:-0.6em;padding-top:.6em;line-height:normal}.mathField .power .power{font-size:1em;top:-0.4em;padding-top:.4em}.mathField .symbol{position:relative;min-width:.4em;text-align:left}.mathField .symbol[validationgroup=\"thousandsComma\"],.mathField .symbol[validationgroup=\"decimalPoint\"]{min-width:.2em}.displayInlineBlock,.mathField .mpsContent,.mathField .power,.mathField .fraction,.mathField .longDivision,.mathField .longDivision .divided,.mathField .longDivision .divider,.mathField .root,.mathField .root .radicand,.mathField .root .degree,.mathField .repeatingDecimal,.mathField .repeatingDecimal.fr .icon,.mathField .repeatingDecimal.nl .icon,.mathField .geometry,.mathField .remainder,.mathField .remainder .icon,.mathField .absolute,.mathField .absolute .icon,.mathField .completion{display:inline-block;vertical-align:bottom;position:relative}.mathField .fraction{min-width:1em}.mathField .fraction>.mpsContent{text-align:center}.mathField .fraction .numerator,.mathField .fraction .denominator{min-width:20px;min-height:.9em;font-size:.9em;line-height:100%;display:block;position:relative;padding:0}.mathField .fraction .numerator .symbol,.mathField .fraction .denominator .symbol{max-height:.9em;vertical-align:baseline}.mathField .fraction .fractionBar{width:100%;height:1px;min-height:1px;line-height:100%;background:black;display:block;font-size:.8em;margin-bottom:1px}.mpsMinWidth0_8em,.mathField .longDivision .divided,.mathField .longDivision .divider,.mathField .root .radicand{min-width:.8em;min-height:.9em;line-height:100%;text-align:center}.mpsAnchorWidth0,.mathField .longDivision .mpsAnchor,.mathField .root .mpsAnchor{top:.1em;width:0;background-color:transparent}.ie9 .mathField .longDivision .mpsAnchor{top:.1em}.mpsAnchorNoFloat,.mathField .longDivision .divided .mpsAnchor,.mathField .longDivision .divider .mpsAnchor,.mathField .root .radicand .mpsAnchor,.mathField .root .degree .mpsAnchor{float:none;width:0;background-color:transparent;margin-top:0}.mathField .longDivision.il .divided{top:0}.mathField .longDivision.il .divider{border-top:2px solid #444;top:0}.mathField .longDivision.il .divider :first-child{padding-right:2px}.mathField .longDivision.fr .divided{border-bottom:.1em solid #444;top:0;left:-5px}.mathField .longDivision.fr .divider{top:0;left:-5px}.mathField .longDivision.fr .divided>div{top:2px}.mathField .longDivision.us .divider,.mathField .longDivision.sg .divider{border-top:2px solid #444;top:0}.mathField .longDivision .icon{height:1.1em;width:6px}.mathField .longDivision .icon svg{position:absolute;top:0;height:1.1em}.mathField .longDivision.sg .icon{left:1.4em}.mathField .longDivision.il .icon svg{top:-1px}.mathField .longDivision.fr .icon svg{top:1px}.mathField .root .icon{display:inline-block;position:relative;vertical-align:baseline;width:.65em;height:.95em}.mathField .root .icon .radical_sign{width:100%;height:100%;position:absolute;left:0;top:0;z-index:-1}.mathField .root .icon .radical_sign>img.stretch{height:100%;width:56%}.mathField .root .icon .radical_sign>img{width:44%}.mathField .root .radicand .top_line{border-top:1px solid #444;margin:0;position:relative;width:100%;z-index:-1;height:1px}.mathField .root .degree{vertical-align:top;font-size:.7em;min-width:.75em;min-height:.75em;bottom:.4em}.mathField .root .degree .mpsContent{min-width:.75em;min-height:.75em}.mathField .root .degree .mpsContent div.symbol{height:1em}.mathField .repeatingDecimal{white-space:nowrap}.mathField .repeatingDecimal.us .icon,.mathField .repeatingDecimal.il .icon{position:absolute;font-size:1.2em;top:2px;left:0;background-color:#444;height:2px;width:100%}.mathField .repeatingDecimal.fr .icon,.mathField .repeatingDecimal.nl .icon{line-height:100%;margin:0 0 0 .1em;padding:0;top:.1em;font-family:inherit}.mathField .fraction .repeatingDecimal .icon{top:-2px}.mathField .geometry{line-height:110%;text-align:center}.mathField .geometry .icon{position:absolute;font-size:1.2em;top:-0.08em;left:0}.ie9 .mathField .geometry .icon{top:.05em}.mathField .geometry>.mpsContent{min-width:.9em;left:.1em}.mathField .geometry .symbol{position:relative;font-size:.77em;top:-0.2em}.mathField .remainder{white-space:nowrap;overflow:visible}.mathField .remainder .icon{line-height:100%;margin:0 0 0 .2em;padding:0;top:0;font-family:inherit;max-width:1em}.nl_NL .mathField .remainder .icon{max-width:2.1em}.ie9 .mathField .remainder .icon{top:3px}.mathField .absolute{min-width:1em;text-align:center}.mathField .absolute.not_valid{color:inherit}.mathField .absolute.not_valid .icon.left{color:#d6424c}.mathField .absolute .icon{line-height:1em}.mathField .absolute .icon.right{margin-left:.1em}.mathField .absolute .icon.left{margin-right:.1em}.ie9 .mathField .absolute .icon{line-height:.5em}.mathField .completion{padding:.09em .136em;min-width:1em;line-height:1em}.mathField .completion .operator{margin:0 2px 0 2px}.mathField .completion .mpsContent{text-align:center;line-height:100%}.mathField .completion .mpsContent .mpsContent{height:1em}.mathField .completion .square_root .icon,.mathField .completion .root .icon{left:.05em}.mathField .completion>.mpsContent{min-width:.7em}.mathField .completion .mpsWrapper.show.not_valid{background-color:#fdd985 !important;border:none !important}.mathField .mpsWrapper{position:absolute}.mathField .mpsWrapper.show{background-color:#fdd985;z-index:-1}.mathField.readOnly .mpsWrapper.show{background-color:transparent;border:1px solid #c3c3c3}.mathField.completion.blur .mpsWrapper.show{background-color:#fff !important;border:solid 1px #b3b3b3 !important}.mathField.completion.blur .mpsWrapper.show.not_valid{background-color:#fff !important;border:solid 1px #d6424c !important}.mathField.completion.focus .mpsWrapper.show{background-color:#fff !important;border:solid 1px #f93 !important}.mathField .mathField_content{z-index:20}.mathField.empty{max-height:1.2em;min-height:1em}.mathField.empty.blur{min-width:2rem}.mathField.empty.blur .frame{min-width:2rem}.mathField.empty.blur .mathField_content{max-width:1em}.texteditor .mathField.empty .mathField_content{min-width:1em}.mathField.empty .mf_icon{font-style:italic;font-family:Arial;font-size:.9rem;line-height:.9em;letter-spacing:.1rem;position:absolute;top:-0.15rem;right:0;color:#b3b3b3}.mathField .mf_icon,.clozeArea .subAnswer_content.full .mathField .mf_icon,.mathField.empty.focus .mf_icon{display:none !important}.mathField.empty.blur .mf_icon{display:block !important}.mathField .mathField_input{opacity:.01;width:1px;height:0;padding:0;margin:0;border:0;font-size:0;display:none}.mathField.keyboard{font-size:0;position:absolute;z-index:1000;padding:.71rem 0;margin:0 !important;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;user-select:none}.mathField.keyboard .keyboard_content{background:#efefef;border:1px solid #cacaca;box-shadow:0 2px 8px 0 rgba(0,0,0,0.2);padding:.71rem}.mathField.keyboard.mini{padding:2.429rem .286rem .286rem .286rem}.mathField.keyboard.mini ul.tabs-nav{display:none}.mathField.keyboard.usa,.mathField.keyboard.us{font-family:MF_T2K_US-Regular}.mathField.keyboard.il{font-family:MF_T2K_HE-Regular}.mathField.keyboard ul.tabs-nav ~ .close{background:url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 24px 281px;width:15px;height:15px;position:absolute;top:18px;right:8px;cursor:pointer}.mathField.keyboard ul.tabs-nav.rtl ~ .close{left:8px}.mathField.keyboard ul.tabs-nav{padding:0 0 .71rem 0;line-height:1.214rem}.mathField.keyboard ul.tabs-nav li.tabs-nav-item{font-size:1.28rem;color:#3f97df;cursor:pointer;display:inline-block;border-right:1px solid #cacaca;padding:0 .71rem;text-align:center}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:first-child{padding:0 .71rem 0 0}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:last-child{border-right:0;padding-right:0}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item{border-left:1px solid #cacaca;border-right:0}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item:first-child{padding:0 0 0 .71rem}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item:last-child{border-left:0;padding-left:0}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:hover{color:#4cc4ff}.mathField.keyboard ul.tabs-nav li.tabs-nav-item.selected{color:#f93;font-weight:bold;cursor:default}.mathField.keyboard .tab{display:none;white-space:nowrap}.mathField.keyboard .tab.selected{display:block}.mathField.keyboard .box{display:inline-block;padding-right:.71rem;vertical-align:top}.mathField.keyboard .box:last-child{padding-right:0rem}.mathField.keyboard .line.center{text-align:center}.mathField.keyboard .key{display:inline-block;width:3rem;height:3rem;line-height:3rem;text-align:center;color:#3f97df;background:-webkit-linear-gradient(top,#fff,#f0f0f0);background:-o-linear-gradient(top,#fff,#f0f0f0);background:-moz-linear-gradient(top,#fff,#f0f0f0);background:-ms-linear-gradient(top,#fff 0,#f0f0f0 100%);background:linear-gradient(to top,#fff 0,#f0f0f0 100%);border:1px solid #cacaca;margin:0 -1px -1px 0;cursor:pointer;font-size:1.571rem}.mathField.keyboard .key.literal{font-size:13px;background:#73b1e4;color:white;text-align:left;padding-left:8px;height:29px;line-height:normal;padding-top:9px;font-family:Arial;border:0;margin-bottom:1px}.mathField.keyboard .key.literal .keyboard_emphasis{font-weight:bold;font-size:16px;width:1.2rem;text-align:center;display:inline-block}.mathField.keyboard .key.literal .word{margin-left:3px}.mathField.keyboard .key.literal:not(.disabled):hover{background:#7dd1fa;color:white}.mathField.keyboard .key.literal:active{background:#73b1e4;color:white}.mathField.keyboard .key.literal.disabled{outline:1px solid}.mathField.keyboard .key.over{color:#4cc4ff}.mathField.keyboard .key.pressed{color:#fff;background:#5a88ad}.mathField.keyboard .key.selected{color:#f93;background:#fff7c2}.mathField.keyboard .key.pressed.selected{color:#ffb833;background:#fff7c2}.mathField.keyboard .key.disabled{color:#ccc;background:#efefef}.mathField.keyboard .key.none{visibility:hidden}.textViewer .mathFieldWrapper{min-height:1.17em;max-width:100%;display:inline-block;line-height:100%}.textViewer .mathFieldWrapper .mathField{white-space:nowrap;text-indent:0}.mtqArea .subAnswer .mathFieldWrapper,.inDragMtq .mathFieldWrapper,.inDrag .mathFieldWrapper{height:auto}.textViewer .mathField.blur .frame,.mathField.readOnly .frame,.subAnswer.mathfield .mathField.readOnly .frame{outline:0;outline-offset:0}.textViewer .mathField.blur.empty .frame{outline:1px solid #b3b3b3}.clozeArea .textViewer .subAnswer.mathfield .mathField{vertical-align:baseline;min-height:1em;white-space:nowrap}.clozeArea .subAnswer.mathfield .mathField.completion{vertical-align:middle;display:inline-block}.bank .subAnswer.mathfield .mathField .frame,.inDragMtq .mathField .frame,.bank_readonly .subAnswer.mathfield .mathField .frame,.inDragMtq .mathField .frame,.player .task.mtq .definition .mathField .frame,.inDrag .mathField .frame{outline:none !important;outline-offset:0 !important}.subAnswer.mathfield .mathField .frame{outline:1px solid #cfcfcf;outline-offset:-1px}.subAnswer.mathfield .mathField.completion .frame{outline:none !important}.clozeArea .subAnswer.mathfield.disabled.correct .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.wrong .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.system_correct .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.partlyCorrect .mathField .frame{outline:none !important;outline-offset:0 !important}.question .textViewer .mathField.readOnly .mpsContent{vertical-align:baseline}.subAnswer.mathfield.disabled .mathField .frame.not_valid{background-color:transparent}.bank .subAnswer.disabled .mathField .mathField_content{color:#8a8a8a !important}.mtqBank .subAnswer.mathfield .mathField .frame,.mtqArea .subAnswer .mathField .frame{outline:none !important}.mtqBank .subAnswer.mathfield .subAnswer_content,.inDragMtq .mathField{padding:.3rem}.mtqArea .subAnswer .textViewer .mathFieldWrapper .mathField,.inDragMtq .textViewer .mathFieldWrapper .mathField{padding:0}.definition .mathField.readOnly,.intersection .mathField.readOnly{margin:0 0 .5rem 0 !important}.mtqArea .subAnswer_content.draggable.full:hover .mathField .mathField_content,.mtqArea .subAnswer_content.draggable.full:hover .mathField .mathField_content{position:relative;top:1px;left:1px}.mathField .mf_icon{display:none}.clozeArea .mathField.empty .mf_icon{font-size:.9rem;line-height:.9em;position:absolute;top:2px;right:2px;display:block}.clozeArea .subAnswer.disabled .mathField .mpsWrapper.show{background-color:#fff !important;border:solid 1px #b3b3b3 !important}.table .cell .subAnswer .mathField.readOnly .frame{outline:none !important}.table .cell .mathField.readOnly .frame{outline:none !important;outline-offset:0 !important}.table .cell .mathField.readOnly{padding-top:.1em}.texteditor .mathField{display:inline-block;user-modify:read-only;-moz-user-modify:read-only;-webkit-user-modify:read-only;margin-right:4px;margin-left:4px;font-weight:normal !important;font-size:22px;background-color:transparent !important;font-style:normal !important;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;-o-user-select:none}#body_texteditor .mathField.focus .frame{outline:0;background:rgba(255,247,194,0.8)}#body_texteditor .mathField.blur .frame{outline:0}#body_texteditor .mathField.empty .frame{outline:1px solid #b3b3b3}.readwrite{user-modify:read-write !important;-moz-user-modify:read-write !important;-webkit-user-modify:read-write !important}.rtl .task_content .mathField{text-align:left}</style>";
	                        initHTML += "<style>::-webkit-scrollbar{width:8px;height:8px;border-radius:3px;background:-webkit-gradient(linear,left top,right top,color-stop(0%,rgba(202,202,202,.07)),color-stop(100%,rgba(229,229,229,.07)));background:-webkit-linear-gradient(left,rgba(202,202,202,.07)0,rgba(229,229,229,.07)100%);box-shadow:0 0 1px 0 rgba(0,0,0,.15)inset,0 1px 0 0 #fff;background-color:#D8D7DA}::-webkit-scrollbar-thumb{overflow:visible;border-radius:3px;border:solid 1px #A6A6A6;background:-webkit-gradient(linear,left top,right top,color-stop(0%,rgba(233,233,233,.05)),color-stop(100%,rgba(221,221,221,.05)));background:-webkit-linear-gradient(left,rgba(233,233,233,.05)0,rgba(221,221,221,.05)100%);box-shadow:0 2px 1px 0 rgba(0,0,0,.05);background-color:#B0AFB5}::-webkit-scrollbar-button{height:0;display:block}::-webkit-scrollbar-button:end:increment,::-webkit-scrollbar-button:start:decrement{background-repeat:no-repeat}::-webkit-scrollbar-button:vertical:decrement{background-image:url(../media/vertical-decrement-arrow.png)}::-webkit-scrollbar-button:vertical:increment{background-image:url(../media/vertical-increment-arrow.png)}</style>";
	                        // initHTML += '<link rel="stylesheet" type="text/css" href="js/components/mathfield/internal/_mathfield.not-minified.css"/>';
	                    initHTML += '</head>';
	                    initHTML += '<body spellcheck="false" style="-webkit-user-select: none;">';
	                    initHTML += '<div id="' + conditionIndex+"_"+ruleIndex +'"></div>'; 
	                    initHTML += '</body>';
	                    initHTML += '</html>';


					iframeParent.append(iframeContainer);


					var iframeDoc = iframeContainer.contents().get(0);

					iframeDoc.open();
					iframeDoc.write(initHTML);
					iframeDoc.close();



					if(ruleList.markup){
						mfData.append(ruleList.markup);
					}else{
						//add invalid sign to the list
						require('validate').insertInvalidSign(this.$('.outerList[idx="'+conditionIndex+'"] .growinglist-row[idx="'+ruleIndex+'"]'),
							true,'mathfieldList', require('translate').tran('validations.mathfield.condition.emptyRule'));
					}
					
					this.mathfieldArray = this.mathfieldArray || {};



					this.defer = _.defer(function() {
						var mathfield = new MathFieldView({
							data: mfData,
							parent: $(iframeDoc).find('#' + conditionIndex+"_"+ruleIndex),
							container: this.$('.outerList[idx='+conditionIndex+'] .growinglist-row[idx='+ruleIndex+'] .mathfieldContainer'),
							iframeDoc: $(iframeDoc),
							onStartEdit: function f1422() {
								if (!this.selectedMathfield) {
									this.selectedMathfield = this.mathfieldArray[conditionIndex+"_"+ruleIndex] ;
									this.setKeyboardEvent();
								}

								iframeContainer.contents().find('body').css({
									'width': '293px',
									'height': '91px',
									'margin': '0',
									'padding': '0 0 0 8px',
									'overflow-x': 'scroll',
									'overflow-y': 'hidden'
								});

								this.selectedMathfield && this.selectedMathfield.view && this.selectedMathfield.view._input.off('focus').one('focus', function () {
	                                $(document).trigger('mouseup.endMathfieldEdit');

	                                _.each( this.mathfieldArray , function (mf, mfId) {
	                                    if (mfId !== (conditionIndex+"_"+ruleIndex)) {
	                                        mf.mathField.view.endEdit();
	                                    } 
	                                }, this);
	                            }.bind(this));

							}.bind(this),
							onEndEdit: _.debounce(this.onEndEditMathfield.bind(this), 500, {
		                      'leading': true,
		                      'trailing': false
		                    })

						});

						if (mathfield.mathField) {
							mathfield.mathField.view.setEnabled(true);
							//mathfield workaround for dispose the editor mathfields
							mathfield.mathField.view._input.one('focus', function () {
								$(document).trigger('mouseup.endMathfieldEdit');

								_.each( this.mathfieldArray , function (mf, mfId) {
                                    if (mfId !== (conditionIndex+"_"+ruleIndex)) {
                                        mf.mathField.view.endEdit();
                                    } 
                                }, this);	
							});	
								
							//save the mathfield inside an array
							this.mathfieldArray[conditionIndex+"_"+ruleIndex] = mathfield;
						}
					}.bind(this));
					

				},this));
			},this));

		},
		//new empty list template
		createEmptyListData:function(){
			var mainList = {};
				mainList.title= this.options.title;
				mainList.innerList = [];
				mainList.innerList.push({"condition": "equal", "value": "", 'idx': "0"});
				mainList.splitAddButton = true;
			return mainList;
		},

		//handle split button visibility
		showAddNewTypes: function(e){

			var target = $(e.target).next('.addCondition');

			if(target.hasClass('hidden')){
				target.removeClass('hidden');
			} else {
				target.addClass('hidden');
			}
		},

		//add new condition
		newOuterList: function(){
			newOuterList = this.createEmptyListData();
			newOuterList.idx = this.data.length;

			this.data.push(newOuterList);

			this.data[this.data.length-2].splitAddButton = false // disable split botton on last condition list

			//render and update model
			this.render(true);


		},

		//add new rule
		newInnerList: function(e){
			var outerListIndex = $(e.target).parents('.outerList').attr('idx'),
				innerListIndex = this.data[outerListIndex].innerList.length;

			this.data[outerListIndex].innerList.push({"condition": "equal", "value": "", 'idx': innerListIndex});
			this.render(true);

		},

		//remove row from the growing table
		remove_row : function f1423(e){

			var outerListIndex = $(e.target).parents('.outerList').attr('idx'),
				innerListIndex = $(e.target).parents('.growinglist-row').attr('idx');

				//remove row
				this.data[outerListIndex].innerList.splice(innerListIndex, 1);

				//after delete, reset the index at each row
				_.each(this.data[outerListIndex].innerList, function(item, index){
					item.idx = index;
				});

				this.render(true);
		},
		remove_condition: function(e){

			var conditionListIndex= $(e.target).parents('.outerList').attr('idx');
			if(this.data.length > 1)
			{
				this.data.splice(conditionListIndex, 1);
			}
			_.each(this.data, function(list, index){
				list.idx = index;
			});

			this.data[this.data.length-1].splitAddButton = true; // add split button to last condition in list
			this.render(true);
		},

		//comparison operator change
		comparisonChange: function(e){
			var dropDown = $(e.target),
				rowIndex= dropDown.parents(".growinglist-row").attr('idx'),
				listIndex = dropDown.parents(".outerList").attr('idx');

			this.data[listIndex].innerList[rowIndex].condition = dropDown.val();
			this.updateModel();
		},

		//update the model with func that is set from the containing object
		updateModel : function f1424() {
			if(_.isFunction(this.update_model_callback)){
				this.update_model_callback(require('cgsUtil').cloneObject(this.data), this);
			}
		},

		dispose: function() {
			clearTimeout(this.defer);
			_.invoke(this.mathfieldArray, 'dispose');

			this._super();

			delete this.mathfieldArray;
		}

	});
	return growingDoubleListCompnentView;
});