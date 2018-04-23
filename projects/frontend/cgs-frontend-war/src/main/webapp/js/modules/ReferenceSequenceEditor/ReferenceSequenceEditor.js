define(['BaseEditor', 'restDictionary', 'repo', 'assets', 'events', './config', './ReferenceSequencePropsView', './ReferenceSequenceStageView', 'validate', 'commentsComponent'],
function(BaseEditor, restDictionary, repo, assets, events, config, ReferenceSequencePropsView, ReferenceSequenceStageView, validate, commentsComponent) {

	var ReferenceSequenceEditor = BaseEditor.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);

			
            //get the reference sequence breadcrumbs,
            //this function is async because it might call the server for the lesson
            this.getSequenceBreadcrumbs(function(){

                this.view = new ReferenceSequencePropsView({controller: this});
                this.stage_view = new ReferenceSequenceStageView({controller: this});


                this.registerEvents();

                this.commentsComponent = new commentsComponent({
                    data: this.record.data.comments,
                    parentRecordId : this.record.id,
                    $parent : $(".commentsArea")
                });
            }.bind(this));

        },
        getSequenceBreadcrumbs: function(callback){
            var referenceLessonId = this.record.data.referencedLessonId;
            var breadcrumbs;
            //if we have the sequence data from the repo it means we are in the same reference lesson
            var sequenceItem = repo.get(this.record.data.referencedSequenceId);
            if(sequenceItem){
                breadcrumbs = '';
                // add sequence ancestors to bread crumbs -> course, toc, lesson, lo
                var sequenceAncestors = repo.getAncestors(this.record.data.referencedSequenceId);
                    for (var i = sequenceAncestors.length - 1; i >= 0; i--) {
                        breadcrumbs += sequenceAncestors[i].data.title + " > ";
                    }
                    // add also the sequence to the breadcrumbs
                    breadcrumbs += sequenceItem.data.title;

                repo.updateProperty(this.record.id, 'breadcrumbs', breadcrumbs, false, true);
                callback();
            }

            updateBreadcrumbs = function(){
                var lessonJson = require('lessonModel').referenceSequenceMapping[referenceLessonId].lessonJson,
                    sequenceId = this.record.data.referencedSequenceId,
                    courseObject = repo.get(repo._courseId),
                    found = false,
                    ancestorsIndex, ancestors, loIndex, sequenceIndex, lo, sequence,lessonAncestors;
                breadcrumbs = '';
                
                //check if breadcrumbs for the specific sequence was already generated
                if(require('lessonModel').referenceSequenceMapping[referenceLessonId][sequenceId]){
                    return;
                }
                //add to breadcrumbs : course -> tocs 
                lessonAncestors = repo.getAncestors(referenceLessonId);
                for (ancestorsIndex = lessonAncestors.length - 1; ancestorsIndex >= 0; ancestorsIndex--) {
                    ancestors = lessonAncestors[ancestorsIndex];
                    breadcrumbs += ancestors.data.title + " > ";
                }
                //add to breadcrumbs : lesson
                breadcrumbs += repo.get(referenceLessonId).data.title +" > ";
                
                //add to breadcrumbs : lo -> sequence
                for (loIndex = lessonJson.learningObjects.length - 1; loIndex >= 0; loIndex--) {
                    lo = lessonJson.learningObjects[loIndex];
                    for (sequenceIndex = lo.sequences && lo.sequences.length - 1; sequenceIndex >= 0; sequenceIndex--) {
                        sequence = lo.sequences[sequenceIndex];
                        
                        //reference sequence found
                        if(sequence.cid == sequenceId){
                            //in case we have a course without lo, the server returns a dummy lo,
                            // we dont want to present it
                            if(courseObject.data.includeLo){
                                //add to breadcrumbs : lo
                                breadcrumbs += lo.title + " > ";
                            }
                            //add to breadcrumbs : sequence
                            breadcrumbs += sequence.title;
                            //save the breadcrumbs of the sequence for future use
                            require('lessonModel').referenceSequenceMapping[referenceLessonId][sequenceId] = breadcrumbs;
                            found = true;
                            break;
                        }
                    }
                    if(found){
                        break;
                    }
                }
                repo.updateProperty(this.record.id, 'breadcrumbs', breadcrumbs , false, true);
            };
            //check if we called the server for the data of this specific lesson
            if(require('lessonModel').referenceSequenceMapping[referenceLessonId]){
                updateBreadcrumbs.call(this);
                callback();
            }else{
                //call server for data about the referenced lesson
                var daoConfig = {
                    path: restDictionary.paths.GET_TOC_ITEM,
                    pathParams: {
                        publisherId: require('userModel').getPublisherId(),
                        courseId: repo._courseId,
                        lessonId: referenceLessonId,
                        itemType: 'lesson'
                    },
                    data: {}
                };

                require('dao').remote(daoConfig, function (lessonJson) {
                    //save data from server about the lesson for future use.
                    //this data is re-initialized in every entrance to lesson screen
                    require('lessonModel').referenceSequenceMapping[referenceLessonId] ={};
                    require('lessonModel').referenceSequenceMapping[referenceLessonId]['lessonJson'] = lessonJson;
                    updateBreadcrumbs.call(this);

                    callback();
                }.bind(this));

            }

        },

        startPropsEditing: function() {
            // prevent super start editing
        },

		registerEvents: function() {

			var changes = {
				title: this.propagateChanges(this.record, 'title', validate.requiredField, true)
                },

                newItemHandler = {'type': 'register', 'func': function f983(args) {
                    //set parent of new created item to be the parent of current element 
                    var parentId = this.record.parent;

                    //in case we want to create a "Lo" item , his parent needs to bee the lesson element
                    if (args.type == "lo") {
                        var lessonParentRecord = repo.getAncestorRecordByType(this.record.id, "lesson");
                        parentId = lessonParentRecord.id;
                    }
                    var itemConfig = _.extend({parentId: parentId}, args);

                    events.fire('createLessonItem', itemConfig);
                   
                }, 'ctx': this, 'unbind': 'dispose'},

                model = this.screen.components.props.startEditing(this.record, changes);

			model.on('change:title', this.stage_view.render, this.stage_view);

            this.bindEvents(
                {
                    'menu_lesson_item_delete':{'type':'register', 'func': function(){
                        events.fire('delete_lesson_item', this.config.id);},
                        'ctx':this, 'unbind':'dispose'},
                    'new_lesson_item':  newItemHandler,
                    'new_differentiated_sequence': { 'type': 'register', 'func': function f984() {
                        events.fire('createDifferentiatedSequence', this.record.parent, this);
                    }, 'ctx': this, 'unbind': 'dispose'},
                    'new_separator': { 'type': 'register', 'func': function (args) {
                        var itemConfig = _.extend({parentId: this.record.parent}, args);
                        events.fire('createSeparator', itemConfig);
                    }, 'ctx': this, 'unbind': 'dispose'}

                });
		},
        onReferencedSequenceChange: function f985() {
            this.stage_view.render();
        },

		
        dispose: function() {
            this.commentsComponent && this.commentsComponent.dispose();
            this._super();

            delete this.commentsComponent;
        }

	}, {
        type: 'ReferenceSequenceEditor',
        valid : function(elem_repo) {
         
            return {valid : true, report : []};
        }
    });

	return ReferenceSequenceEditor;

});
