/**
 * Represnts CGS Namespace
 * @version 1.0
 * @namespace CGS
 **/
function CGS() {
    /**
     * @function
     * @param {Object} options
     * @param {Array} [options.childrenToRender] - Render specific children only
     * @param {Boolean} [options.disableEndEditing] - Don't call endEditing of active editor before render
     * @param {Boolean} [options.disableStartPropsEditing] - Don't call startPropsEditing
     **/
    this.render = function () {
    };
}

/**
 * Injected to Entry point prototype
 * @class
 **/

CGS.prototype = function () {
        /**
     * @method getRenderConfiguration
     * @memberof CGS.prototype
     * @description - this event fires befor the rendering of the plugin, in this function, the user is asked to return rendering configurations
     * @return {Object} - an object representing all the rendering configurations
     * @example - getRenderConfiguration(){
        return{
            "previewMode" : "small" / "normal", - the mode to render the plugin and its children
            "disableSorting" : true/ false - allow or disable sorting (drag and drop) of the plugin
        }
     }
     **/
    this.getRenderConfiguration = function(){};
    /**
     * @method onInitialize
     * @memberof CGS.prototype
     * @description - this event fires on plugin initialize
     * @param {Object} details
     * @param {String} details.state - return the current state of the editor (edit/preview)
     **/
    this.onInitialize = function () {
    };

    /**
     * @method onRenderComplete
     * @memberof CGS.prototype
     * @description - this event fires on plugin render completed
	 * @param {Object} config
     * @param {String} config.state - return the current state off the editor (edit/preview)
     * @param {Object} config.$before - reference to the plugin container preceding element
	 * @param {Object} config.$content - reference to the plugin container element
	 * @param {Object} config.$after - reference to the plugin container succeeding element
     **/

    this.onRenderComplete = function () {
    };
    /**
     * @method onStartEdit
     * @memberof CGS.prototype
     * @description - this event fires on plugin startEditing - user dblcick on the editor
     **/
    this.onStartEdit = function () {

    };
    /**
     * @method onEndEdit
     * @memberof CGS.prototype
     * @description - this event fires on plugin endEditing - user move focus to another editor
     **/
    this.onEndEdit = function () {
    };
    /**
     * @method onDispose
     * @memberof CGS.prototype
     * @description - this event fires when editor is remove from the screen/user switch to another screen
     **/
    this.onDispose = function () {
    };

    /**
     * @method getPropertiesView
     * @memberof CGS.prototype
     * @description - this event should return the template for initialize properties view on the right side of the screen
     **/

    this.getPropertiesView = function () {
    };
    /**
     * @method onPropertiesViewLoad
     * @memberof CGS.prototype
     * @description - this event fires when propertis end loading
     **/
    this.onPropertiesViewLoad = function () {
    };
	/**
     * @method onChildDeleted
     * @memberof CGS.prototype
     * @description - this event fires when child was deleted
	 * @param {String} childId - the id of deleted item
     **/
	this.onChildDeleted = function () {
    };
    /**
     * @method getSortStopCallback
     * @memberof CGS.prototype
     * @description - this event fires when children are going to be sorted,
     * the function expect an async callback function with a callback parameter.
     * the function will be called from create, then an async event can be called in the plugin, and eventually will activate the create callback with cancel or ok response,
     * the will indicate if the sort should be cancelled or continue
     @example:
        getSortStopCallback: function () {
            
            return function(callback){
                this.openSortDialog(function(){
                    this.CGS.dialogs.show({
                        title: "xx",
                        content: "yyy?",
                        buttons: {
                            "ok": {
                                label: "Ok"
                            },
                            "cancel": {
                                label: "Cancel"
                            }
                        }
                    }, function onResponseRecieved(response) {
                        callback(response);
                    });
                    
                });
            }.bind(this) 
        }

     **/
    this.getSortStopCallback = function () {
    };

	/**
     * @method onChildrenSorting
     * @memberof CGS.prototype
     * @description - this event fires when children are going to be sorted with cancel option
	 * @param {String} childId - the id of dragged item
	 * @param {Number} newIndex - the index in children array it will be placed
	 * @returns {Object} retVal
     **/
	this.onChildrenSorting = function () {
    };

    /**
     * @method onChildrenSorted
     * @memberof CGS.prototype
     * @description - this event fires when children were sorted
	 * @param {String} id - the id of dragged and dropped item
     **/
	this.onChildrenSorted = function () {
    };

    /**
     * @method onChildStartEditing
     * @memberof CGS.prototype
     * @description - this event fires when child has entered to edit mode
     * @param {String} childId - the id of item that entered to edit mode
     **/
    this.onChildStartEditing = function(){};

    /**
     * @method onChildEndEditing
     * @memberof CGS.prototype
     * @description - this event fires when child has left edit mode
     * @param {String} childId - the id of the item that left edit mode
     **/
    this.onChildEndEditing = function(){};

    /**
     * @method validate
     * @memberof CGS.prototype
     * @description - this event fires on end-editing of element, or any of its ancestors.
     * if all the ancestors are valid, the validation proccess continues to the children, otherwise it stops.
     * if the element is not valid, an invalid indication will apear next to it. plugin developer shold determine its position via css
     * @returns {Object} retVal
     * @example : {
                    'valid': false,
                    "validationMessage" :['list item is not valid because of x', "list item is not valid because of y"]
                }
     **/
    this.validate = function(){};

    /**
     * @method onChildrenRenderDone
     * @memberof CGS.prototype
     * @description - this event fires when the plugin's children finish their render on the page
     **/
    this.onChildrenRenderDone = function(){};
};


