define(['BaseContentEditor', 'events', 'styleAndEffectsUtil', 'localeModel', 'repo',
	'./config', './styleAndEffectPropsView', './styleAndEffectStageView'],
function(BaseContentEditor, events, styleAndEffectsUtil, localeModel, repo,  config, styleAndEffectPropsView,	styleAndEffectStageView) {

	var styleAndEffectEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
		
			this.setStageViews({
				small: styleAndEffectStageView,
				normal: styleAndEffectStageView
			});
		
			this.data = styleAndEffectsUtil.getDataForStyleEditor();
			this._super(config, configOverrides);
			this.fillFamiliesLists();
			
            this.render();
            
            this.bindEvents({
				'setStyle': {
					'type':'register',
					'func': this.stage_view.setStyle ,
					'ctx': this.stage_view,
					'unbind':'dispose'
				},
				'setFontStyle': {
					'type':'register',
					'func': this.stage_view.setFontStyle ,
					'ctx': this.stage_view,
					'unbind':'dispose'
				},
				'setFontWeightStyle': {
					'type':'register',
					'func': this.stage_view.setFontWeightStyle ,
					'ctx': this.stage_view,
					'unbind':'dispose'
				},
				'fontSizeDialog': {
					'type':'register',
					'func': this.stage_view.openFontSizeDialog ,
					'ctx': this.stage_view,
					'unbind':'dispose'
				},
				'end_load_of_menu' :{
					'type':'register',
					'func': this.setMenuSelection ,
					'ctx': this,
					'unbind':'dispose'
				}
			});
		},

		changeReferanceStyle: function(selectedStyleId) {
			var selectedStyle = _.find(this.data.additionalStyles, function(style){
				return style.key == selectedStyleId;
			});
			if(selectedStyle){
				this.data.currentReferance = selectedStyle;
				this.stage_view.render();
			}

		},

		updateCssString : function(){
			var cssString ='';
			for (var i = 0; i < this.data.currentItem.cssArray.length; i++) {
				var cssItem = this.data.currentItem.cssArray[i];
				cssString += cssItem.name + ":" + cssItem.value + ";";
			}

			this.data.currentItem.cssString = cssString;
		},

		removeCssProperty: function(property){
			this.data.currentItem.cssArray = _.reject(this.data.currentItem.cssArray, {'name' : property});
			this.updateCssString();
			if(! _.find(this.data.currentItem.cssArray, { name: "font-family" })){
				this.defaultFonts = false;
			}
			
			require('localeModel').setStyleChanges();
			this.render();
		},
		
		fillFamiliesLists: function() {
			var list1 = [
				"Georgia",
				"Times New Roman",
				"Times",
				"Arial",
				"Helvetica",
				"Comic Sans MS",
				"cursive",
				"Tahoma",
				"Geneva",
				"Trebuchet MS",
				"Verdana",
				"Courier New",
				"Courier",
				"David"
				].sort(),
				list2 = [ "sans-serif", "serif","monospace" ].sort();

			var currentFont = _.find(this.data.currentItem.cssArray, { name: "font-family" }),
				font1 = "Arial",
				font2 = "Helvetica",
				font3 = "sans-serif";

			if (currentFont && currentFont.value.indexOf(',') > -1) {
				var fonts = currentFont.value.split(',');
				font1 = list1.indexOf(fonts[0]) > -1 ? fonts[0] : font1;
				font2 = (list1.indexOf(fonts[1]) > -1 && fonts[1] != font1) ? fonts[1] : font2;
				font3 = (fonts.length > 2 && list2.indexOf(fonts[2]) > -1) ? fonts[2] : font3;
				this.defaultFonts = true;
			}
			else {
				this.defaultFonts = false;
			}

			this.family1 = _.map(list1, function(name) {
				return {
					name: name,
					value: name,
					selected: name == font1,
					hidden: name == font2
				}
			});
			this.family2 = _.map(list1, function(name) {
				return {
					name: name,
					value: name,
					selected: name == font2,
					hidden: name == font1
				}
			});
			this.family3 = _.map(list2, function(name) {
				return {
					name: name,
					value: name,
					selected: name == font3
				}
			});
		},

		setFont: function(fontName) {
			if (fontName) {
				var currentFont = _.find(this.data.currentItem.cssArray, { name: "font-family" });
				if (currentFont) {
					currentFont.value = fontName;
					this.updateCssString();
					require('localeModel').setStyleChanges();
					this.stage_view.renderExampleText();
				}
			}
			this.screen.components.menu.extendedConfig = require('cgsUtil').cloneObject(config().menuItems);
			this.screen.components.menu.refreshMenu();
			this.fillFamiliesLists();
			this.startPropsEditing();
		},

		render: function(){
			this.startPropsEditing();
            this.startStageEditing();
			this.setMenuSelection();

		},

		startPropsEditing: function(){
			this._super();
			this.view = new styleAndEffectPropsView({controller:this});
		},

        startStageEditing: function(){
            this.stage_view.render($("#stage_base"));
        },

        setMenuSelection :function(){

			//unselect all menu buttons- and reset to default strings
			$('#sub_menu_base .btn.selected').removeClass('selected');
			events.fire('setMenuButtonState', 'menu-button-paragraph-fontFamily', 'changeLabel', {label: require('translate').tran('course.props_area.tab_design.style_editor.toolbar.font')});
			events.fire('setMenuButtonState', 'menu-button-paragraph-fontWeight', 'changeLabel', {label: require('translate').tran('course.props_area.tab_design.style_editor.toolbar.font_weight.tooltip')});
			events.fire('setMenuButtonState', 'menu-button-paragraph-fontSize', 'changeLabel', {label: require('translate').tran('course.props_area.tab_design.style_editor.toolbar.font_size_.tooltip')});

			//set selection +labels to menu
			for (var i = 0; i < this.data.currentItem.cssArray.length; i++) {
				var style = this.data.currentItem.cssArray[i];
				switch(style.name){
					case 'font-weight':
						if(style.value == 'bold'){
							events.fire('setMenuButtonState', 'menu-button-font-bold', 'select');
						}
						events.fire('setMenuButtonState', 'menu-button-paragraph-fontWeight', 'changeLabel', {label: styleAndEffectsUtil.getWeightName(style.value)});
					break;

					case 'font-style':
						if(style.value == 'italic'){
							events.fire('setMenuButtonState', 'menu-button-font-italic', 'select');
						}
					break;
					case 'text-decoration':
						if(style.value == 'underline'){
							events.fire('setMenuButtonState', 'menu-button-font-underline', 'select');
						}
					break;
					case 'font-size':
						events.fire('setMenuButtonState', 'menu-button-paragraph-fontSize', 'changeLabel', {label: style.value});
					break;
					case 'font-family':
                        events.fire('setMenuButtonState', 'menu-button-paragraph-fontFamily', 'changeLabel', {label: ~style.value.indexOf(",") ? require( "translate" ).tran( "Browser Default" ) : style.value.replace(/'/g, '') });
					break;
					case 'vertical-align':
						if(style.value == 'text-top'){
							events.fire('setMenuButtonState', 'menu-button-font-upper', 'select');
						}
						if(style.value == 'text-bottom'){
							events.fire('setMenuButtonState', 'menu-button-font-lower', 'select');
						}
					break;
					case 'text-align':
						switch(style.value){
							case 'left':
								events.fire('setMenuButtonState', 'menu-button-paragraph-AlignLeft', 'select');
							break;

							case 'right':
								events.fire('setMenuButtonState', 'menu-button-paragraph-AlignRight', 'select');
							break;

							case 'center':
								events.fire('setMenuButtonState', 'menu-button-paragraph-AlignCenter', 'select');
							break;

							case 'justify':
								events.fire('setMenuButtonState', 'menu-button-paragraph-style-justify', 'select');
							break;
						}
					break;
				}

			}
        },

        displayProperty: function() {
			if (this.name === 'font-weight' && this.value === 'inherit') {
				return false;
			}

			return true;
        }

	}, {
		type: 'styleAndEffectEditor'
	});

	return styleAndEffectEditor;

});