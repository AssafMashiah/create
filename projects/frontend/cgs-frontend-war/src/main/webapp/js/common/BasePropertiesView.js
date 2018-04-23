define(['jquery', 'BaseView', 'rivets', 'events', 'types'],
function($, BaseView, rivets, events , types) {

	var BasePropertiesView = BaseView.extend({

		el: '#props_base',

		rivetsView: {},

		initialize: function(options) {
			this._super(options);

			this.handleComponents();
		},

		components: {},

		handleComponents: function () {
			var _components = this.constructor.components;

			if (!_components) return false;
			else {
				_.each(_components, function (_component_item) {
					if (_component_item.condition && !_component_item.condition.call(this)) return false;

					if (!_component_item.name) {
						throw new TypeError("component name is not defined");
					} else {
						require([_component_item.type], function (comp) {
							_component_item.update = function (model, key, value) {
								model.set(key, value);

								require("repo").updateProperty(this.controller.record.id, key, value);
							}.bind(this);

							_component_item.model = function (component) {
								var obj = {};

								_.each(component.component_model_fields, function (item) {
									var controller = this.controller || this.options.controller;

									obj[item] = controller.record.data[item];
								}, this);

								return obj;
							}.bind(this, _component_item);

							if (this.components[_component_item.name]) {
								this.components[_component_item.name].dispose();
								
								delete this.components[_component_item.name];
							}
							

							this.components[_component_item.name] = new comp(_component_item);
						}.bind(this));
					}
				}, this);
			}
		},

        fireTabNavigationEvent : function(){

            events.fire( "cgs-hints-align" );

        } ,

		render: function(partials) {
			if (typeof this.template === 'undefined') {
				throw new Error('No `template` field: ' + this.constructor.type);
			}

			this._super(this.template, partials);

            // Fire tab navigation event for global use.
            this.$( "[data-toggle=tab]" )
                .bind( "click" , this.fireTabNavigationEvent );

            this.setTaskSettingsButton();

		},
		setTaskSettingsButton: function(){
			//put the button only in task screen
			if(this.controller.screen && this.controller.screen.constructor.type === "TaskScreen"
				//put the button if it don't exists on the page
				&& !$(".taskSettingsButton").length){

				//find out if the task settings button needs to be displayed according to the record type
				var taskType = this.controller.record.type;
				var load = require('load');
				var editorObj = load(types[taskType].editor, null, types[taskType].loadOptions);
				var showTaskSettingsButton = (typeof editorObj.showTaskSettingsButton == "boolean" ? editorObj.showTaskSettingsButton : true);
				
				if(showTaskSettingsButton){

	            	var taskSettingsButton = '<div class="btn-group taskSettingsButton" data-toggle="buttons-radio">'+
			            '{{#showTaskSettingsButton}}'+
				            '<button id="btn_TaskSettings" class="btn right" canBeDisabled="false">'+
								require('translate').tran("task.settings.button")+
				            '</button>'+
			            '{{/showTaskSettingsButton}}'+
			        '</div>';

			        //prepend the button on the properties area
	            	this.$el.prepend(taskSettingsButton);
	            	//bind its event
	            	this.$('#btn_TaskSettings').on('click', function(){
	            		events.fire("task_showSettings");
	            	});
	            	//trigger radio modew functinality
	            	this.taskSettingsButton();
				}
            }
		},

		taskSettingsButton:function f952() {
			var toggleButton = (this.controller.screen.editor.elementId == this.controller.router.activeEditor.elementId);
			//reset buttons state
			this.$el.find('.btn-group').children().removeClass('active');

			if(toggleButton) {
				this.$el.find('#btn_TaskSettings').button('toggle');
			}
		},
		
		setFocus : function (model_attribute){
			this.$("input[data-checked*='" + model_attribute + "']").focus();
		},

		refresh: function() {
			this.options.appendToSelector = null; //remove appendToSelector property - used for build task settings
			this.remove();
			this.render();
			this.setInputMode();
			this.handleComponents();
		},

		startEditing: function(model, container) {
			this.rivetsView = rivets.bind(container || this.$('.editor-wrapper'), {obj: model});
		},

		//set the drop down type selected back to the previuos value
		setType: function(fieldId, value) {
			this.$(fieldId).val(value);

			//answer does not fire 'change event' on programmatically change
			//so there is a need to trigger the 'change event' programmatically
			this.controller.dontShowDialog = true;
			$(fieldId).trigger("change");
			this.controller && (this.controller.dontShowDialog = false);
		},
		dispose: function () {

            this.$( "[data-toggle=tab]" )
                .unbind( "click" , this.fireTabNavigationEvent );

			_.invoke(this.components, 'dispose');

			this._super();

			delete this.components;

		}



	}, {type: 'BasePropertiesView'});

	return BasePropertiesView;

});