/**
 * Represnts Plugin Model
 * @memberof CGS
 * @class CGS.model
 **/

CGS.prototype.model = function () {

    /**
     * save new item to repo
     * @method saveItem
     * @memberof CGS.model
     * @param {Object} options
     * @param {Object} options.data
     * @param {Object} options.data.type - the type of the item
     * @param {Array} options.data.children - array of objects that represents the children that needs to be added
     * @param {Object} options.data.data - additional properties
     * @param {Object} options.data.data.insertAt - index in which the element will be inserted at its parent hirarchy
     * @param {Object} options.data.data.deletable - indication whether the element will have a delete button
     **/
    this.saveItem = function (options) {
    }
    /**
     * get item from the repo
     * @method getItem
     * @memberof CGS.model
     * @param {Object} options
     * @param {String} options.id - which record to get, must be in the tree of the plugin model.
     **/

    this.getItem = function (options) {
    };

    /**
     * get an item SubTree containing all of the repo elements hirarchy
     * @method getItemSubTree
     * @memberof CGS.model
     * @param {Object} options
     * @param {String} options.id - the record id to get the tree hirarchy.
     * @example
     * this.CGS.model.getItemSubTree({"id" : "34234-435435-34534"});
     **/
    this.getItemSubTree = function(options){};

    /**
     * delete item from the repo
     * @method deleteItem
     * @memberof CGS.model
     * @param {Object} options
     * @param {String} options.id - which record to delete - must be inside the tree of the model
     **/


    this.deleteItem = function (options) {

    }
    /**
     * Save/Update property on specific record in the tree
     * @method saveProp
     * @memberof CGS.model
     * @param {Object} options
     * @param {String} options.propName - which record to update, must be in the tree of the plugin model.
     * @param {String|Boolean|Object|Integer} options.value
     * @param {Boolean} options.triggerChanged - trigger change will set a dirty flag for saving lesson
     **/
    this.saveProp = function (options) {
    }
    /**
     * add applet as child
     * @method addAppletChild
     * @memberof CGS.model
     * @param {Object} options
     * @param {String} [options.appletId] - applet id for specific applet adding
     * @param {function} [options.failCallback] - fail callback (applet id doesn't exist in GCR)
     * @param {function} [options.successCallback] - success callback called after adding an applet successfuly
     * @param {Boolean} [options.disableDelete] -indicates whether the applet will have a delete button
     **/
    this.addAppletChild = function (options) {
    }
}

/**
 * Represnts Spinner API
 * @memberof CGS
 * @class CGS.spinner
 **/

