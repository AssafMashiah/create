define([ 'modules/LivePageElementEditor/LivePageElementEditor', 'events', 'repo', 'repo_controllers', './LivePageBaseTaskPropsView' ,'commentsComponent'],
	function( LivePageElementEditor, events, repo, repo_controllers, LivePageBaseTaskPropsView, commentsComponent  ) {

	var LivePageBaseTaskEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {

			this._super(configOverrides);

			this.isTask = true;
			this.ignoreIsTaskOnActiveEditorSet = true;

			if (!configOverrides.previewMode) {

				//initialize a comment component that allows the user to add comments in the task
				this.commentsComponent = new commentsComponent({
					data: this.record.data.comments,
                    parentRecordId : this.record.id,
                    $parent : $(".commentsArea")
                });
			}

			if (!this.config.previewMode) {
				this.handleComponents();
			}
		},
		components: {},
		handleComponents: function f55() {
			var _components = this.constructor.components;

			if (!_components) return false;
			else {
				_.each(_components, function f56(_component_item) {
					if (_component_item.condition && !_component_item.condition.call(this)) return false;

					if (!_component_item.name) {
						throw new TypeError("component name is not defined");
					} else {
						require([_component_item.type], function f57(comp) {
							_component_item.update = function f58(model, key, value) {
								model.set(key, value);

								require("repo").updateProperty(this.record.id, key, value);
							}.bind(this);

							_component_item.model = function f59(component) {
								var obj = {};

								_.each(component.component_model_fields, function f60(item) {
									obj[item] = this.record.data[item];
								}, this);

								return obj;
							}.bind(this, _component_item);

							!_component_item.onUpdateDataCallback && (_component_item.onUpdateDataCallback = function f61() {
								return false;
							})

							_component_item.controller = this;
							
							if (this.components[_component_item.name]) {
								this.components[_component_item.name].dispose();
								
								delete this.components[_component_item.name];
							}

							if (this.view && this.view.$(_component_item.parentContainer).length) {
								this.components[_component_item.name] = new comp(_component_item);
							}

						}.bind(this));
					}
				}, this);
			}
		},
		dispose: function(){
			//dispose comment component
			this.commentsComponent && this.commentsComponent.dispose();

			_.invoke(this.components, 'dispose');

			this._super();

			delete this.components;
			delete this.commentsComponent;
		},
		startEditing: function f63(event) {
			if(event){
				event.stopPropagation();
			}
			// if (event) { // called from sequence screen on dblClick
			// 	var curTarget = $(event.currentTarget);
			// 	var elemId = curTarget.attr('data-elementid');
			// 	this.loadElement(elemId);
			// }
			// else {//called from Properties button
				this._super();
			// }

			this.handleComponents();
		},

		openEditor: function() {
			this.loadElement(this.record.id);
		},

		startPropsEditing: function(){
			if (this.config.previewMode) {
				this._super();
				this.registerEvents();
			}
			else {
				var parent = repo.getAncestorRecordByType(this.config.id, "html_sequence");
				this.showTaskSettingsButton = (typeof this.constructor.showTaskSettingsButton == "boolean" ? this.constructor.showTaskSettingsButton : true);

				if (!this.view) {
					this.view = new LivePageBaseTaskPropsView({controller:this});
				}
				else {
					this.view.initTemplate(); //default tab
					this.view.render();
					this.view.setInputMode();
					if (this.model) {
						this.model.off();
					}
				}

				this.registerEvents();

				if(this.showTaskSettingsButton) {
					this.showSettings();
				}

				this.view.toggleIntegrationSharedDdl((parent && parent.data && parent.data.type == "shared"));
			}
		},

		registerEvents: function() {
			var changes = {
				difficulty: this.propagateChanges(this.record, 'difficulty', true)
			};

			_.extend(changes, this.getGlobalEvents());

			this.model = this.screen.components.props.startEditing(this.record, changes);
			this.model.on('change:sharedIntegration', this.changeSharedIntegration, this);

			this.attachGlobalEvents();
		},

		showSettings:function f65() {

			//get controller for every task child
			var child_controllers = _.map(this.record.children, function f66(childId) {
				return repo_controllers.get(childId);
			});

			//render each child props into task props
			_.each(child_controllers, function f67(controller, index, list) {
				controller && controller.startPropsEditing && controller.startPropsEditing(
					{'clearOnRender':false, 'contentSelector':'.tab-content #properties', 'appendToSelector':'.tab-content #settings'});
			});
		},

		//fired after change selection of integration with shared
		changeSharedIntegration: function(event, val){
			if (val.length > 0){
				repo.startTransaction({ appendToPrevious: true });
				repo.updateProperty(this.config.id, 'sharedIntegration', val);
				repo.endTransaction();
			}
		},

		showComponent: function(componentName, show){
			//component exists, neet to display or hide it
			if(this.components && this.components[componentName]){
				if(show){
					this.components[componentName].show();
				}else{
					this.components[componentName].hide();
				}
			}else{
				//component dont exists, and need to display it- start the component
				if(show)
					this.handleComponents();
			}
		},

		endEditing: function(){
			if(this.model){
				this.model.unbind('change:sharedIntegration');
			}
			this._super();
		}

	}, {type: 'LivePageBaseTaskEditor'});

	return LivePageBaseTaskEditor;

});