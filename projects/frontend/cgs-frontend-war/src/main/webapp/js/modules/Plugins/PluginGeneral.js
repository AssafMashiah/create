define(['lodash', 'types', 'repo_controllers', 'repo', 'cgsUtil', "editMode" ],
	function(_, types, repo_controllers, repo, cgsUtil,editMode) {
	var PluginGeneral = Class.extend({

		//enable or disable events binding of the element and its children ( click, dblclick, mousein, mouseout)
		toggleEventsBinding: function(params){
			if (!params || !_.isObject(params) || !params.id) {
				throw new TypeError("Plugin General: Invalid options pass to toggleEventsBinding, need to pass: id");
			}
			if(params.id){
				var toggleEventsbind = function (id){
					var item =  repo_controllers.get(id);
					if(item){

						item.stage_view[params.bindEvents ? "bindStageEvents" : "unbindStageEvents"]();
						params.bindEvents && item.stage_view.bindDelete();
						_.each(item.record.children, toggleEventsbind);
					}
				};

				toggleEventsbind(params.id);

			}
		},

		//enable or disable drag and drop of the plugin children
		toggleSortableBinding : function(params){
			if (!params || !_.isObject(params) || !params.id) {
				throw new TypeError("Plugin General: Invalid options pass to toggleEventsBinding, need to pass : id");
			}
			if(params.id){
				var item =  repo_controllers.get(params.id);
				if(item && item.stage_view && item.stage_view.togggleSorting){

					item.stage_view.togggleSorting(params.sortable);
				}
				
			}

		},
		/*
		@params.types -Array  - the type of the plugin content to get in the list
		*/
		getPluginContentList : function(params){
			//get all plugin contents that are children of the active lesson
			var pluginContents = repo.getChildrenByTypeRecursive(require("lessonModel").lessonId, "pluginContent");
			return _.compact(_.map(pluginContents , function(plugin){
				if(params && params.types){
					var pluginPath = plugin.data.path.split(":");
					if(params.types.indexOf(pluginPath[1]) == -1){
						return null;
					}
				}
				return {
					"id": plugin.id,
					"name" : plugin.data.title
				};
			}));
		},

		/*initialize preview pop-up of a media element ( img, audio, video)*/
		initMediaPreview: function(params){
			if (!params || !_.isObject(params) || !params.mediaType || !params.previewTargetSelector || !params.src) {
				throw new TypeError("Plugin General: Invalid options pass to initMediaPreview, need to pass: mediaType,previewTargetSelector,src");
			}
			var PropertyPreviewUtil = require("PropertyPreviewUtil");
			PropertyPreviewUtil.initMediaPreview({
                'mediaType': params.mediaType,
                'previewTargetSelector': params.previewTargetSelector,
                'src': params.src
			});

		},
		//unbind preview pop-up of media element
		disposeMediaPreview : function(previewTargetSelector){
			var PropertyPreviewUtil = require("PropertyPreviewUtil");
			PropertyPreviewUtil.disposeMediaPreview({"previewTargetSelector" : previewTargetSelector});
		},
		initHelpComponent: function(params){
			if (!params || !_.isObject(params) || !params.parentId || !params.containerSelector){
				throw new TypeError("Plugin General: Invalid options pass to initMediaPreview, need to pass: parentId, containerSelector");
			}
			return cgsUtil.createHelpComponent(params);
		},

		getTaskInformation: function(params){
			if (!params || !_.isObject(params) || !params.taskId){
				throw new TypeError("Plugin General: Invalid options pass to getTaskInformation, need to pass: taskId");
			}
			var response = {
				"checkable" : false
			};
			var repoItem = repo.get(params.taskId);
			var type = require("types")[repoItem.type];
			//the repo item is a task element
			if(type.selectTaskType){
				if(repoItem.type == "appletTask"){
					var applet = repo.getChildrenByTypeRecursive(params.taskId , "applet");
					if(applet.length){
						response.checkable = applet[0].data.isCheckable;
					}
				}else{
					response.checkable = repoItem.data.task_check_type == "auto";
				}
			}
			return response;
		},

		subscribeToOpenSubMenu: function(params) {
			if (!_.isObject(params) || !params.recordId || !params.callback){
				throw new TypeError("Plugin General: Invalid options pass to subscribeToOpenSubMenu, need to pass: recordId, callback");
			}

			var controller = repo_controllers.get(params.recordId);
			if (controller) {
				controller.bindEvents({
					'openSubMenu': {'type': 'bind', 'func': params.callback, 'ctx': this, 'unbind': 'dispose'}
				});
			}
		},

		getReadOnlyMode: function (){
			return {"readOnlyMode" : require("editMode").readOnlyMode};
		}
	});

	return new PluginGeneral;
});