CGS.prototype.spinner = function () {
    /**
     * Start the busyIndicator
     * @method start
     * @memberof CGS.spinner
     * @example
     * this.CGS.spinner.start();
     **/

    this.start = function () {
    }

    /**
     * Stop the busyIndicator
     * @method stop
     * @memberof CGS.spinner
     * @example
     * this.CGS.spinner.stop();
     **/
    this.stop = function () {
    }
    /**
     * Force stop of the busyIndicator
     * @method forceStop
     * @memberof CGS.spinner
     * @example
     * this.CGS.spinner.forceStop();
     **/

    this.forceStop = function () {
    }
}

/**
 * Represnts Dialogs API
 * @memberof CGS
 * @class CGS.dialogs
 **/

CGS.prototype.dialogs = function () {
    /**
     * Show dialog box
     * @method show
     * @memberof CGS.dialogs
     * @param {Object} data - the data for dialog
     * @param {String} data.title
     * @param {String} data.content
     * @param {Object} data.buttons
     * @param {Callback} callback - on dialog response event
     * @example
     this.CGS.dialogs.show({
			title: "Dialog Title",
			content: "<b>dialog content</b>",
			buttons: {
				"cancel": {
					label: "Cancel"
				},
				"ok": {
					label: "Ok"
				}
			}
		}, function onResponseRecieved (response) {
			if (response === "ok") ...
		})
     **/

    this.show = function () {
    }
}

/**
 * Represnts Menu API
 * @memberof CGS
 * @class CGS.menu
 **/

CGS.prototype.menu = function () {
    /**
     * Enum menu button types.
     * @memberof CGS.menu
     * @readonly
     * @enum
     */
    this.types = {
        'button': 1,
        'btn-group-title': 2,
        'btn-group-scroll': 3,
        'button_dropdown': 4,
        'button_dropdown_title': 5,
        'btn_dropdown': 6,
        'btn_split': 7
    };
    /**
     * load menu items
     * @method loadMenu
     * @memberof CGS.menu
     * @param {Object} data - the data for dialog
     * @param {String} data.menuInitFocusId - the menu item to be focus on after load
     * @param {String} data.label - the text of the item
     * @param {Types} data.type
     * @param {String} data.icon
     * @param {Boolean} data.canBeDisabled - set the initialize state of the button according to the state of the CGS (readonly).
     * @param {Array} data.subMenuItems - sub menu items array, the data of each item is the same as the main button
     **/

    this.loadMenu = function () {
    }

    /**
     * load menu items
     * @method setMenuItemState
     * @memberof CGS.menu
     * @param {Object} data - the data for dialog
     * @param {String} data.id - the item id
     * @param {String} data.state - state of the menu {disabled|enabled}
     **/
    this.setMenuItemState = function () {
    }

    /**
     * load menu items
     * @method onMenuItemStateChanged
     * @memberof CGS.menu
     * @param {Callback} callback - register this method for menu state changes, callback get the state as param
     **/
    this.onMenuItemStateChanged = function () {
    }

    /**
     * Get CGS tasks menu
     * @method getTasksMenu
     * @memberof CGS.menu
     * @param {Callback} addTaskCallback - This method will be called on adding new task with task type parameter
     **/
    this.getTasksMenu = function () {
    }
}

/**
 * Represnts Menu API
 * @memberof CGS
 * @class CGS.externalApi
 **/

