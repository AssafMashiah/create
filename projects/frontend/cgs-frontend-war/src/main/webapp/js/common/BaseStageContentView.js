define(['jquery', 'lodash', 'BaseView', 'rivets', 'repo', 'types', 'translate', 'mustache',
    'tooltip', 'events', 'repo_controllers', 'text!common/BaseStageContentViewTemplate.html', 'text!common/TaskPreviewHeader.html', 'editMode','courseModel'],
    function ($, _, BaseView, rivets, repo, types, i18n, Mustache, tooltip, events,
        repo_controllers, baseStageTemplate, TaskPreviewHeader, editMode,courseModel) {

        var BaseStageContentView = Backbone.View.extend({

            className: 'element_preview_wrapper',
            clearOnRender: true,

            initialize: function (options) {

                this.baseStageTemplate = baseStageTemplate;
                this.TaskPreviewHeader = TaskPreviewHeader;

                if (this.options.controller)
                    this.controller = this.options.controller;

                this.el.dataset.elementid = this.controller.elementId;

                this.children_obj = [];
            },


            render: function ($parent) {

              //  this.dispose();

                if (typeof this.template === 'undefined') {
                    throw new Error('No `template` field: ' + this.constructor.type);
                }

                var partials = {
                    header: this.TaskPreviewHeader
                };

                this.$el[this.clearOnRender ? 'html' : 'append'](Mustache.render(this.template, this.controller, partials));

				//add class on rendered element according to the view mode
                this.$el.addClass("view_mode_" + this.controller.viewMode);
                if(this.controller.isTask){
                    this.$el.addClass("task_element");
                }
                //add class "hasNumber" for the auto numbering in the sequence view.
                //exlude types that should not be numbered
                var excludeTypesArray = ['header', 'narrative', 'pedagogicalStatement', 'selfCheck'];
                if (excludeTypesArray.indexOf(this.controller.elementType) !== -1) {
                    this.$el.addClass('noNumber');
                }

               if($parent && $parent.append){
                    var itemToRender = this.controller.record;
                    var itemParent = repo.get(itemToRender.parent);
                    var itemIndex = itemParent.children.indexOf(itemToRender.id);
                    
                    //if the added child is last of first, appent it to the parent
                    if([0,itemParent.children.length -1 ].indexOf(itemIndex) !=-1 ){
                        $parent.append(this.$el);
                    }else{

                        //the child need to be added in the middle of it's parent hirarchy
                        var afterSibling = $parent.find('[data-elementid=' + itemParent.children[itemIndex +1] + ']');
                        if(afterSibling.length && afterSibling.before ){
                            afterSibling.before(this.$el);
                        }else{
                            $parent.append(this.$el);
                        }
                    }
                }

                //add a delete button on task element, bind his click to delete event
                //var type = this.controller.record.type;
                //var x = types[type];
                if ( !this.controller.record.data.disableDelete && !this.disableDeleteButton) {
                    $(this.baseStageTemplate).appendTo(this.$el);
                }   else {
                    this.$el.children('.deleteBtn, .element_header').find('.delete_element').remove();
                }

                // if the parent is a compare element we dont need to insert the 'br'
                //(we need to display them in the same line)
                if ($parent && $parent.selector != ".compare_content" && !this.disableBr)
                    this.$el.after('<div class="br"/>');

                this.markValidation(this.controller.record.data.isValid,this.controller.record.data.invalidMessage );

                this.bindDelete();
            },


            showStagePreview: function ($parent, previewConfig) {
                //$parent.empty();
                //first clean all existing stage events
                this.unbindStageEvents();

                this.render($parent);
				//add class to the rendered element to prevent its drag& drop ( sorting)
                if(previewConfig.disableSorting){
                    this.$el.addClass("noSort");
                    delete previewConfig.disableSorting;
                }

                if (!!this.controller.isTask) {
                    if (!!previewConfig.bindTaskEvents) {
                        this.bindStageEvents();
                    }

                } else {
                    if (!!previewConfig.bindEvents)
                        this.bindStageEvents();
                }

                var options, record, child, elementType, elementEditorType;
                var childConfig = _.extend(previewConfig, {screen: this.controller.config.screen, previewMode: true});



                _.each(previewConfig.children, function (childId, index) {
                    record = repo.get(childId);
                    childConfig.id = childId;
                    elementType = record.type;
                    elementEditorType = types[elementType] && types[elementType].editor;
                    if (!elementEditorType) {
                        console.error("There was an error with the type of the element and the editor was not found", elementType);
                        return;
                    }

                     child = require('router').loadModule(elementEditorType, childConfig, false, types[elementType].prefix || null, types[elementType].loadOptions);

                    this.children_obj.push(child);

                    child.clearOnRender = false;

                    if (child.elementType !== 'sharedContent') {
                        var parentContainer = this.$('.' + this.controller.elementType + '_content');
                        if (!parentContainer.length && this.$el.hasClass(this.controller.elementType + '_content')) {
                            parentContainer = this.$el;
                        }
                        if (!!record.stage_preview_container || !!record.data.stage_preview_container) {
                            parentContainer = this.$(record.stage_preview_container || record.data.stage_preview_container);
                        }
                        var childIndexElem = this.$('[data-child-index=' + (index + 1) + ']').not(this.$('.element_preview_wrapper [data-child-index=' + (index + 1) + ']'));
                        if (childIndexElem.length) {
                            parentContainer = childIndexElem;
                        }

                        if (!parentContainer.length) {
                            // If content element doesn't exist, use wrapper element of the parent
                            parentContainer = $('[data-elementid=' + this.controller.record.parent + ']');

                            if (!parentContainer.length) {
                                throw "Error - no parent container";
                            }
                        }

                        child.showStagePreview(parentContainer, previewConfig);

                    } else {
                        var sharedContainer = this.$('.' + child.elementType + '_wrapper');
                        if(!sharedContainer.length){
                            sharedContainer = this.$('.' + this.controller.elementType + '_content');
                        }
                        child.showStagePreview(sharedContainer, previewConfig);
                    }
                }, this);

                if ((!editMode.readOnlyMode) &&
                    (!!this.controller.config.sortChildren || !!this.controller.record.data.sortChildren || (this.controller.config[this.controller.parentType] && this.controller.config[this.controller.parentType].sortChildren)) &&
                    (!this.controller.record.data.random) &&
                    (!this.controller.config.stagePreviewMode || this.controller.config.stagePreviewMode != "small")) {
                    this.sortChildren();
                }

                if (this.onChildrenRenderDone) {
                    this.onChildrenRenderDone.call(this);
                }
            },

            startEditing: function (model, container) {
                this.el.scrollIntoViewIfNeeded();
                logger.debug(logger.category.EDITOR, "Turning " + this.constructor.type + " (id: " + this.controller.record.id + ") stage into edit Mode");
            },

            endEditing: function () {
                this.children_obj = [];
            },
            dblclickEvent: function (event) {
                var loadElement = event;
                
                if(event && event.loadElement){// this param arrives from the edit button located on task element
                    loadElement = this.controller.elementId;//the element we would like to load
                }else{
                    if(this.controller.isTask){  // in this case we dblclicked on a task from the lesson sceen
                        loadElement = this.controller.elementId;//the element we would like to load
                        if(this.controller.record.type == "pluginTask" && require("router").activeScreen.constructor.type == "TaskScreen"){
                            loadElement = null; // plugin task from lesson screen shuold be sent with id to load it, from task screen should be sent without id, only to render its properties
                        }
                    }
                }

                this.controller.startEditing(loadElement);
                this.controller.setSelected();
            },
            editClickEvent: function (event) {
                this.dblclickEvent({loadElement : true});
            },
            setSelectedClickEvent: function (event) {
                event.stopPropagation();
                this.controller.setSelected();
            },
            mouseoverEvent: function (event) {
                event.stopPropagation();
                $(event.currentTarget).addClass('over');
            },
            mouseoutEvent: function (event) {
                event.stopPropagation();
                $(event.currentTarget).removeClass('over');
            },
            bindStageEvents: function () {

                if (this.controller.canBeEditableOnStage()) {
                    
                    this.$el.off('click.element dblclik.element mouseover.element mouseout.element');

                    if(!this.controller.isTask || this.controller.record.type == "pluginTask"){
                        //bind dblclik event to enter edit mode on a non-task component or on a plugin task
                        this.$el.off('click.element').on('click.element', this.dblclickEvent.bind(this));
                    }else{
                        //bind dblclik event to enter edit mode on a task
                        this.$el.off('dblclick.element').on('dblclick.element', this.dblclickEvent.bind(this));
                    }

                    this.$el.find(".edit_element").on('click.element', this.editClickEvent.bind(this));

                    if (this.controller.config && !this.controller.config.notSelectableInStage) {
                        this.$el.on('click.element', this.setSelectedClickEvent.bind(this));
                    }

                    this.$el.on('mouseover.element', this.mouseoverEvent.bind(this));

                    this.$el.on('mouseout.element', this.mouseoutEvent.bind(this));
                }
            },
            bindDelete: function(){
            // Tasks in sequence and elements in task can be deleted if read only mode is off and partial edit is off
                if (!editMode.readOnlyMode) {
                    var deleteButtonElement  = this.$el.children('.deleteBtn, .element_header').find('.delete_element');
                    deleteButtonElement.off('click.element').on('click.element',function (event) {
                        if (repo.get(this.controller.record.parent).type == 'compare') {
                            repo.removeItemAndSetChildrenToParent(this.controller.record.parent);
                        }
                        var deletedItemParentId = this.controller.record.parent;

                        //check if someone register to delete item
                        if (events.exists('deleteItem')) {
                            events.fire('deleteItem', this.$el.attr('data-elementId'));
                            event.stopPropagation();
                        }
                        //after delete apply validation on parent
                        require('validate').isEditorContentValid(deletedItemParentId);

                    }.bind(this));
                }
                else
                    this.$el.children('.deleteBtn, .element_header').find('.delete_element').hide();
            },

            unbindStageEvents: function () {

                if (this.$el.find(".edit_element").length > 0) {
                    this.$el.find(".edit_element").off('click.element');
                }

                this.$el.off('dblclick.element');

                this.$el.off('click.element');

                this.$el.off('mouseover.element');

                this.$el.off('mouseout.element');

                this.$el.children('.deleteBtn, .element_header').find('.delete_element').off('click.element');

            },

            setSelected: function () {
                this.$el.addClass('selected');
                this.controller && this.controller.scrollToItem && this.controller.scrollToItem(this.controller.record.id);
            },

            removeSelected: function () {
                this.$el.removeClass('selected');
            },

            sortChildren: function (element) {

                var selector;
                if (element) {
                    //param sent when the sortble function was destroyed and need to be reinitialized. called from the child element
                    //(happens in mathfield componenet that cannot be drraged while in edit mode)
                    selector = element;
                } else {
                    selector = this.$("." + this.controller.elementType + "_content");
                }

                selector.sortable({
                    containment: '#stage_base',
                    cursor: "move",
                    forceHelperSize: true,
                    forcePlaceholderSize: true,
                    items: selector.children(".element_preview_wrapper:not(.noSort):not(:has(.header_content))"),
                    tolerance: "pointer",
                    axis: "y",
                    stop: this.onStopSort,
                    start: this.onStartSort,
                    change: this.onChangeSort,
                    delay: 100,
                    revert: 10
                });

                this.sortChildrenSelector = selector;

            },
            //enable/ disable drag and drop functionality
            togggleSorting: function(sort){
                if(this.sortChildrenSelector)
                    this.sortChildrenSelector.sortable(sort  ? "enable" :"disable" );
            },

            onChangeSort: function (event, ui) {
                if ($(ui.item).parent('.sequence_content').length) {
                    ui.placeholder.addClass('noNumber');
                }
            },

            onStartSort: function (event, ui) {
                events.fire("setActiveEditorEndEditing");
                //this.sortShadow = ui.item.clone().removeAttr('style').removeClass('over').addClass('noNumber sortShadow').css('opacity', '0.3').insertAfter(ui.item);
                if ($(ui.item).parent('.sequence_content').length === 0 &&
                    $(ui.item).attr('data-type') !== 'plugin') {
                    var elements = $(ui.item).parent().children();

                    elements.css('display', 'block');
                    elements.removeClass('selected');
                }
                else {
                    ui.placeholder.addClass('noNumber');
                }
            },

            onStopSort: function (event, ui) {

                var itemId = $(ui.item).attr('data-elementid'),
                    parent = repo.getParent(itemId),
                    parentEditor = repo_controllers.get(parent.id);

                //cancel the dragging event
                var cancelDrag = function () {
                    $(ui.item).parent().sortable('cancel');
                    return;
                }

                var pluginCallback = null;
                if (parentEditor && parentEditor.pluginClassManagerInstance && typeof parentEditor.pluginClassManagerInstance.invoke == 'function') {

                    //get a callback function from a plugin that will break the flow of dragging, and return a callback respose if to cancel the drag or continue it. 
                    pluginCallback = parentEditor.pluginClassManagerInstance.invoke(parent.id, 'getSortStopCallback');
                    
                    // Call onChildrenSorting before complete the action - it can be canceled
                    var newIndex = $(event.target).find("> .element_preview_wrapper").index(ui.item),
                        retVal = parentEditor.pluginClassManagerInstance.invoke(parent.id, 'onChildrenSorting', [itemId, newIndex]);
                    
                    if (retVal && retVal.cancel) {
                        cancelDrag();
                    }
                }
                
                var stopSortContinueFunc = function () {
                    if ($(ui.item).parent('.sequence_content').length === 0 &&
                         $(ui.item).attr('data-type') !== 'plugin' &&
                         !parentEditor.constructor.disableSortableCss) {
                        $(ui.item).siblings().css('display', 'inline-block');
                    $(ui.item).css('display', 'inline-block');
                    $(ui.item).parent().children('.br').remove();
                    $(ui.item).parent().children().each(function (index, item) {
                        $('<div class="br"/>').insertAfter($(item));
                    });
                }

                var items_order = '', id = 0;
                _.each($(event.target).find("> .element_preview_wrapper"), function (element, index) {
                    id = $(element).attr('data-elementid');
                    items_order += id + ',';
                });

                if (items_order.length > 1) {
                    items_order = items_order.slice(0, items_order.length - 1);
                }
                repo.updateChildrenOrder(id, null, items_order, true);


                // Try to resolve iframe problem...
                var iframeTypes = ['textViewer', 'cloze_text_viewer'],
                    iframeElements = [];

                _.each(iframeTypes, function(type) {
                    iframeElements = _.union(iframeElements, repo.getChildrenRecordsByTypeRecursieve(ui.item.attr('data-elementid'), type));
                });

                if (iframeTypes.indexOf(repo.get(ui.item.attr('data-elementid')).type) > -1) {
                    iframeElements.push(repo.get(ui.item.attr('data-elementid')));
                }

                _.each(iframeElements, function(tv) {
                    var controller = repo_controllers.get(tv.id);
                    if (controller && controller.renderChildren) {
                        controller.renderChildren();
                    }
                });

                    //invoke a function to notift the plugin  that the sorting has ended
                    if (parentEditor && parentEditor.pluginClassManagerInstance && typeof parentEditor.pluginClassManagerInstance.invoke == 'function') {
                        parentEditor.pluginClassManagerInstance.invoke(parent.id, 'onChildrenSorted', [itemId]);
                    }
                }

                if(pluginCallback){
                    //activate the plugin stop sort callback, and follow the response 
                    pluginCallback(function (response) {
                        if(response == "cancel"){
                            cancelDrag();
                        }else{
                            stopSortContinueFunc();
                        }

                    });

                }else{
                    stopSortContinueFunc();
                }


            },

            markValidation: function (val, report) {

                this.$el[!val ? 'addClass' : 'removeClass']('notValid');
                var childrenValidation = false,
                    markChildValidation = false;

                if(val){
                    //mark a task as invalid if it contains invalid component
                    childrenValidation = this.controller.record.data.invalidMessage && this.controller.record.data.invalidMessage.report.length;
                    markChildValidation = types[this.controller.record.type].selectTaskType || this.controller.record.type == 'sharedContent';

                }
                this.$el[(childrenValidation && markChildValidation) ? 'addClass' : 'removeClass']('childNotValid');
                if(val===false || (childrenValidation && markChildValidation)){
                    this.insertInvalidSign();
                }else{
                    this.removeInvalidSign();
                }
            },
            insertInvalidSign : function(){
                require('validate').insertInvalidSign(this.$el , true, this.controller.record.type, require('validate').getInvalidReportString(this.controller.record.data.invalidMessage));

            },
            removeInvalidSign : function(){
                this.$('.validTip.type_'+this.controller.record.type).remove();
            },

            dispose: function () {
                this.controller && this.controller.view && this.controller.view.dispose && this.controller.view.dispose();
                this.unbindStageEvents();
                this.$el.children().remove();
                this.endEditing();
            }

        }, {type: 'BaseStageContentView'});

        return BaseStageContentView;

    });