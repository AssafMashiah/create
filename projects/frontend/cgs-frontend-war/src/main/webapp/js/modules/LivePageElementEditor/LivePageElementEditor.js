define(['BaseContentEditor', 'repo', 'repo_controllers', 'editMode', 'validate', 'events', 'files', './config', './LivePageElementPropsView', './LivePageElementStageView', './LivePageElementSmallStageView','appletModel'],
function(BaseContentEditor, repo, repo_controllers, editMode, validate, events, files, config, LivePageElementPropsView, LivePageElementStageView, LivePageElementSmallStageView , appletModel) {

	var LivePageElementEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			if (this.stageViews) {
				this.stageViews.small = LivePageElementSmallStageView;
			}
			else {
				this.setStageViews({
					small: LivePageElementSmallStageView
				});
			}

			if (arguments.length > 1) {
				this._super.apply(this, arguments);
			}
			else {
				this._super(config, configOverrides);
			}
			
			repo.startTransaction({ ignore: true });

			var defaultName = this.record.type + ' '+ repo.getChildrenRecordsByType(this.record.parent, this.record.type).length;

			//default data saves the last state of the inserted book view element
			var defaultData = require('cgsUtil').cloneObject(repo.get(this.record.parent).data.defaultData);
			if(!defaultData){
				defaultData = {};
			}
			//add default data to a newly created element type
			if(!defaultData[this.record.type]){
				defaultData[this.record.type] = {
					"icon": "icon1",
					"width": "42px",
					"height" : "42px",
					"layoutShape" : 'rectangle',
					'layoutStyle': "layoutIcon",
					"color":"#333333"
				};
				repo.updateProperty(this.record.parent, 'defaultData', defaultData);
			}

			//update properties of the book view element, set default data if none exists
			if(!this.record.data.icon)
				repo.updateProperty(this.record.id, 'icon', defaultData[this.record.type].icon, false, true);
			
			if(!this.record.data.width)
				repo.updateProperty(this.record.id, 'width', defaultData[this.record.type].width, false, true);
			
			if(!this.record.data.height)
				repo.updateProperty(this.record.id, 'height', defaultData[this.record.type].height, false, true);

			if(!this.record.data.layoutShape)
				repo.updateProperty(this.record.id, 'layoutShape',  defaultData[this.record.type].layoutShape, false, true);
			
			if(!this.record.data.layoutStyle)
				repo.updateProperty(this.record.id, 'layoutStyle',  defaultData[this.record.type].layoutStyle, false, true);

			if(!this.record.data.color)
				repo.updateProperty(this.record.id, 'color',  defaultData[this.record.type].color, false, true);

			if(!this.record.data.labelText)
				repo.updateProperty(this.record.id, 'labelText', defaultName, false, true);
			
			repo.endTransaction();
			
			this.bindEvents(
				{
					'deleteItem': {'type': 'register', 'ctx':this, 'unbind':'dispose', 'func': function f1024(id, dontShowDeleteNotification) {
							if(dontShowDeleteNotification){
								this.deleteItemById(id);
							}else{
								require('cgsUtil').deleteNotification(this.deleteItemById.bind(this), id);
							}
						}
                    }
				});
		},

		deleteItemById: function (elementId) {
            
            var index = repo.get(repo.get(elementId).parent).children.indexOf(elementId),
            parentEditorId = repo.remove(elementId);

            this.stage_view.$("[data-elementId='"+elementId+"']").remove();

            if (this.router && this.router.activeEditor) {
                this.router.activeEditor.startEditing();
            } else {
                var router = require('router');
                if (router.activeScreen.constructor.type == 'TaskScreen' && router.activeEditor && router.activeEditor.startEditing) {
                    router.activeEditor.startEditing();
                }
                // //change the parent editor to be active after deletion of his son.
                // var parentEditor = repo_controllers.get(parentEditorId);
                // //editor that dont need to be edited(like answers editors) will only fire 
                // parentEditor.startEditing ? parentEditor.startEditing() : events.fire('clickOnStage');
            }

            if (events.exists('contentEditorDeleted')) {
                events.fire('contentEditorDeleted', parentEditorId, index);
            }
            //after delete apply validation on parent
              require('validate').isEditorContentValid(parentEditorId);

        },

		startEditing: function(event){
			if(event){
				event.stopPropagation();
			}

			events.fire('setActiveEditor', this);
			if (!this.config.previewMode) {
				this.initMenu();
			}

			this.startPropsEditing && this.startPropsEditing();

			if(this.stage_view){
				this.stage_view.startEditing(event);
			}
			if(this.setButtonsState){
				this.setButtonsState();
			}else if(this.router.activeEditor.setButtonsState){
				this.router.activeEditor.setButtonsState();
			}
		},

		getGlobalEvents: function() {
			if (this.config.previewMode) {
				return {
					layoutStyle: this.propagateChanges(this.record, 'layoutStyle',  true),
					layoutShape: this.propagateChanges(this.record, 'layoutShape',  true),
					labelText: this.propagateChanges(this.record, 'labelText',  true),
					color: this.propagateChanges(this.record, 'color',  true)
				};
			}
		},

		attachGlobalEvents: function() {
			if (this.config.previewMode) {
				this.model.on('change:layoutStyle', this.onLayoutStyleChange, this);
				this.model.on('change:layoutShape', this.onLayoutShapeChange, this);
				this.model.on('change:labelText', this.refresh, this);
				this.model.on('change:color', this.onColorChange, this);
			}
		},

		startPropsEditing: function(cfg, view){
			
			this._super(cfg);
			var config = _.extend({controller: this}, cfg || null);
			this.view = view ? new view(config) : new LivePageElementPropsView(config);
		},
		onColorChange: function(){

			repo.startTransaction({ appendToPrevious: true });
			var defaultData = require('cgsUtil').cloneObject(repo.get(this.record.parent).data.defaultData);
				defaultData[this.record.type]['color'] = this.record.data.color;
			
			repo.updateProperty(this.record.parent, 'defaultData', defaultData);
			repo.endTransaction();

			this.stage_view.setColor();
		},
		resetColor: function(){
			repo.updateProperty(this.record.id,'color','#333333');
			this.stage_view.setColor();
			this.startPropsEditing();
		},
		
		onLayoutStyleChange: function() {
			
			repo.startTransaction({ appendToPrevious: true });
			this.updateSize(true);
			//update default to the current style + width + height
			var defaultData = require('cgsUtil').cloneObject(repo.get(this.record.parent).data.defaultData);
				defaultData[this.record.type]['layoutStyle'] = this.record.data.layoutStyle;
				defaultData[this.record.type]['width'] = this.record.data.width;
				defaultData[this.record.type]['height'] = this.record.data.height;
				defaultData[this.record.type]['layoutShape'] = this.record.data.layoutShape;
			
			repo.updateProperty(this.record.parent, 'defaultData', defaultData);
			repo.endTransaction();

			this.startPropsEditing();
		},
		//on change of element shape, save it to the default data obj, so the next created element will have the same shape
		onLayoutShapeChange: function(){
			
			repo.startTransaction({ appendToPrevious: true });
			var defaultData = require('cgsUtil').cloneObject(repo.get(this.record.parent).data.defaultData);
				defaultData[this.record.type]['layoutShape'] = this.record.data.layoutShape;
			
			repo.updateProperty(this.record.parent, 'defaultData', defaultData);
			repo.endTransaction();
			
			this.view.changeLayoutShape();
			this.refresh();
		},

		updateSize: function(resetShape) {
			
			if (resetShape) {
				this.updateRecordProps({
					layoutShape: 'rectangle'
				});
			}
			switch (this.record.data.layoutStyle) {
				case 'layoutIcon':
					this.updateRecordProps({
						width: 32,
						height: 32,
						customSize: false
					});
					break;
				case 'layoutText':
					this.updateRecordProps({
						width: 'initial',
						height: 'initial',
						customSize: false
					});
					break;
			}
			this.refresh();
		},
		addDraggable: function(){
			this.stage_view.setDraggable();
		},

		refresh: function() {
			if (this.config.previewMode) {
				this.stage_view.render($('.html_sequence_content'));
				this.stage_view.startEditing();
			}
		},

		uploadIcon: function(ignoreUndo) {
			if (this.constructor.icons && this.constructor.icons[this.record.data.icon]) {
				var path = location.href.replace(location.hash, '').split('/');
				path.pop();
				path.push(this.constructor.icons[this.record.data.icon]);
				this.uploadAndReplace(path.join('/'), $('.style-icon img', this.stage_view.$el), 'src', ignoreUndo);
			}
		},

		uploadAndReplace: function(url, elem, attr, ignoreUndo) {
			files.downloadFile({
				url: url,
				dirname: 'media',
				callback: function(file) {
					elem.attr(attr, file.toURL());
					if (ignoreUndo) {
						repo.startTransaction({ ignore: true });
					}
					else {
						repo.startTransaction({ appendToPrevious: true });
					}
					this.updateRecordProps({
						iconPath: files.removeCoursePath(undefined, undefined, file.fullPath)
					});
					repo.endTransaction();
				}.bind(this)
			});
		},

		// The context of the function is properties view because it called from mustache
		typeIcons: function() {
			var path = location.href.replace(location.hash, '').split('/');
            path.pop();
            var iconsList = [];

            for (var iconKey in this.controller.constructor.icons) {

				var iconPath = this.controller.constructor.icons[iconKey];
				
				iconsList.push({
					'id': iconKey,
					'src': _.union(path, [iconPath]).join('/'),
					'selected': this.controller.record.data.icon == iconKey
				});
            }

            return iconsList;
		},

		// The context of the function is properties view because it called from mustache
		showShape: function() {
			return this.controller.record.data.layoutStyle == 'layoutIcon';
		},

		//update the element position
		updateIconLocation: function(location, isCol){

			var html_sequence=  repo_controllers.get(this.record.parent);
				max = isCol ? parseInt($("img.default_scale").width()) : parseInt($("img.default_scale").height());

			if(html_sequence.record.data.showGrid){
				var gridStep = html_sequence.gridStep;

				location = gridStep * location;
				if(location <= max && location >=0){
					var update = {};
					update[isCol? 'left' : 'top'] =  location;
								
					this.updateRecordProps(update);
					this.refresh();
				}
			}
		},

		getZoom: function() {
			var pdfItem = repo.getAncestorRecordByType(this.record.id, 'html_sequence');
			if (pdfItem) {
				var pdfController = repo_controllers.get(pdfItem.id);
				if (pdfController) {
					return pdfController.record.data.zoom || 100;
				}
			}
			return 100;
		},

		// The context of the function is properties view because it called from mustache
		getIconPath: function() {
			if (this.constructor.icons && this.constructor.icons[this.record.data.icon]) {
				var path = location.href.replace(location.hash, '').split('/');
				path.pop();
				path.push(this.constructor.icons[this.record.data.icon]);
				return path.join('/');
			}
		},

		showEdit: function() {
			return typeof this.openEditor == 'function';
		},

		showRemove: function() {
			return !require('editMode').readOnlyMode;
		},

		updateRecordProps: function(data) {
			repo.startTransaction();
			_.each(data, function(val, key) {
				repo.updateProperty(this.record.id, key, val);
			}, this);
			repo.endTransaction();
		},

		setIconSize: function(){
			this.stage_view.setIconSize();
			repo.updateProperty(this.record.parent, 'currentSize',
				{'width':this.record.data.width,
				'height':this.record.data.height});
		},

		//context is props because its called from mustache
		//show the location buttons in the props
		showLocation : function(){
			var html_sequence=  repo_controllers.get(this.controller.record.parent);
			return html_sequence.record.data.showGrid;
		},

		//return the location matrix
		//context is props because its called from mustache
		locationMatrix: function(){
			var html_sequence=  repo_controllers.get(this.controller.record.parent);
			return html_sequence.record.data.locationMatrix;
		},
		isReadOnly: function(){
			return editMode.readOnlyMode;
		}
		
	}, {
		type: 'LivePageElementEditor',

		valid: function(elem_repo) {
			
			return {
				valid: true,
				report: []
			};
			
		}
	});

	return LivePageElementEditor;

});