CGS.prototype.externalApi = function () {
    /**
     * add external api method
     * @method register
     * @memberof CGS.externalApi
     * @param {String} name - the name of the method
     * @param {Callback} method - the method to save
     * @example
     * this.CGS.externalApi.add('getCustomerData', function () { ... });
     * //supports namespaces
     * this.CGS.externalApi.add('car.getCarModel', function () { ... });
     **/

    this.register = function (name, method) {
    }

    /**
     * activate the api method by path
     * @method activate
     * @memberof CGS.externalApi
     * @param {Array} path - array of PathElement
     * @param {String} path.action - (parent|next|child|setRecordProperty|getRecordProperty) describe which direction to search
     * @param {Object} path.args - by which argument to search in repo
     * @param {String} methodName - the method to invoke inside the external plugin
     * @param {Array} args - which arguments to send to the external method
     * @example
     * var path = [
     *     {
     *         action: 'child',
     *         args: {
     *          //the plugin name should contain the format bundleName::pluginName
     *          type: {{pluginName}},
     *          //the position inside the array of the children
     *          index: 2
     *         }
     *     }
     * ];
     * this.externalApi.activate( path, "getCustomerData", ['customer1', 'customer2', 'customer3']);
     * var path = [
     *     {
     *         action: 'child',
     *         args: {
     *          //the plugin name should contain the format bundleName::pluginName
     *          type: {{pluginName}},
     *          //the position inside the array of the children
     *          index: 2
     *         }
     *     },
     *     {
     *         action: 'next'
     *     }
     * ];
     * this.externalApi.activate( path, "getCustomerData", ['customer1', 'customer2', 'customer3']);
     **/
    this.activate = function () {
    }
    /**
     * Invoke the api method
     * @private
     * @method activateApiMethod
     * @memberof CGS.externalApi
     * @param {String} methodName - the name of the registered method
     * @param {Object} args - which arguments to send to the method
     **/

    this.activateApiMethod = function (methodName, args) {
    }
	/**
     * Start repo changes transaction (for undo actions)
     * @method startTransaction
     * @memberof CGS.externalApi
     * @param {Object} [options]
	 * @param {Boolean} [options.ignore] - Ignore transaction changes
	 * @param {Boolean} [options.appendToPrevious] - Add transaction changes to previous transaction
     **/
    this.startTransaction = function (options) {
    }
	/**
     * End repo changes transaction (for undo actions)
     * @method endTransaction
     * @memberof CGS.externalApi
     **/
    this.endTransaction = function () {
    }
	/**
     * Get current selected editor's id
     * @method getSelectedEditorId
     * @memberof CGS.externalApi
	 * @return {String} id
     **/
    this.getSelectedEditorId = function () {
    }
	/**
     * Activate upload api on DOM element
     * @method fileUpload
     * @memberof CGS.externalApi
	 * @param {Object} config
	 * @param {Object|String} config.activator - DOM element (can be selector string, native element or jQuery element)
	 * @param {Object} [config.options] - additional options (file allowed types, ignore size limits, etc...)
	 * @param {Function} [config.callback] - callback function for file upload recieves 3 parameter: relative path of uploaded file, file original name and file blob
	 * @param {Object} [config.context] - callback context
	 * @param {String} [config.recordId] - repo record Id
	 * @param {String} [config.srcAttr] - Data source key into repo record for uploaded file url. If record id is provided this property is mandatory.
	 * @param {Boolean} [config.enableAssetManager] - Is the asset orderable
	 * @param {Function} [config.errorCallback] - if exists, the general error popup will not be shown. Recieves error message string.
	 * @return {Object} retVal - File Upload object. It contains deleteAsset method for delete uploaded asset.
     **/
    this.fileUpload = function (config) {
    };
	/**
     * Return asset absolute path in local file system
     * @method getAssetAbsolutePath
     * @memberof CGS.externalApi
	 * @param {String} relativePath - asset relative path
	 * @return {String} fullPath
     **/
    this.getAssetAbsolutePath = function (relativePath) {
    };
};

