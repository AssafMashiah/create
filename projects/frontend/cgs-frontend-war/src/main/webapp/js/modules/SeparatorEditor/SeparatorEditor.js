define(['BaseContentEditor', 'repo', 'events', './TaskTemplate', './config', './SeparatorEditorPropsView', './SeparatorStageView', 'validate', 'commentsComponent'],
function(BaseContentEditor, repo, events, TaskTemplate, config, SeparatorEditorPropsView, SeparatorStageView, validate, commentsComponent) {

	var SeparatorEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);
			
			this.stage_view = new SeparatorStageView({controller: this});

            this.startPropsEditing();

            this.showStagePreview(null, {bindTaskEvents: true, bindEvents: true});
            
            this.commentsComponent = new commentsComponent({
                data: this.record.data.comments,
                parentRecordId : this.record.id,
                $parent : $(".commentsArea")
            });

            require('validate').isEditorContentValid(this.record.id);
		},
        startPropsEditing: function f1057(cfg) {
            this._super(cfg);
            var config = _.extend({controller: this}, cfg ? cfg : null);
            this.view = new SeparatorEditorPropsView({controller: this});
            this.registerEvents();
        },


		registerEvents: function() {

			var changes = {
				title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
				separatorTitle: this.propagateChanges(this.record, 'separatorTitle', true),
				separatorSubTitle: this.propagateChanges(this.record, 'separatorSubTitle', true),
				separatorImage: this.propagateChanges(this.record, 'separatorImage', true)
                },
                newItemHandler = {'type': 'register', 'func': function f987(args) {
                    //set parent of new created item to be the parent of current element 
                    var parentId = this.record.parent;

                    //in case we want to create a "Lo" item , his parent needs to bee the lesson element
                    if (args.type == "lo") {
                        var lessonParentRecord = repo.getAncestorRecordByType(this.record.id, "lesson");
                        parentId = lessonParentRecord.id;
                    }
                    var itemConfig = _.extend({parentId: parentId}, args);

                    events.fire('createLessonItem', itemConfig);
                   
                }, 'ctx': this, 'unbind': 'dispose'};

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.model.on('change:showImage', this.changePropsValue.bind(this, 'imageViewer'));
            this.model.on('change:showTitle', this.changePropsValue.bind(this, 'genericTitle'));
            this.model.on('change:showSubTitle', this.changePropsValue.bind(this,'genericSubTitle'));

            this.bindEvents(
                {
                    'menu_lesson_item_delete':{'type':'register', 'func': function(){
                        events.fire('delete_lesson_item', this.config.id);},
                        'ctx':this, 'unbind':'dispose'},
                    'repo_separator_changed': {'type':'register', 'func': this.onSeperatorChanged, 'ctx':this, 'unbind':'dispose'},
                    'new_lesson_item':  newItemHandler,
                    'new_differentiated_sequence': { 'type': 'register', 'func': function f988() {
                        events.fire('createDifferentiatedSequence', this.record.parent, this);
                    }, 'ctx': this, 'unbind': 'dispose'},
                    'new_separator': { 'type': 'register', 'func': function (args) {
                            var itemConfig = _.extend({parentId: this.record.parent}, args);
                            events.fire('createSeparator', itemConfig);
                        }, 'ctx': this, 'unbind': 'dispose'}
                });
		},
        changePropsValue : function(type, obj, value){
            repo.startTransaction();
            var changedKey = _.keys(obj.changed)[0];
            repo.updateProperty(this.record.id, changedKey, value);

            var titleToEdit = repo.getChildrenByTypeRecursive(this.record.id, type)[0];
            repo.updateProperty(titleToEdit.id, 'hide', !value);

            //disable or enable the other title checkbox
            if( this.record.data.showImage+ this.record.data.showSubTitle + this.record.data.showTitle === 1 ){
                var propertyToDisable =  this.record.data.showImage ? "showImage" : (this.record.data.showSubTitle ? "showSubTitle" : "showTitle");

                repo.updateProperty(this.record.id, "disable"+ propertyToDisable,  true);
            }else{
                if(_.any([this.record.data.disableshowImage , this.record.data.disableshowSubTitle , this.record.data.disableshowTitle])){
                    var propertyToEnable =  this.record.data.disableshowImage ? "disableshowImage" : (this.record.data.disableshowSubTitle ? "disableshowSubTitle" : "disableshowTitle");
                    repo.updateProperty(this.record.id, propertyToEnable,  false);
                }
            }
            repo.endTransaction();
        
            this.startPropsEditing();
            this.stage_view.render();
            this.renderChildren();

            this.commentsComponent = new commentsComponent({
                data: this.record.data.comments,
                parentRecordId : this.record.id,
                $parent : $(".commentsArea")
            });
            
        },

        dispose: function() {
            events.fire('setActiveEditor', this); // for endEditing of content editors.
            
            this.commentsComponent && this.commentsComponent.dispose();

            this._super();

            delete this.commentsComponent;
        }

	}, {
        type: 'SeparatorEditor',
        template: TaskTemplate.template,
        valid : function(elem_repo) {
            return {valid : true, report : []};
        }
    });

	return SeparatorEditor;

});
