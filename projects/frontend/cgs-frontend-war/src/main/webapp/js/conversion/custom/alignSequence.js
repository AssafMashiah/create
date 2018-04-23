define( [ "require", "jquery", "mustache", "lodash"],
    function( require, $, mustache, _ ) {
        var json = undefined,
        taskState = initTaskState(),
            help_items = [];
        function alignSequence(data, _json) {
            json = _json;
            var parent = json[data.id];
             help_items = handle_and_remove_help_items(parent);

             data.cgsversion = require('configModel').configuration.version;

            _.each(parent.children, function(childId) {
                var currentTaskId = childId;
                if(json[childId].type == 'compare'){
                    //handle compare task..
                    for (var i = 0; i < json[childId].children.length; i++) {
                        //get the task obj
                        currentTaskId = json[childId].children[i];

                        for (var j = 0; j < json[currentTaskId].children.length; j++) {
                            handleTask(currentTaskId,json[currentTaskId].children[j], j);
                        }
                        //reset params
                        taskState = initTaskState();
                    }
                }else{
                    //var temp = require('cgsUtil').cloneObject(json[childId].children); //json{childId] is been change during the handleTask function
                    taskState = initTaskState();
                    _.each(json[childId].children,
                        function(element,index){
                            handleTask(currentTaskId,element,index);
                        });
                }

            });
        }

        /**
         * initialize the task state to null values
         * @returns empty TaskState object
         */
        function initTaskState(){
            return {
                hasInstruction: false,
                hasProgress: false,
                taskId: null,
                instructionId: null,
                instructionIndex:null,
                progressId: null
            };
        }

        function isTask () {
            return taskState.hasInstruction && taskState.hasProgress;

        }

        function handleTask  (currentTaskId,childIds, index) {

            if(json[childIds].type == "instruction") {
                taskState.hasInstruction = true;
                taskState.taskId = currentTaskId;
                taskState.instructionId = childIds;
                taskState.instructionIndex = index;
            }
            if(["advancedProgress", "progress"].indexOf(json[childIds].type) >= 0) {
                taskState.hasProgress = true;
                taskState.progressId = childIds;
                if (taskState.instructionIndex != undefined){
                    json[taskState.taskId].children.splice(taskState.instructionIndex,1);
                    json[taskState.progressId].children.push(taskState.instructionId);
                    delete taskState.instructionIndex ;
                }
                if(help_items) {
	                var help_item = create_help(help_items,taskState.taskId);
	                if(help_item){
	                  json[taskState.progressId].children.push(help_item);
                    }
                }
            }


        }

        /**
         * create new help_items wrapper element
         * @param items
         * @param parent_id
         * @returns {*}
         */
        function create_help(items,parent_id)
        {
            if(!items || !items.length){
                return false;
            }

            var help_id = require('repo').genId();
            json[help_id] = {
                children : items,
                type : 'task_help',
                parent : parent_id,
                data : {}
            }
            return help_id;
        }

        /**
         * if the sequence has help children then
         * 1.remove them from the sequence children
         * 2.add the [name] to the help json entity
         * @param parent
         * @returns {*}
         */
        function handle_and_remove_help_items(parent)
        {
            var results =  _.map(parent.data.help,function(element){
                //remove the help items from the sequence children
                var index = parent.children.indexOf(element.id);
                if(index != -1){
                    parent.children.splice(index, 1);
                }

                //add the help name to the help data entity
	            json[element.id] && (json[element.id].data.caption = element.item);

                return element.id;
            });

            delete parent.data.help ;
            return results;
        }

        return alignSequence;
    });