/**
* represents a an area with general api methods
*   @memberof CGS
*   @class CGS.general
**/
CGS.prototype.general = function(){

    /**
    * get the current read only state
    * @method getReadOnlyMode
    * @memberof CGS.general
    * @example
    * this.CGS.general.getReadOnlyMode()
      @returns {Object} {"readOnlyMode":false / true}
    */

    this.getReadOnlyMode = function (){};
    /**
    * get data about specific task.
    * @method getTaskInformation
    * @memberof CGS.general
    * @param {Object} params - parameters to activate the function
    * @param {string} params.taskId - the id of the task to get the data
    * @example
    *  this.CGS.general.getTaskInformation(
        {
            "taskId":"xxx"
        })
        @returns {Object} {"checkable":false / true}
    */

    this.getTaskInformation = function(params){};
    /**
    * initialize a help growing list component.
    * the help item is created as an array of name-id attributes. each help is a repo item child of the parent recieved as a parameter
    * @method initHelpComponent
    * @memberof CGS.general
    * @param {Object} params - parameters to activate the function
    * @param {string} params.parentId - the id of the element that will be the parent of the help items
    * @param {Strign | Object} params.containerSelector  - selector or jQuery element to render the help component inside
    * @example
    *  this.CGS.general.initHelpComponent(
        {
            "parentId":"xxx",
            "containerSelector":$("#elementId") OR "#elementId"
        })
    */
    this.initHelpComponent = function(params){};
    /**
    * toggels the event binding of a given element and its children,
    * events are - dblclick , click , mouse in, mouse out
    * @method toggleEventsBinding
    * @memberof CGS.general
    * @param {Object} params - parameters to activate the function
    * @param {string} params.id - the id of the element from which to apply event toggling
    * @param {boolean} params.bindEvents - boolean value that defines if to apply events or disable tham, when true- the events will be activated, if false, events will be unavailble
    * @example
    *  this.CGS.general.toggleEventsBinding(
        {
            "id":"xxx",
            "bindEvents":true / false
        })
    */
    this.toggleEventsBinding = function(params){};

    /**
    * toggels the sort children ability (drag & drop)- allow or disable the drag and drop of the element's children
    * @method toggleSortableBinding
    * @memberof CGS.general
    * @param {Object} params - parameters to activate the function
    * @param {string} params.id - the id of the element for which to apply the drag and drop on it's children.
    * @param {boolean} params.sortable - boolean value that defines if to enable or disable the drag and drop.
    * @example
    *  this.CGS.general.toggleSortableBinding(
        {
            "id":"xxx",
            "sortable":true / false
        })
    */
    this.toggleSortableBinding = function(params){};

    /**
    * returns to the caller a list of all plugin contents ( the plugin element in the highest hirarchy )
    * @method getPluginContentList
    * @memberof CGS.general
    * @param {Object} [params] - parameters to activate the function
    * @param {Array} [params.types] - array of strings of types to filter in the query
    * @example this.CGS.general.getPluginContentList(
        {
            "types":["wordAttack","storyReading"]
        })
    * @return {Array} - array of objects: [
        {
            "id":plugin ID",
            "name":"plugin name"
        }]
    */
    this.getPluginContentList = function(params){};

    /**
    * inits click function handler to a media items, which opens a popup window and dispalys the media
    * @method initMediaPreview
    * @memberof CGS.general
    * @param {Object} params - parameters to activate the function
    * @param {String} params.mediaType - "audio" / "image" / "video"
    * @param {Strign | Object} params.previewTargetSelector  - selector or jQuery element of the preview media activator
    * @param {String} params.src - the source of the media, as saved in repo ( relative to the media folder)
    * @example this.CGS.general.initMediaPreview(
        {
            "mediaType": "audio",
            "previewTargetSelector" :"#audioContainer" OR $("#audioContainer"),
            "src":"/media/7a/f9/7af9b5d786e32abcf56e5c56d68fe2990ab31483.mp3"
        })
    */
    this.initMediaPreview = function(params){};
    /**
    * unbind the click function handler attached to the media item in the "initMediaPreview" function
    * @method disposeMediaPreview
    * @memberof CGS.general
    * @param {Strign | Object} previewTargetSelector - the selector or jQuery element from which to unbind the preview functionality
    * @example
    this.CGS.general.disposeMediaPreview("#audioContainer")
    OR
    this.CGS.general.disposeMediaPreview($("#audioContainer"))
    */
    this.disposeMediaPreview = function(previewTargetSelector){};

    /**
    * Subscribe to sub menu render event.
    * @method subscribeToOpenSubMenu
    * @memberof CGS.general
    * @param {Object} params - parameters to activate the function
    * @param {string} params.recordId - the id of the current record
    * @param {Function} params.callback - the callback function
    * @example
    *  this.CGS.general.subscribeToOpenSubMenu(
        {
            "recordId":"xxx"
            "callback": function() { bla-bla-bla... }
        })
    */
    this.subscribeToOpenSubMenu = function(params){};

};
/**
 * Represnts events API
 * @memberof CGS
 * @class CGS.events
 **/

