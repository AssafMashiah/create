define(['modules/Dialogs/BaseDialogView', 'modules/Dialogs/types/theming/config', 'mustache', 'preview',
	'localeModel', 'repo', 'text!modules/Dialogs/types/theming/themingDialog.html',
	'text!modules/Dialogs/types/theming/configurationSection.html'],
function(BaseDialogView, config, mustache, preview, localeModel, repo, template, partial) {

	var themingDialog = BaseDialogView.extend({
		events: {
            'change #sectionSelection': 'changeSection',
            'change .data' : 'valueChanged',
            'click #applyPlayerPreview' : 'applyPreview',
            'click #reset':'resetData'
        },

		initialize: function (options) {
			this.customTemplate = template;
			//current player in edit
			this.playerType = this.options.config.playerType;

			this._super(options);
			//get defaults values and scehma for the theming
			this.defaultData = localeModel.getThemingDefaults();
			
			//get currently saved data of theming
			this.themingData = localeModel.getThemingData();
			var savedData = localeModel.getSavedTheming();
			var mappedData = this.mapData();
			//if no data, set the saved data or default data
			if(!this.themingData){
				this.themingData = savedData ? savedData : mappedData;
			}
			if(!this.themingData[this.playerType]){
				this.themingData[this.playerType] = (savedData && savedData[this.playerType]) ? savedData[this.playerType] : mappedData[this.playerType];
			}

			this.dataToModel();
		},

		//add the default data to the model 
		mapData: function(){
			var themingData = require('cgsUtil').cloneObject(this.defaultData);
			var ans = {};

			for (var playerType in themingData) {
				var player = themingData[playerType];
				
				for (var i = 0; i < player.length; i++) {
					var section = player[i];
					var sectionId = section.area;
					
					for (var j = 0; j < section.properties.length; j++) {
						var propertyId = section.properties[j].label,
						value = section.properties[j].default;

						//apply the default data in the model, accept for 'default locale font', which will be decided in the DL according to the current font locale'
						if(value !== "defaultLocaleFont")
							this.saveNewValueInModel(ans ,playerType, sectionId, propertyId, value);
					}
				}
			}
			return ans;
		},

		render: function ($parent) {

			this._super($parent, this.customTemplate, this.model, {currectSection : partial});
			this.bindModelEvents();

			//area where the DL-ppreview will be displayed
            this.previewSection = $( "#previewSection" );
            
            this.applyPreview();
            //set the save button to be disabled
			this.changeSaveButtonState();

		},

		/*add bindings between two or more fields */
		bindModelEvents: function(){
			//find fields with bindings
			var itemsToBind = _.filter(this.model.currectSection, function(item){
				return item.binding && item.binding.length;
			});

			for (var i = 0; i < itemsToBind.length; i++) {
				var bindings = itemsToBind[i].binding;
				
				for (var j = 0; j < bindings.length; j++) {
					var bindingObj = bindings[j];
					var self = this;
					
					//bind the action to future change
					this.$('#themingDialog #' +itemsToBind[i].label).change(function(e){
						if(this.value.indexOf(e.target.value) > -1){
							
							self.bindingActions[this.action].call(self, this.labels);
						}
					}.bind(bindingObj));

					//activate the action to current state
					if(bindingObj.value.indexOf(this.$('#themingDialog #' +itemsToBind[i].label+" .data").val()) > -1 ){
						this.bindingActions[bindingObj.action].call(self, bindingObj.labels);
					}
				}
			}
		},

		//object width functions that are activated from model bindings
		bindingActions :{
			//show action- from model bindings
			show: function(labels){
				for (var i = 0; i < labels.length; i++) {
					this.$('#themingDialog #'+labels[i]).show();
				}
			},
			//hide action - from model bindings
			hide: function(labels){
				for (var i = 0; i < labels.length; i++) {
					this.$('#themingDialog #'+labels[i]).hide();
				}
			}
		},

		//render the dl
		applyPreview : function(){
			var self = this;
			require('busyIndicator').start();
			//copy the customization pack locally and set there the current themeing data 
			localeModel.setTmpCustomizationPack(this.themingData, function(){

				var width = self.previewSection.width(),
				height = self.previewSection.height();
				var repoData = config.getRepoData(repo.get(repo._courseId).data.contentLocales[0], self.sectionId);

				preview.playDl({
                    parent: self.previewSection,
                    width: width,
                    height: height,
                    data: repoData.data,
                    seqId: repoData.id,
                    localeNarrations: [],
					media: require("assets").absPath("/"),
                    customizationPackPath: 'tmpCustomizationPack/'
                });

			});
		},

		//get data for easy rendering
		dataToModel: function(sectionId){
			var self = this;

			this.model = {};

			this.model.sections = _.map(this.defaultData[this.playerType], function(item){
				return {
					name: 'course.props_area.tab_design.players_table.edit.pop_up.sections.'+ item.area,
					value: item.area,
					selected : item.area == sectionId
				};
			});
			//curent section in edit
			var currectSection;
			if(sectionId){
				currectSection = _.find(this.defaultData[this.playerType], {'area' : sectionId});
			}else{
				currectSection = this.defaultData[this.playerType][0];
			}

			this.sectionId = currectSection.area;
			
			this.model.currectSection = _.map(currectSection.properties, function(item){

				var currentValue = self.themingData &&
					self.themingData[self.playerType] &&
					self.themingData[self.playerType][self.sectionId] &&
					self.themingData[self.playerType][self.sectionId][item.label];
					if(!currentValue){
						currentValue = _.find(_.find(self.defaultData[self.playerType], {'area':self.sectionId}).properties, {'label': item.label}).default;
					}
				
				if(item.type == 'dropDown'){
					item.mappedValues = _.map(item.values, function(dropDownValue){
						return{
							'value' : dropDownValue,
							'name' : 'course.props_area.tab_design.players_table.edit.pop_up.properties.'+self.sectionId+"."+item.label+"."+dropDownValue,
							'selected' : dropDownValue == currentValue
						};

					});
				}
				if(item.type == 'font'){
					item = require('cgsUtil').cloneObject(item);
					item.type = 'dropDown';
					self.prepareFontMenu();
					item.mappedValues = require('cgsUtil').cloneObject(self.fontMenu);

					var selected = _.find(item.mappedValues, {'value' : currentValue });
					if(selected){
						selected.selected= true;
					}
				}
				return $.extend(item,
					{
						value : currentValue,
						isDropDown : item.type == 'dropDown',
						isColor : item.type == 'color',
						isNumber : item.type == 'number',
						isRange: item.type =='range'
					});
			});
		},

		modelToData: function(){
			return this.themingData;
		},

		//render the properties area and re-init the dl
		changeSection: function(e){
			this.renderPartial(e.srcElement.value);
			this.applyPreview();
		},

		renderPartial : function(sectionId){
			this.dataToModel(sectionId);
			this.$('#configurationSection').html(mustache.render(partial, this.model));
			this.bindModelEvents();

		},

		//on each value change, save the new value in a tmp area
		valueChanged: function(e){
			var $element = $(e.srcElement);

			var propertyId = $element.parents('.properties-row').attr('id'),
			value = e.srcElement.value,
			isValidValue = e.target.validity.valid;

			if(!isValidValue){
				var valueToPut;
				//get last saved value
				try{
					valueToPut= this.themingData[this.playerType][this.sectionId][propertyId];
				}
				catch(err){
					//get the default value
					valueToPut = _.find(_.find(this.defaultData[this.playerType], {'area':this.sectionId}).properties, {'label': propertyId}).default;
				}
				e.srcElement.value = valueToPut;
				return;

			}
			this.saveNewValueInModel(this.themingData, this.playerType, this.sectionId, propertyId, value);

			//in case of choosing empty font, we will delete it from the model, so the Player can display the default value
			if(value == ""){
				delete this.themingData[this.playerType][this.sectionId][propertyId];
			}
			//enable the save button
			this.changeSaveButtonState(true);

		},
		saveNewValueInModel : function(model, playerType, sectionId, propertyId, value){
			if(!model){
				model = {};
			}
			if(!model[playerType]){
				model[playerType] = {};
			}
			if(!model[playerType][sectionId]){
				model[playerType][sectionId] = {};
			}

			model[playerType][sectionId][propertyId] = value;

		},

		//click on close or save 
		beforeTermination: function(e){
			//if the cancel button was pushed continue with closing the dialog
			if (e.target.id === "cancel"){
				preview.terminatePlayers(function() {
					console.info('preview terminated');
				});
				return true;
            }else{
				//save button was pushed, dont close the dialog. 
				//save the tmp themeing data to the locale model(still not saved in course)
				localeModel.updateTheming(this.modelToData(), this.playerType);
				//disable save button
				this.changeSaveButtonState();
				return "cancel_terminate";
            }
		},

		//reset the current theming data to the latest saved (in the current section only)
		resetData: function(){
			var savedData = localeModel.getSavedTheming();
			if(this.themingData && this.themingData[this.playerType]){
				var lastSavedValue = (savedData&& savedData[this.playerType] && savedData[this.playerType][this.sectionId]) || {};
				this.themingData[this.playerType][this.sectionId] = lastSavedValue;
				this.renderPartial(this.sectionId);
			}

		},
		
		changeSaveButtonState: function(enable){
			if(enable){
				this.$("#dialogControls #yes").removeAttr('disabled');
			}else{
				this.$("#dialogControls #yes").attr('disabled','disabled');
			}
		},
		prepareFontMenu : function(){
			if(!this.fontMenu){
				var model = require('styleAndEffectsUtil').getModel();
				if (!model) return;
				
				this.fontMenu = _.chain(model.fonts)
				.map(function(font) {
					var family = _.find(font.cssArray, { 'name': 'font-family' });
					if(family && family.value.indexOf('/') > -1 ){
						return null;
					}
					return family && family.value;
				})
				.compact()
				.uniq(true)
				.map(function(fontName) {
					return {
						'name' : fontName.replace(/'/g, ''),
						'value' : fontName
					};
				}).value();

				var defaultFontList = [
					"Rokkitt",
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
					"Courier"
				];
				this.fontMenu = this.fontMenu.concat(_.map(defaultFontList, function(fontName){
					return{
						'name' : fontName,
						'value' : "'"+ fontName + "'"
					};
				}));

				this.fontMenu.unshift({
					'name': 'course.props_area.tab_design.players_table.edit.pop_up.defaultFont',
					'value': ''
				});
			}
		}
	}, {
		type: 'themingDialog'
	});

	return themingDialog;

});