define(['BaseContentEditor', './config', 'repo', 'repo_controllers', './HtmlSequenceView', './HtmlSequenceStageView',
    './HtmlSequenceSmallStageView', './HtmlSequencePropsView', 'events', 
    'commentsComponent', 'teacherGuideComponentView', 'standardsModel', 'StandardsList', 'growingListComponentView'],
    function f770(BaseContentEditor, config, repo, repo_controllers, HtmlSequenceView, HtmlSequenceStageView,
              HtmlSequenceSmallStageView, HtmlSequencePropsView, events, 
              commentsComponent, teacherGuideComponentView, standardsModel, StandardsList, growingListComponentView) {

        var HtmlSequenceEditor = BaseContentEditor.extend({

            minZoom: 10,
            maxZoom: 400,
            zoom: 'fit_to_page',
            zoomStep: 10,
            gridStep: 54, // px

            initialize: function f771(configOverrides) {

                this.setStageViews({
                    small: HtmlSequenceSmallStageView,
                    normal: HtmlSequenceStageView
                });

                this._super(config, configOverrides);

                this.startPropsEditing();

                this.showStagePreview($('#stage_base'), {bindTaskEvents: true, bindEvents: true, stagePreviewMode: 'small'});

                //initialize comments component that allows the user the add comments in the html sequence editor
                this.commentsComponent = new commentsComponent({
                    data: this.record.data.comments,
                    parentRecordId: this.record.id,
                    $parent: $(".commentsArea")
                });
            },

            registerEvents: function f772() {
                var changes = {
                    title: this.propagateChanges(this.record, 'title', true),
                    teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true)
                };

                this.model = this.screen.components.props.startEditing(this.record, changes);
                var newItemHandler = {
                    'type': 'register',
                    'func': function f773(args) {
               
                        //set parent of new created item to be the parent of current element 
                        var parentId = this.record.parent;

                        //in case we want to create a "Lo" item , his parent needs to bee the lesson element
                        if (args.type == "lo") {
                            var lessonParentRecord = repo.getAncestorRecordByType(this.record.id, "lesson");
                            parentId = lessonParentRecord.id;
                        }
                        var itemConfig = _.extend({parentId: parentId}, args);

                        events.fire('createLessonItem', itemConfig);
                    },
                    'ctx': this,
                    'unbind': 'dispose'
                };

                this.bindEvents({
                    'pdf_convert_sequence': {
                        'type': 'register',
                        'func': this.edit,
                        'ctx': this,
                        'unbind': 'dispose'
                    },
                    'html_sequence_del': {
                        'type': 'register',
                        'func': function f774() {
                            events.fire('delete_lesson_item', this.config.id);
                        },
                        'ctx': this, 'unbind': 'dispose'
                    },
                    'menu_lesson_item_delete':{'type':'register', 'func': function(){
                            events.fire('delete_lesson_item', this.config.id);
                        },
                        'ctx':this, 'unbind':'dispose'
                    },
                    'new_lesson_item': newItemHandler,
                    'new_differentiated_sequence': { 'type': 'register', 'func': function f775() {
                        events.fire('createDifferentiatedSequence', this.record.parent, this);
                    }, 'ctx': this, 'unbind': 'dispose'},
                    'new_separator': { 'type': 'register', 'func': function (args) {
                        var itemConfig = _.extend({parentId: this.record.parent}, args);
                        events.fire('createSeparator', itemConfig);
                    }, 'ctx': this, 'unbind': 'dispose'},
                    'createNewItem': {'type': 'bind', 'func': this.createNewItem,
                            'ctx': this, 'unbind': 'dispose'},
                    'createNewApplet':{'type':'register', 'unbind':'dispose', 'func': this.createNewApplet, 'ctx':this},
                    'pdfZoomOut': { 'type':'register', 'unbind':'dispose', 'func': this.changeZoom.bind(this, false), 'ctx':this },
                    'pdfZoomIn': { 'type':'register', 'unbind':'dispose', 'func': this.changeZoom.bind(this, true), 'ctx':this },
                    'pdfFitToPage': { 'type':'register', 'unbind':'dispose', 'func': this.fitToPage, 'ctx':this },
                    'openSubMenu': {'type': 'bind', 'func': this.setZoom, 'ctx': this, 'unbind': 'dispose'},
                    'pdfToggleGrid' : {'type': 'register','unbind':'dispose','func': this.updateGridProperty, 'ctx':this}
                });
            },

            startPropsEditing: function() {
                this.teacherGuideComponent && this.teacherGuideComponent.dispose();
                this.standardsList && this.standardsList.dispose();
                
                this._super();
                this.view = new HtmlSequencePropsView({ controller: this });

                this.registerEvents();


                this.teacherGuideComponent = new teacherGuideComponentView({
                    el: '.teacherGuide-placeholder',
                    data: this.model.get('teacherGuide'),
                    title: 'teacherGuide',
                    column_name: 'teacherGuide',
                    update_model_callback: _.bind(function f995(data) {
                        this.model.set('teacherGuide', data);
                    }, this)
                });

	            if (this.enableStandards) {
		            this.standardsList = new StandardsList({
			            itemId: '#standards_list',
			            repoId: this.record.id,
			            getStandardsFunc: function f997() {
				            return standardsModel.getStandards(this.record.id);
			            }.bind(this)
		            });
	            }
            },

            getModelId: function f776() {
                return repo.set({
                    'type': 'pdf',
                    'parent': this.record.id,
                    'children': [],
                    'data': {
                        'title': this.record.title,
                        'html': null,
                        'image': null,
                        'disableDelete': true
                    }
                });
            },

            createNewApplet: function(args){
                args.parentId = this.config.id;
                require('appletModel').showAppDialog(args);
            },

            edit: function f777() {
                this.router.load(this.getModelId());
            },

            renderNewItem: function (elemId) {
                this.router.load(this.config.id);
                var child = repo.get(elemId);
                var newController = repo_controllers.get(this.record.id);
                if (newController) {
                    newController.zoom = this.record.data.zoom;
                    newController.setZoom();
                }
                var childController = repo_controllers.get(elemId);
                if (childController) {
                    if (child.type == 'livePageAppletWrapper' && typeof childController.openEditor == 'function') {
                        childController.openEditor();
                    }
                    else {
                        childController.startEditing();
                        childController.setSelected();
                    }
                }
            },

            changeZoom: function(isIn) {
                var zoom = this.record.data.zoom;
                if (isIn && zoom < this.maxZoom) {
                    zoom += this.zoomStep;
                }
                else if (!isIn && zoom > this.minZoom) {
                    zoom -= this.zoomStep;
                }
                repo.updateProperty(this.record.id, 'zoom', zoom);
                this.setZoom();
            },

            fitToPage: function() {
                var container = this.stage_view.getContainerDimensions(),
                    pdf = this.stage_view.getPdfDimensions(),
                    newZoom;

                if (pdf.x > container.x) {
                    newZoom = container.x * 100 / pdf.x;
                }

                newZoom = Math.floor(newZoom / 10) * 10;
                var zoom = newZoom < this.minZoom ? this.minZoom : (newZoom > this.maxZoom ? this.maxZoom : newZoom);
                repo.startTransaction({ ignore: true });
                repo.updateProperty(this.record.id, 'zoom', zoom);
                repo.endTransaction();
                this.setZoom();
            },

            setZoom: function() {
                events.fire('setMenuButtonState', 'menu-button-zoom-percent', 'setValue', { value: (this.record.data.zoom || this.zoom) + '%' });
                this.stage_view.setZoom(this.record.data.zoom);
            },

            /*displays the grid if nedded*/
            checkShowGrid : function(){
                if(this.record.data.showGrid){
                    this.toggleGrid();
                }
            },
            /*display/hide the grid*/
            toggleGrid: function(){
                this.stage_view.toggleGrid(this.record.data.showGrid, this.record.data.zoom);
            },
            /*toggle the show grid, and apply change */
            updateGridProperty: function(){
                repo.updateProperty(this.record.id, 'showGrid', !this.record.data.showGrid);
                this.toggleGrid();
                this.startPropsEditing();
            },
            addDraggable: function(){
                for (var i = 0; i < this.record.children.length; i++) {
                    repo_controllers.get(this.record.children[i]).addDraggable();
                }
            },

            dispose: function() {
                this.commentsComponent && this.commentsComponent.dispose();
                this.teacherGuideComponent && this.teacherGuideComponent.dispose();
                this.standardsList && this.standardsList.dispose();

                this._super();

                delete this.commentsComponent;
                delete this.teacherGuideComponent;
                delete this.standardsList;
            }

        }, {type: 'HtmlSequenceEditor'});

        return HtmlSequenceEditor;

    });