CGS.prototype.events = function () {
    /**
     * register to an event and bind them a callback function
     * @method register
     * @memberof CGS.events
     * @param {String} eventName - the name of the event
     * @param {Callback} callback - the method to assign on event fire
     * @param {Object} context - the "this" context inside the method
     **/
    this.register = function (eventName, callback, context) {
    };

    /**
     * unbind an event registration
     * @method unregister
     * @memberof CGS.events
     * @param {String} eventName - the name of the event to unbind
     **/
    this.unregister = function (eventName) {
    };

    /**
     * fire an event
     * @method fire
     * @memberof CGS.events
     * @param {String} eventName - the name of the event
     * @arg {...Mixed} [args] - arguments to sent to the function ( can send as many arguments as wanted)
     **/
    this.fire = function (eventName, args) {
    };
};

/**
 * Represnts validation API
 * @memberof CGS
 * @class CGS.validation
 **/
CGS.prototype.validation = function(){
/**
* @method setValidation
* @memberof CGS.validation
* @description - this function sets validation status and message on a non-plugin item (such as text viewer)
* @param {Object} options - the id of the item that left edit mode
* @typedef options
* @type {object}
* @property {string} id - id of element to validate
* @property {boolean} valid - status of item validation.
* @property {array} validationMessage - array of strings to descride message to the user about the invalidness of the item
* @property {boolean} overrideDefaultValidation - defines if to use the default validation of the item in addition to the custom validation, or use only the custom validation
* @example
* this.CGS.validation.setValidation({"id":"someId", "valid":false,"validationMessage" :["the item is invalid because of x","the item is invalid because of y"]})

**/
    this.setValidation = function(){};

};
/**
 * Represnts render & translation API
 * @memberof CGS
 * @class CGS.RenderTemplate
 **/

CGS.prototype.RenderTemplate = function () {
    /**
     * render a template using mustache and i18n translation
     * @method render
     * @memberof CGS.RenderTemplate
     * @param {String} template - the thml template to render
     * @param {Object} [obj] - the "this" context inside the render
     * @param {Object} [partials] - partial template to render
     **/
    this.render = function (template, obj, partials) {
    };
    /**
     * translation of string according to current interface locale in i18n translation
     * @method translate
     * @memberof CGS.RenderTemplate
     * @param {String} template - the string to translate
     **/
    this.translate = function (string) {
    };
};

/**
 * @class Manifest
 * @description Describe manifest properties
 * @example
 *{
*    "uuid": "5e3a4f62-ecd0-4491-8622-f09d1b2f3b4a",
*    "parentButtonConfig" :[{
*        "id": "menu-plugin-test-2",
*        "label": "Test Label",
*        "parentEditorType": "LessonScreen"
*    }],
*    "template": "template.json",
*    "name" : "Vocabulary Sequence",
*    "main":"index.js",
*    "pluginType": "sequence",
*    "version":"1.0.0",
*    "api_version":"1.0.0",
*    "dependencies": ["practice", "student", "teacher", "vocabulary_task"],
*    "viewConfig": {
*		"stageReadOnlyMode": true,
*		"disableDelete": true,
*		"sortChildren": true
*	 }
*}
 * @static
 **/


