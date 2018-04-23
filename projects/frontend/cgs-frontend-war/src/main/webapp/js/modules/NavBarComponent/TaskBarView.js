define(['lodash','jquery', 'types', 'editMode', 'BaseView', 'dialogs', 'events',"repo", 'text!modules/NavBarComponent/templates/TaskBarView.html'],
function(_,$, types, editMode, BaseView,dialogs,  events,repo, template) {

	var TaskBarView = BaseView.extend({

		initialize: function(options){
			
			// the two array below are for changing the type of the task
			this.notDestroyArray= [];
			this.childForRepo=[];
			
			this.$parent = $('#navbar_base_wrapper');
			this.registerEvents();
			this.obj = this.options.obj;
			this.taskType = this.obj.type;

			var load = require('load'),
			 editorObj;

			editorObj = load(types[this.taskType].editor, null, types[this.taskType].loadOptions);
			
			this.setScreenLabel = editorObj.setScreenLabel;
			this.displayTaskName = this.setScreenLabel && this.setScreenLabel.length;

			this.displayTaskDropdown = editorObj.displayTaskDropdown && repo.getAncestorRecordByType(this.obj.id, "pluginExternal") === undefined;
            this.typesDropDown = this.select_task_options();
            this.showBar = this.displayTaskDropdown || this.displayTaskName;
			//call super to support "setInputMode"
			this._super();

			//add class to the base area, in order to apply css rule of padding top on the ".task_screen #stage_base"
			//the padding is there because that the task type selection bar has an absolute position
			$("#base")[this.showBar ? 'addClass' : 'removeClass']('hasTaskBar');
		},

        /**
         * returns the array of the tasks available for the task select box
         * @returns {*}
         */
        select_task_options : function f951(){
            var task_options = { selectTaskType: true },
				isAssessment = require('lessonModel').isAssessmentClosure(this.obj.id),
				isQuiz = !!repo.getAncestorRecordByType(this.obj.id, 'quiz'), 
				lesson = repo.get(require('lessonModel').lessonId),
				isOverlay = this.obj.data.displayInOverlayScreen;
            return _.chain(types)
            		.where(task_options)
            		.filter(function(type) {
            			if(isAssessment) {
            				return lesson && type.assessmentEnable && type.assessmentEnable[lesson.data.pedagogicalLessonType];
            			}
            			if(isQuiz){
            				return type.quizEnabled;
            			}if(isOverlay){
            				return type.isOverlayEnabled;
            			}
            			return true;
            		})
            		.sortBy(function(type) {return type.fullName;})
            		.value();
        },

		registerEvents: function(){
			events.register('task_TypeChange', this.showDialogChangeToItem, this);
		},

		showDialogChangeToItem: function(){
			var dialogConfig = {

				title: "Task type change",

				content: {
					text: "Are you sure want to change task type?",
					icon: 'warn'
				},

				buttons: {
					yes:		{ label: 'Yes' },
					cancel:		{ label: 'Cancel' }
				}

			};

			events.once('onTaskTypeChange', function(response) {

				if(response && response == "yes") {
					this.eventTypeChange() ;
				}
				else {
					var router = require('router');
					if (router.activeRecord && router.activeRecord.type) {
						$("#select_TaskType").val(router.activeRecord.type);
					}
				}

			}, this);

			var dialog = dialogs.create( 'simple', dialogConfig, 'onTaskTypeChange' ) ;
		},

		dispose: function(){
			events.unbind('task_TypeChange');
			this._super();
		},

		render: function() {
			this._super(template);
			this.$parent.append(this.el);
			this.taskBarDropDownInitialize();

			
			events.fire('init-cgs-hints');
		},
		
		taskBarDropDownInitialize : function f953() {
			_.each(this.controller.config.navbar.config.subMenuEvents, function(item, index){

				if (!!item) {
					if (index === 'select_TaskType') {
						this.$el.find("#" + index).change(_.bind(function f954() {
							$(this).unbind("change");
							events.fire(item);
						}));
					} else {
						this.$el.find("#" + index).click(_.bind(function f955() {
							events.fire(item);
						}));
					}
				}
			},this);

			$("#select_TaskType").val(this.controller.router.activeEditor.elementType);
	
		},

        findType: function(typeName, currentArr){
			//the function find the desire item and his child in the array fill the not destroy array and return the parent id and type
			var counter = 0,response =[], parentId ;
			while( !(currentArr.length <= counter) && currentArr[counter].type != typeName){
				counter++;
			}
			if(currentArr.length > counter){
				this.notDestroyArray.push({type: typeName, id :currentArr[counter].id , child: _.clone(currentArr[counter].children)});
				this.childForRepo.push(currentArr[counter].id);
			}

		},

		eventTypeChange: function f956() {
			var newItemId, elementId,elementPosition,  elementDataAndChildren, elementTypeObj, rootTaskTemplate = "modules/", parentId;
			var router = require("router");

			var isOverlay = this.controller.record.data.displayInOverlayScreen;

			if (router.activeScreen && router.activeScreen.editor && router.activeScreen.editor.endEditing) {
				router.activeScreen.editor.endEditing();
			}

			repo.startTransaction();

			// the current elementId
			elementId = $("#stage_base > .element_preview_wrapper").data("elementid");
		 	//get the current data from repo
			elementDataAndChildren = repo.getSubtreeRecursive(elementId);
			parentId = elementDataAndChildren[0].parent;
			elementPosition = repo.get(parentId).children.indexOf(elementId);

			var newType = this.$el.find("#select_TaskType :selected").val(),
				oldType = repo.get(elementId).type;

			logger.audit(logger.category.EDITOR, 'Change task type from ' + oldType + ' to ' + newType);
			
			elementTypeObj = types[newType];

			// Create the template root - the option should have the folder name
			// if option has specific template use it otherwise the template should be TaskTemplate.js
			if(require('lessonModel').isLessonModeAssessment() && elementTypeObj.hasAssessmentTemplate){
				rootTaskTemplate += this.$el.find("#select_TaskType :selected").data("funcname") + "/AssessmentTaskTemplate";
			}else{
				rootTaskTemplate += this.$el.find("#select_TaskType :selected").data("funcname") +"/" +
					((elementTypeObj.useSpecificTemplate) ? elementTypeObj.templateName : "TaskTemplate");
			}

			//get the question children
			this.findType("question", elementDataAndChildren);

			var comments = repo.get(elementId).data.comments;

			//removing all data from repo
			repo.removeItemAndChildrenWithExcludeList(elementId,this.childForRepo);

			newItemId = this.createItem(rootTaskTemplate,parentId,elementPosition);

			repo.updateProperty(newItemId, 'comments', comments);
			if(isOverlay){
				repo.updateProperty(newItemId, 'displayInOverlayScreen', true);
			}

			//get the new item and will do coupling to the instruction and question children
			elementDataAndChildren = repo.getSubtreeRecursive(newItemId);
			for(var i= 0; i< this.notDestroyArray.length;i++){
				this.populateByType(this.notDestroyArray[i], elementDataAndChildren);
			}

			repo.endTransaction();

			//render the new item
			router.load(newItemId);

			//validate the new task
			require('validate').isEditorContentValid(newItemId);

		},

		populateByType:function(typeObj, elements){
			// get the typeObj and find the matching one in the the new item child
			// will the delete the new item child and populate the item with the old ones
			// and update the old once with the new parent

			var found = false, counter = 0,newParentId, i=0;
			do{
				if(elements[counter].type == typeObj.type){
					found = true;
					newParentId = elements[counter].id;
				}
				counter= !found ? counter+1 : counter ;
				if(counter >= elements.length){
					found = true;
				}
			}while(!found)

			// if the old item type had child remove the child of the new one and populate the old ones
			if(typeObj.child.length > 0){
				//remove the children
				if (elements[counter].children){
					for(i = 0; i < elements[counter].children.length; i++){
						repo.remove(elements[counter].children[i]);
					}
				}
				//set the old children to the parent
				for(i = 0; i < typeObj.child.length; i++){
					repo.updateProperty(typeObj.child[i], 'parent', newParentId, true);
				}
				repo.updateProperty(typeObj.id, 'children', [], true);

				//add to the parent the old child
				repo.updateProperty(newParentId,"children", typeObj.child, true);

			}

		},
		createItem: function(itemTmplPath, parentId,insertAt){
			var parentItem,childArr,newItemId, newItem = {};
			//get the new item template
			var itemTemplate = require(itemTmplPath);
			_.extend(newItem,{
				"template" : itemTemplate.template,
				"templatePath" : itemTmplPath,
				"insertAt" : insertAt,
				"parentId" : parentId
			});

			logger.debug(logger.category.EDITOR, 'Add new task from template ' + itemTmplPath);

			return  repo.addTemplate(newItem);

		},
		isTaskReadOnly : function(){
			return editMode.readOnlyMode;
		}


}, {type: 'TaskBarView'});

	return TaskBarView;

});
