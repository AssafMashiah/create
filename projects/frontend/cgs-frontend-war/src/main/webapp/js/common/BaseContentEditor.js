define(['lodash', 'BaseEditor', 'events', 'repo', 'repo_controllers', 'types', 'validate'],
	function (_, BaseEditor, events, repo, repo_controllers, types, validate) {

	var BaseContentEditor = BaseEditor.extend({

		initialize: function(config, configOverrides) {
			this._super(config, configOverrides);

			this.elementId = this.config.id;
			this.elementType = this.record.type;
            this.elementName = types[this.elementType].fullName ||
                               types[this.elementType].name ||
                               this.elementType;
            // Added by MS, 27.01.14
            this.elementRenderName = this.elementType.replace( /([a-z]+)([A-Z]+)/ , "$1 $2" ).capitalize();

			this.bindEvents({
				'createNewItem':{'type':'register', 'unbind':'never'},
				'add_plugin':{'type':'register', 'unbind':'never'}
			});

            this.initStageView();

		},

		setStageViews: function(views){
			// default views: small + normal
			views.small = views.small || null;
			views.normal = views.normal || null;
			this.stageViews = views;
		},

		getStageView: function(val){

			if (!this.stageViews){
				return null;
			}
			this.viewMode= val || 'normal';
			return this.stageViews[this.viewMode];
		},

		initStageView: function(val){
			var stageViewClass = this.getStageView(val || this.config.stagePreviewMode);

			if (stageViewClass){
				this.stage_view = new stageViewClass({controller:this});
			}
		},

		startEditing: function(event){

			logger.audit(logger.category.EDITOR, "Turning " + this.record.type + " (id: " + this.record.id + ") into edit Mode");

			if(event){
				event.stopPropagation();
			}

			this.needValidate = true;

			events.fire('setActiveEditor', this);
			this.config.previewMode = false;
			this.initMenu();

			this.startPropsEditing && this.startPropsEditing();

			if(this.stage_view){
				this.stage_view.startEditing(event);
			}
			if(this.setButtonsState){
				this.setButtonsState();
			}else if(this.router.activeEditor.setButtonsState){

				this.router.activeEditor.setButtonsState();
			}

			events.fire('init-cgs-hints');
			events.exists('childStartEditing') && events.fire('childStartEditing', this.record.id);


		},

		endEditing: function(){
			if (this.stage_view && this.stage_view.endEditing && _.isFunction(this.stage_view.endEditing)) {
				this.stage_view.endEditing();
			}

			if (this.needValidate) {
				var validationResults = validate.isEditorContentValid(this.record.id);
				this.needValidate = false;
			}
			this._super();

			events.fire('dispose-cgs-hints');
			//fire end editing event for the use of plugins
			events.exists('childEndEditing') && events.fire('childEndEditing', this.record.id);
		},

		startPropsEditing: function(cfg) {
			if (this.view && this.view.dispose && (!cfg || !cfg.appendToSelector)) {
				this.view.dispose();
				delete this.view;
			}
		},

		setSelected: function(){
			if (this.stage_view) {
				events.fire('setSelectedEditor', this);
				this.stage_view.setSelected();
			}
		},

		removeSelected: function(){
			if (this.stage_view) {
				this.stage_view.removeSelected();
			}
		},

		renderChildren: function(childCfg){
			var itemConfig = {bindEvents:true};
			if(childCfg){
				itemConfig =_.extend(itemConfig, childCfg);
			}
			this.disposeChildren(this.record.children);
			//call again showStagePreview which will render all its children, parent isn't relevant cause it's already on DOM
			this.showStagePreview(null, itemConfig);
		},

		disposeChildren: function(children) {
			_.each(children, function(childId) {
				var child = repo.get(childId);
				if (child) {
					this.disposeChildren(child.children);
					var childController = repo_controllers.get(childId);
					if (childController && typeof childController.dispose == 'function') {
						childController.dispose();
					}
				}
			}, this);
		},

		reloadStage: function(reloadFunction) {
			this.stageScroll = $('#stage_base').scrollTop();
			reloadFunction();
			$('#stage_base').scrollTop(this.stageScroll);
		},

		showStagePreview:function ($parent, previewConfig) {
			if (this.stage_view) {
				// Get children to render
				if(!!!this.config.childrenTypesToExcludeFromShowInStage) {
					previewConfig.children = this.record.children;
				}
				else {
					previewConfig.children = repo.getChildrenRecordsWithoutTypes(this.record.id, this.config.childrenTypesToExcludeFromShowInStage);
				}

				// Filter children to render if needed
				if (_.isArray(previewConfig.childrenToRender)) {
					previewConfig.children = _.intersection(previewConfig.children, previewConfig.childrenToRender);
					delete previewConfig.childrenToRender;
				}
				else if (_.isArray(this.record.data.defaultRenderIndices)) {
					previewConfig.children = _.filter(previewConfig.children, function(childId, ind) {
						return this.record.data.defaultRenderIndices.indexOf(ind) > -1;
					});
				}
				this.prepareRenderingConfiguration(previewConfig);

				this.stage_view.showStagePreview($parent, previewConfig);
			}
		},
		prepareRenderingConfiguration : function(parentConfig){
			var reInitStageView = false;
			var previewMode;
			if(this.pluginClassManagerInstance && this.instanceId){
				var extraConfig = this.pluginClassManagerInstance.invoke(this.instanceId, 'getRenderConfiguration');
				if(extraConfig){
					if(extraConfig.previewMode){
						switch(extraConfig.previewMode){
							case "small":
							case "normal":

								reInitStageView = true;
								previewMode = extraConfig.previewMode;
						}
					}
					if(extraConfig.disableSorting !== undefined){
						_.extend(parentConfig, {"disableSorting" : extraConfig.disableSorting});
					}
				}
			}
			//check for configutarion recieved from parent
			if(!reInitStageView && parentConfig.childViewMode){
				reInitStageView = true;
				previewMode = parentConfig.childViewMode;
			}

			if(reInitStageView){
				this.initStageView(previewMode);
				_.extend(parentConfig, {
					"childViewMode" : previewMode,
                    "bindTaskEvents" : true ,
                    "bindStageEvents" : previewMode == "small" ? false : true ,
                    "bindEvents":previewMode == "small" ? false : true
				});
			}
		},

		loadElement: function(elemId){
			require('router').load(elemId);
		},

		createNewItem: function(itemConfig, dontRender) {
			var self = this;
			if (window.customizationPackLoading) {
				require('busyIndicator').start();
				require('busyIndicator').setData(require('translate').tran("customization.pack.is.loading.message"));
				(function() {
					var intervalId = setInterval(function() {
						if (!window.customizationPackLoading) {
							clearInterval(intervalId);
							require('busyIndicator').stop();
							return self.createNewItemWait.call(self, itemConfig, dontRender);
						}
					}, 500);
				})();
			} else {
				return this.createNewItemWait.call(self, itemConfig, dontRender);
			}
		},

		createNewItemWait: function(itemConfig, dontRender){
			var elemId = null;
			var itemTemplate;
			var template;

			if (itemConfig.templatePath) {
				if (itemConfig.templatePath === 'auto') {
					itemTemplate = {
						template: itemConfig.template
					}
				} else {
					itemTemplate = require(itemConfig.templatePath);
				}

				if(itemTemplate.template){
					template = itemTemplate.template;
				}else{
					if(itemTemplate.templates){
						template = itemTemplate.templates[itemConfig.type];
					}
				}
				itemConfig = _.extend({parentId:this.config.id, template:template}, itemConfig);
				logger.debug(logger.category.EDITOR, 'Add new task from template ' + itemConfig.templatePath);
				elemId = repo.addTemplate(itemConfig);

				amplitude.logEvent('Add '+ require("cgsUtil").getAmplitudeValue("interactionType", repo.get(elemId).type), {
                    "Course ID" : repo._courseId,
					"Lesson ID" :require("lessonModel").getLessonId(),
                    "Type" : require("cgsUtil").getAmplitudeValue("format", "NATIVE")
				});
			} else if(itemConfig.template) {
				logger.debug(logger.category.EDITOR, 'Add new template to repo');
				elemId = repo.addTemplate(itemConfig);
			} else {
				if (!itemConfig.insertOnce || repo.getChildrenRecordsByType(this.record.id, itemConfig.type).length < 1) {
					itemConfig = _.extend({parentId:this.config.id}, itemConfig);
					elemId = this.createItem(itemConfig);
				}
			}
			repo.startTransaction({ appendToPrevious: true });

			if(!dontRender) {
				this.renderNewItem && this.renderNewItem(elemId);
			}

			if(this.router && this.router._static_data.activeType != "sequence") {
				//start editing of new added item
				this.elemStartEditing(elemId);
			}

			repo.endTransaction();
			return elemId;
		},

        scrollToItem : function (elemId){

			// scroll to element that is not in view port
			setTimeout(function() {
				//newly added element
				var elem = $('body div#stage_base [data-elementid="' + elemId + '"]');

				if(elem.length){
					elem[0].scrollIntoViewIfNeeded();
				}
            }, 500);
        },

		elemStartEditing: function(elemId) {
			if(elemId) {
				var child_controller = repo_controllers.get(elemId);
				if(child_controller) {
					child_controller.setSelected();
					child_controller.startEditing();
				}
			}
		},

		markValidation: function(val) {
			this.stage_view && this.stage_view.markValidation(val);
		},

		refresh: function(){
			this.view.refresh();
			this.model.off();
			this.registerEvents();
		},

		dontHaveChildren: function(){
			return this.record.children.length === 0 ;
		},

		canBeEditableOnStage: function() {
			return !this.record.data.stageReadOnlyMode && !this.constructor.stageReadOnlyMode;
		},

		buildChildData: function(childType, specialConfiguration) {
			//build data config to element, by its type.
			var childData = {
                "title" : "",
                "width" : "100%",
                "disableDelete":true,
                "isValid": false
            };

			if(childType === "textViewer") {
                _.extend(childData, {"mode" : "singleStyle" });

			} else if(childType === "imageViewer") {
                _.extend(childData, {
                        "dontInputCaption" : true,
                        "dontInputCopyrights" : true,
                        "minimumReadable" : "50"
                    });
			} else {
				//sound button
			}

			if(specialConfiguration){
				if(childType == specialConfiguration.type){
					_.extend( childData, specialConfiguration.data);
				}
			}

			return childData;
		},
		deleteItemAndUpdateEbooks: function(id){
			//delete the element
			var parent = repo.remove(id);

			//update the ebooks list on the lesson, if needed
			require("lessonModel").updateLessonEbooks();
			require("router").load(parent);
		}

	}, {type: 'BaseContentEditor'});

	return BaseContentEditor;

});