var Manifest = {
    /**
     *@memberof Manifest
     *@name uuid
     *@type {String}
     *@description - the unique id of the plugin
     **/
    "uuid": null,
    /**
     *@memberof Manifest
     *@name parentButtonConfig
     *@type {Array}
     *@property {String} label - the text will apear on the button
     *@property {String} parentEditorType - the parent editor off the plugin, currently support (LessonScreen,SequenceEditor)
	 *@property {String} templateId - The id of activity template for current button
     *@description - the plugin menu items config array
     **/
    "parentButtonConfig": {
        "label": null,
        "parentEditorType": null
    },
    /**
     *@memberof Manifest
     *@name structureFile
     *@type {String}
     *@description - the file contains mapping of default contents that the plugin will show up with
     **/
    "structureFile": null,
    /**
     *@memberof Manifest
     *@name name
     *@type {String}
     *@description - the name of the plugin
     **/
    "name": null,
    /**
     *@memberof Manifest
     *@name dataToTasksFile
     *@type {String}
     *@description - the path to tasks conversion file
     **/
    "dataToTasksFile": null,
    /**
     *@memberof Manifest
     *@name dataToPlayerFile
     *@type {String}
     *@description - the path to player conversion
     **/
    "dataToPlayerFile": null,
    /**
     *@memberof Manifest
     *@name resources
     *@type {Object}
     *@property {Array} css - array of css paths relative to the plugin path.
     *@property {Object} translations - hash map of locale->path, represents the translations according to the default system locale, can set a default locale if current system locale isn't support. {"default":"path to file"}
     *@description - the name of the plugin
     **/
    "resources": {
    },
    /**
     *@memberof Manifest
     *@name main
     *@type {String}
     *@description - path to the root point of the plugin
     **/
    "main": null,
    /**
     *@memberof Manifest
     *@name pluginType
     *@type {String}
     *@description - will determine the type of the plugin on loading, can be sequence/task (for tasks),
     if set to null it will load it without pushing it to a menu.
     **/
    "pluginType": null,
    /**
     *@memberof Manifest
     *@name version
     *@type {String}
     *@description - the version of the plugin
     **/
    "version": null,
    /**
     *@memberof Manifest
     *@name api_version
     *@type {String}
     *@description - the api version the plugin use (Necessary for backward compatability)
     **/
    "api_version": null,
    /**
     *@memberof Manifest
     *@name dependencies
     *@type {Array}
     *@description - configure internal plugins dependencies, when upload from the admin will throw exception if dependencies is not valid.
     **/
    "dependencies": null,
	/**
     *@memberof Manifest
     *@name viewConfig
     *@type {Object}
	 *@description - Default data for all instances of this pluging.
     **/
    "viewConfig": null
};

/**
 * @name Convertor
 * @allows the plugin to convert its data to the player format
 * @static
 * @class
 **/
var Convertor = function(){
     /**
     * invoke the data to player conversion method
    * @method dataToPlayerModel
    * @memberof Convertor
    * @param {Object} data - all data object needed for conversion
    * @param {Object} helper - helper functions for the conversion
    * @param {Function} helper.sequenceDataConverter - function that converts sent sequence data to DL player format
    * @param {Function} helper.taskInformation - function that sends information about a task.
    * @example
    *  helper.sequenceDataConverter(
        seqData: {
                settings: {
                    title: ...,
                    type: basic or shared,
                    exposure: ...,
                    sharedBefore: true/false
                },
                helpItems: [{ id: help item id, item: help item caption}, ...],
                sharedArea: shared area id,
                tasks: [tasks ids...]
            })
    * @example
    *  helper.getTaskInformation(
        {
            "taskId":"xxx"
        })
        @ getTaskInformation returns {Object} {"checkable":false / true}
    */

    this.dataToPlayerModel = function(data, helper){};
};

/**
 * @name Template
 * @description Mapping of possible templates each of which is array of data contains the tree of the plugin, the doc here is recursive to all children.
 * @static
 * @class
 **/

var Template = {
	templateKey: [
		{
			/**
			 * @memberof Template
			 * @name children
			 * @type {Array}
			 * @description - children of the plugin, can use inner CGS libs as textViewer/imageViewer/etc...
			 **/
			children: [],
			/**
			 * @memberof Template
			 * @name type
			 * @type {String}
			 * @description - the type of the item
			 **/
			type: "textViewer",
			/**
			 * @memberof Template
			 * @name data
			 * @type {Object}
			 * @description - the data of the item
			 **/
			data: {}
		}
	]
}

/**
 * @name BundleManifest
 * @description Describe bundle manifest properties
 * @class BundleManifest
 * @example
 *{
*	"id": "vocabulary",
*	"name": "Vocabulary",
*	"version": "1.0"
*}
 * @static
 **/


var BundleManifest = {
    /**
     *@memberof BundleManifest
     *@name id
     *@type {String}
     *@description - the unique id of the bundle
     **/
    "id": null,
    /**
     *@memberof BundleManifest
     *@name name
     *@type {String}
     *@description - the name of the bundle (for display in CGS Admin)
     **/
    "name": null,

    /**
     *@memberof BundleManifest
     *@name version
     *@type {String}
     *@description - the version of the bundle
     **/
    "version": null
}
/**
 * @name SystemEditors
 * @description Describe internal cgs editors
 * @class
 * @static
 **/

