define([], function () {
	return function () {
		var menuItems = [
				{	'label' : '((course.props_area.tab_design.styles_editor))',
					'id' : 'assets-action',
					'type' : 'button',
					'canBeDisabled' : false,
					'subMenuItems'	:[
						{
							'label' : '((course.props_area.tab_design.style_editor.toolbar.font))',
							'type':'btn_split',
							'subMenuItems':[
								{
									'id': 'menu-button-paragraph-fontFamily',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.font))',
									'canBeDisabled' : true,
									'dropDownItems': require('styleAndEffectsUtil').getFontsMenu()
								},
								{
									'id': 'menu-button-paragraph-fontWeight',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.font_weight.tooltip))',
									'canBeDisabled' : true,
									'dropDownItems': require('styleAndEffectsUtil').getFontWeightsMenu()
								},
								{
									'id': 'menu-button-paragraph-fontSize',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.font_size_.tooltip))',
									'canBeDisabled' : true,
									'dropDownItems': require('styleAndEffectsUtil').getFontSizeMenu()
								},
								{
									'id':'menu-button-font-bold',
									'icon':'style-bold',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.bold.tooltip))',
									'event':'setFontWeightStyle',
									'args' :{'cssRules': [{'font-weight':'bold'}],
											'cssDefault': [{'font-weight':'normal'}],
											'buttonType' : 'toggle'},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-font-italic',
									'icon':'style-italic',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.italic.tooltip))',
									'event':'setStyle',
									'args' :{'cssRules': [{'font-style':'italic'}],
											'cssDefault': [{'font-style':'normal'}],
											'buttonType' : 'toggle'},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-font-underline',
									'icon':'style-underline',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.underline.tooltip))',
									'event':'setStyle',
									'args' :{'cssRules': [{'text-decoration' :'underline'}],
											'cssDefault': [{'text-decoration':'none'}],
											'buttonType' : 'toggle'},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-font-upper',
									'icon':'arrow-up',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.superscript.tooltip))',
									'event':'setStyle',
									'args' :{'cssRules': [	{'font-size': '40%'},
															{'vertical-align': 'text-top'}],
											'cssDefault': [	{'removeStyle' : 'font-size'},
															{'removeStyle': 'vertical-align'}],
											'buttonType' : 'toggleRadio',
											'changeLabel' : [{'buttonId' : 'menu-button-paragraph-fontSize',
																'ruleKey' : 'font-size'
															}],
											'radioGroup' :'verticalAlign'},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-font-lower',
									'icon':'arrow-down',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.subscript.tooltip))',
									'event':'setStyle',
									'args' :{'cssRules': [	{'font-size': '40%'},
														{'vertical-align': 'text-bottom'}],
											'cssDefault': [	{'removeStyle' : 'font-size'},
															{'removeStyle': 'vertical-align'}],
											'buttonType' : 'toggleRadio',
											'radioGroup' :'verticalAlign',
											'changeLabel' : [{'buttonId' : 'menu-button-paragraph-fontSize',
																'ruleKey' : 'font-size'
															}]
										},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-font-color',
									'icon':'text2',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.font_color.tooltip))',
									'event':'setStyle',
									'args':{'buttonType' : 'colorPicker', 'property' :'color'},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-font-marker',
									'icon':'marker',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.background_color.tooltip))',
									'args':{'buttonType' : 'colorPicker', 'property' : 'background-color'},
									'event':'setStyle',
									'canBeDisabled' : true
								}
							]
						},
						{
							'label' : '((course.props_area.tab_design.style_editor.toolbar.paragraph))',
							'type':'btn_split',
							'subMenuItems':[
								{
									'id': 'menu-button-paragraph-AlignLeft',
									'icon': 'AlignLeft',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.align_left.tooltip))',
									'event':'setStyle',
									'args' :{ 'buttonType':'radio',
										'radioGroup' :'align',
										'cssRules': [	{'text-align': 'left'}]},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-paragraph-AlignCenter',
									'icon':'AlignCenter',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.align_center.tooltip))',
									'event':'setStyle',
									'args' :{ 'buttonType':'radio',
										'radioGroup' :'align',
										'cssRules': [{'text-align': 'center'}]},
									'canBeDisabled' : true
								},
								{
									'id':'menu-button-paragraph-AlignRight',
									'icon':'AlignRight',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.align_right.tooltip))',
									'event':'setStyle',
									'args' :{ 'buttonType':'radio',
										'radioGroup' :'align',
										'cssRules': [	{'text-align': 'right'}]},
									'canBeDisabled' : true
								},
								{
									'id': 'menu-button-paragraph-style-justify',
									'icon': 'style-justify',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.justify.tooltip))',
									'event':'setStyle',
									'args' :{'buttonType':'radio' ,
										'radioGroup' :'align',
										'cssRules': [	{'text-align': 'justify'}]},
									'canBeDisabled' : true
								},
								{
									'id': 'menu-button-paragraph-lineSpacing',
									'icon': 'lineSpacing',
									'label' : '((course.props_area.tab_design.style_editor.toolbar.line_spacing_tooltip))',
									'canBeDisabled' : true,
									'dropDownItems':[
										{
											'id':'menu-button-lineSpacing-1',
											'label' : '((course.props_area.tab_design.style_editor.toolbar.line_spacing_opt1))',
											'event':'setStyle',
											'args':{'cssRules': [	{'line-height' : 1}]}
										},
										{
											'id':'menu-button-lineSpacing-1_5',
											'label' : '((course.props_area.tab_design.style_editor.toolbar.line_spacing_opt2))',
											'event':'setStyle',
											'args':{'cssRules': [	{'line-height' : 1.5}]}
										},
										{
											'id':'menu-button-lineSpacing-2',
											'label' : '((course.props_area.tab_design.style_editor.toolbar.line_spacing_opt3))',
											'event':'setStyle',
											'args':{'cssRules': [	{'line-height' : 2}]}
										},
										{
											'id':'menu-button-lineSpacing-2_5',
											'label' : '((course.props_area.tab_design.style_editor.toolbar.line_spacing_opt4))',
											'event':'setStyle',
											'args':{'cssRules': [	{'line-height' : 2.5}]}
										},
										{
											'id':'menu-button-lineSpacing-3',
											'label' : '((course.props_area.tab_design.style_editor.toolbar.line_spacing_opt5))',
											'event':'setStyle',
											'args':{'cssRules': [	{'line-height' : 3}]}
										}
									]
								},
								{
									'id':'menu-button-paragraph-LeftIndent',
									'icon':'LeftIndent',
									'label' : '((course.props_area.tab_design.style_editor.increase_indent_tooltip))',
									'event':'setStyle',
									'args':{'buttonType': 'textIndent',
										'property': 'text-indent' ,
										'value': '10',
										'type' :'more' },
									'canBeDisabled' : true
								},
                                {
                                    'id':'menu-button-paragraph-RightIndent',
                                    'icon':'RightIndent',
                                    'label' : '((course.props_area.tab_design.style_editor.decrease_indent_tooltip))',
                                    'event':'setStyle',
                                    'args':{'buttonType': 'textIndent',
                                        'property': 'text-indent' ,
                                        'value': '10',
                                        'type' :'less'},
                                    'canBeDisabled' : true
                                }
							]
						}
					]
				}
		];
		if(!require('styleAndEffectsUtil').isStyle){
			menuItems[0].label = '((course.props_area.tab_design.effect_editor))';
			menuItems[0].subMenuItems.splice(1, 1);
		}else{
			//remove x-up, x-down buttons from style editor
			menuItems[0].subMenuItems[0].subMenuItems.splice(6,2);
		}
		return {
			menuItems : menuItems,
			menuButttonMapping :{
				'align' : [
					'menu-button-paragraph-style-justify',
					'menu-button-paragraph-AlignCenter' ,
					'menu-button-paragraph-AlignLeft',
					'menu-button-paragraph-AlignRight'
				],
				'direction' :[
					'menu-button-paragraph-RTL',
					'menu-button-paragraph-LTR'
				],
				'verticalAlign' : [
					'menu-button-font-upper',
					'menu-button-font-lower'
				]
			}
		};
	};
});