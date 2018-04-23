define(['mustache', 'events', 'BaseStageContentView', 'styleAndEffectsUtil',
	'text!modules/styleAndEffectEditor/templates/styleAndEffectStage.html',
	'text!modules/styleAndEffectEditor/templates/detailsSection.html'],
	function(mustache, events, BaseStageContentView, styleAndEffectsUtil, template ,detailsSection) {

		var styleAndEffectStageView = BaseStageContentView.extend({

			initialize: function(options) {
				this.template = template;
				this._super(options);
			},
			render: function($parent){
				var $elem = $parent;
				if(!$elem){
					$elem = this.$el;
				}

				var loremIpsumStrings = styleAndEffectsUtil.getLoremIpusmStrings();

				$elem.html(mustache.render(template,  $.extend(this, {
					'lorem_Ipsum_part1' : loremIpsumStrings.lorem_Ipsum_part1,
                    'lorem_Ipsum_part2' : loremIpsumStrings.lorem_Ipsum_part2,
                    'lorem_Ipsum' : loremIpsumStrings.lorem_Ipsum
				}),{'details':detailsSection} ));
				this.$el = $elem;
				this.bindEvents();
				this.setLineHeight();
			},
			//sets the height so all the text will apear not cut
			setLineHeight : function(){

				//reference text area
				this.$('.referanceExampleText').css('height', styleAndEffectsUtil.getSmapleTextDivHeight(this.$('.referanceExampleText')));
				
				//example text area
				this.$('.editableTextExample').css('height', styleAndEffectsUtil.getSmapleTextDivHeight(this.$('.editableTextExample')));
			},
			bindEvents: function(){
				this.$('#referanceSelectBox').val(this.controller.data.currentReferance.key);
				this.$('#referanceSelectBox').change(this.changeReferanceStyle.bind(this));
				this.$('.detailArea').click(this.displayDetails.bind(this));
			},

			setStyle : function(args){
				if(args.buttonType){

					this['set_'+args.buttonType](args);
				}else{
					this.set_default(args);
				}
				if(args.changeLabel){
					for (var i = 0; i < args.changeLabel.length; i++) {
						var currentStyle = _.find(this.controller.data.currentItem.cssArray, function(cssRule){
							return cssRule.name == args.changeLabel[i].ruleKey;
						});
						events.fire('setMenuButtonState', args.changeLabel[i].buttonId, 'changeLabel', {label: currentStyle ? currentStyle.value : args.changeLabel[i].ruleKey });
					}
				}
				
				this.controller.updateCssString();
				
				require('localeModel').setStyleChanges();
				this.renderExampleText();

			},

			setFontStyle: function(args) {
				args.cssRules.push({
					'font-weight': $('#menu-button-font-bold').hasClass('selected') ? 'bold' : 'normal'
				});

				this.set_default(args);

				this.controller.updateCssString();

				require('localeModel').setStyleChanges();
				this.renderExampleText();

				this.controller.setFont();
			},

			setFontWeightStyle: function(args) {
				//event is fired from bold button
				if(args.buttonType == 'toggle'){
					this.set_toggle(args);
				}else{
					//event is fired from weight drop down
					events.fire('setMenuButtonState', 'menu-button-font-bold', 'unselect');
					this.set_default(args);
				}

				this.controller.updateCssString();
				require('localeModel').setStyleChanges();

				//change the weight drop down label to the current weight
				var currentWeight = _.where(this.controller.data.currentItem.cssArray, {'name': 'font-weight'});
				if(currentWeight.length){
					
					var weightName = styleAndEffectsUtil.getWeightName(currentWeight[0].value);
					events.fire('setMenuButtonState', 'menu-button-paragraph-fontWeight', 'changeLabel', {label: weightName});
					if(weightName == 'bold'){
						events.fire('setMenuButtonState', 'menu-button-font-bold', 'select');

					}
				}
				
				this.renderExampleText();
			},

			set_default: function(args){
				for(var rule in args.cssRules){
					var cssRuleToAdd = args.cssRules[rule];

					this.setStyleProperty(_.keys(cssRuleToAdd)[0] , _.values(cssRuleToAdd)[0]);
				}

			},

			set_textIndent: function(args){
				var currentStyle = _.find(this.controller.data.currentItem.cssArray, function(cssRule){
					return cssRule.name == args.property;
				});
				var value = 0;
				if(currentStyle){
					value = parseInt(currentStyle.value);
				}
				if(args.type == 'more'){
					value += parseInt(args.value);
				}else{
					value -= parseInt(args.value);
					if(value < 0){
						value = 0;
					}
				}
				
				this.setStyleProperty(args.property , (value+'%'));
			},
			set_toggleRadio : function(args){
				this.set_toggle(args);
				//update menu buttons
				_.each(this.controller.config().menuButttonMapping[args.radioGroup], function(id){
					if(id !== args.id){
						events.fire('setMenuButtonState', id, 'unselect');
					}
				});
			},

			set_toggle : function(args){
				var rulesToAdd = args.cssRules;
				var classForManu = 'select';
				if($("#"+args.id).hasClass('selected')){
					rulesToAdd = args.cssDefault;
					classForManu = 'unselect';
				}

				for(var rule in rulesToAdd){
					var cssRuleToAdd = rulesToAdd[rule];

					this.setStyleProperty(_.keys(cssRuleToAdd)[0] , _.values(cssRuleToAdd)[0]);
				}
				events.fire('setMenuButtonState', args.id, classForManu);

			},

			set_radio : function(args){
				var rulesToAdd = args.cssRules;

				if(!$("#"+args.id).hasClass('selected')){

					for(var radioRule in rulesToAdd){
						var cssRuleToAdd = rulesToAdd[radioRule];
						this.setStyleProperty(_.keys(cssRuleToAdd)[0] , _.values(cssRuleToAdd)[0]);
					}
				}
				//update menu buttons
				_.each(this.controller.config().menuButttonMapping[args.radioGroup], function(id){
					if(id == args.id){
						events.fire('setMenuButtonState', id, 'select');
					}else{
						events.fire('setMenuButtonState', id, 'unselect');
					}
				});

			},

			set_colorPicker : function(args){
				var self = this;
				//unbind change event (might still be binded when the user click 'cancel')
				$('#colorPicker').unbind('change');

				//set the currnt value to color picker
				var currentValue  = _.where(this.controller.data.currentItem.cssArray, {'name' :args.property });
				if(currentValue.length){
					$('#colorPicker').val(currentValue[0].value);
				}

				$('#colorPicker').one('change', function(e){
					self.setStyleProperty(args.property , e.target.value);
					self.controller.updateCssString();
					require('localeModel').setStyleChanges();
					self.renderExampleText();
				}).trigger('click');
			},
			


			setStyleProperty : function(styleKey, styleValue){
				if(styleKey == 'removeStyle'){
					for (var i = 0; i < this.controller.data.currentItem.cssArray.length; i++) {
						if( this.controller.data.currentItem.cssArray[i].name == styleValue){
							this.controller.data.currentItem.cssArray.splice(i,1);
							break;
						}
					}
				}else{

					var currentStyle = _.find(this.controller.data.currentItem.cssArray, function(cssRule){
						return cssRule.name == styleKey;
					});
					//css rule exists in the currnt style, neet to override it
					if(currentStyle){
						currentStyle.value = styleValue;
					}else{
						//create a new css rule
						this.controller.data.currentItem.cssArray.push({
							'name': styleKey,
							'value':  styleValue
						});
					}
				}
			},

			renderExampleText :function(){
				$('.example').attr('style',this.controller.data.currentItem.cssString);
				this.controller.startPropsEditing();
				this.setLineHeight();
			},

			changeReferanceStyle: function(e) {
				this.controller.changeReferanceStyle($(e.srcElement).val());
			},

			displayDetails : function(e){
				if($(e.srcElement).parents('.details').hasClass('open')){
					$(e.srcElement).parents('.details').removeClass('open');
				}else{
					$(e.srcElement).parents('.details').addClass('open');
				}
			},
			openFontSizeDialog: function(){
				var dialogConfig = {
					title: "Font Size",
					buttons:{
						'yes': { label:'OK',canBeDisabled: true },
						'cancel': { label:'Cancel'}
					},
					isStyle: styleAndEffectsUtil.isStyle
				};

				events.once('onFontSizeDialogClose', function(val) {
					if(val!=='cancel' && val !== undefined){
	
						var args = {
							'changeLabel' : [{'buttonId' : 'menu-button-paragraph-fontSize',
											'ruleKey' : 'font-size'
											}],
							'cssRules': [	{'font-size' : val + (styleAndEffectsUtil.isStyle? 'px' : '%')}]
						};
						this.setStyle(args);
					}
				}, this);

				require('dialogs').create('fontSize', dialogConfig, 'onFontSizeDialogClose');
			},

		}, {type: 'styleAndEffectStageView'});

return styleAndEffectStageView;

});