var SystemEditors = {
    /**@function
     * @param {Object} data - configuration
     * @param {Object} [data.title] - text viewer content
     * @param {String} [data.mode] - <dl>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">singleStyle</dt>
     *                                      <dd style="font-size: 12px;">
     *                                          Regular text viewer
     *                                      </dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">bankStyle</dt>
     *                                      <dd style="font-size: 12px;">Text viewer with bank style</dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">noInfoBaloon</dt>
     *                                       <dd style="font-size: 12px;">Text viewer without info baloon feature</dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">singleStyleNoInfoBaloon</dt>
     *                                      <dd style="font-size: 12px;">Text viewer without info baloon feature (including all other features)</dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">singleStylePlainText</dt>
     *                                      <dd style="font-size: 12px;">Text Viewer load with default style</dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">plain</dt>
     *                                      <dd style="font-size: 12px;">Plain text without styles and effects</dd>
     *                                   <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">thin</dt>
     *                                      <dd style="font-size: 12px;">Text viewer is expand while typing</dd>
     *                                </dl>
     * @param {String} [data.styleOverride] - add default class to paragraph container
     * @param {Boolean} [data.deletable] - define if the user can remove the component
     * @param {Object} [data.stageReadOnlyMode] - if set to true user cannot edit this compnent
     * @param {Object} [data.width] - the minimum width
     * @param {Object} [data.availbleNarrationTypes] - set array of options to narrate the text viewer the availible narration types are:
     *
     * <dl>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">Per Paragraph</dt>
     *                                      <dd style="font-size: 12px;">
     *                                          narrate every paragraph in the text
     *                                      </dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">General</dt>
     *                                      <dd style="font-size: 12px;">General narration for all the content</dd>
     *                                  <dt style="float: none;margin:0;padding:0;background-color: #DEDC90; color: white; text-align: center; font-weight: bold">None</dt>
     *                                       <dd style="font-size: 12px;">no narration define</dd>
     *                                </dl>
     *                                <h2>Example</h2>
     *
     *                                                  <code style="margin: 0; padding: 0;">
     *                                                  [{"name":"None", "value": ""},
     *                                                  {"name":"General", "value": "1"},
     *                                                  {"name":"Per Paragraph", "value": "2"}]
     *
     *                                                  </code>
	 * @param {Boolean} [data.singleLineMode] - Set single line mode for text viewer
	 * @param {Number} [data.MaxChars] - Maximum content length
     */
    "textViewer": {
    },
    /**
     * @function
     * @param {Object} data - configuration
     * @param {String} [data.title] the image title
     * @param {String} data.image - image source
     * @param {String} [data.copyrights] - image copyrights
     * @param {Boolean} [data.showCopyrights] - show copyrights on the image
     * @param {Boolean} [data.showCaption] - show image caption
     * @param {Boolean} [data.showSound] - show image sound button
     */
    "imageViewer": {

    },
    /**
     * @function
     * @param {Object} data - configuration
     * @param {String} data.title - instruction content
     * @param {Boolean} [data.show] - show the instructions
     * @param {Boolean} [data.deletable] - make the editor deletable
     */
    "instruction": {

    },
    /**
     *@function
     *@memberof SystemEditors
     *@name soundButton
     *@type {Object}
     *@description - displayed as button that play a sound
     **/
    "soundButton": {

    },
    /**
     * @function
     * @memberof SystemEditors
     * @name audioPlayer
     * @type {String}
     * @description - advanced audio player supports in multiple formats
	 * @param {Object} data - configuration
	 * @param {Boolean} data.isThinMode - Hide additional properties (like title, copyrights)
     **/
    "audioPlayer": {

    },

    /**
     * @function
     * @memberof SystemEditors
     * @name videoPlayer
     * @type {String}
     * @description - advanced video player supports in multiple formats
	 * @param {Object} data - configuration
	 * @param {Boolean} data.isThinMode - Hide additional properties (like title, copyrights)
     **/
    "videoPlayer": {

    },

    /**
     * @function
     *@memberof SystemEditors
     *@name applet
     *@type {String}
     *@description - external application
     **/
    "applet": {

    }
}