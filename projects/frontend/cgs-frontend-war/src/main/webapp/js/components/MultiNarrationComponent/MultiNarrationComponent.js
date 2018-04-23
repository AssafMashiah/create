define(['lodash', 'jquery', 'repo', 'BaseView', 'userModel', 'events', 'text!./components/MultiNarrationComponent/templates/MultiNarrationComponent.html'], 
	function (_, $, repo, BaseView, userModel, events, template) {
	var MultiNarrationComponent = BaseView.extend({
		appendToSelector: true,
		clearOnRender: true,
		initialize: function (options) {
			if (options.model) {
				this.selected_locales = _.toArray(_.filter(require("configModel").getMultiNarrationsLocales(), function (item) {
                    return ~options.model.indexOf(item.locale);
                }));
			}
			//component element wrapper
            this.$el = $(options.el);

            this._super(options);
		},

		events: {
			"click #add_narration_locale": "add_narration_locale",
			"click .x-button-container": 'deleteLocale'
		},
		on_narration_dialog_close: function (response) {
			if (response) {
				this.selected_locales = response;
				this.options.update_model(this.selected_locales);

				this.render();
			}
		},
        showDeleteWarning: function (callback) {
        	if(!repo.getChildrenByTypeRecursive(repo._courseId, 'lesson').length){
        		callback.call(this, true);
			}else{
				
	            var warning_dialog_config = {
					title: "Delete Additional Narration Language",
					content: {
						text: "You are about to delete the selected language. This action removes all Text to Narrate and Narration files attached to the course for this language.</br> Are you sure you want to delete the selected language?"
					},
					closeOutside: false,
					buttons:{
						'ok':{ label:'OK', value: true },
						'cancel':{ label:'Cancel', value: false }
					}
				};
	            
	            events.once('onDialogClose', callback.bind(this));
	            
	            require('dialogs').create('simple', warning_dialog_config, 'onDialogClose')
			}
        },
		deleteLocale: function (e) {
            
            this.showDeleteWarning(function (response) {
                if (response) {
                	var list_item = $(e.target).parents('li'),
                        locale = list_item.attr('data-value');
                        
                    require("courseModel").saveCourse(function () {
                    	require("busyIndicator").start();
                    	require("cgsUtil").clearLocaleNarrations(locale, function () {
	                    	require("courseModel").openCourse(require("repo")._courseId, function () {
	                    		var router = require('router');
	                    		router.load(router._static_data.id, router._static_data.tab, router._static_data.page);

	                        	//get lock for the course
								events.fire("lock", "course");
	                    	
	                        	require("busyIndicator").stop();
								});
                    	});
                    });
                }
            }.bind(this));

			return true;
		},
		add_narration_locale: function () {
			var narration_dialog_config = {
				title: "Additional Narration Languages",
				content: {
					text: "Select to Add Narration Languages:"
				},
				closeOutside: false,
				buttons:{
					'add':{ label:'Add', value: true },
					'cancel':{ label:'Cancel', value: false }
				}
			};

			if (this.selected_locales) {
				narration_dialog_config = _.extend(narration_dialog_config, { model: this.selected_locales });
			}

			events.once('onDialogClose', this.on_narration_dialog_close.bind(this));

			require('dialogs').create('narrations_locales', narration_dialog_config, 'onDialogClose')
		},
		render: function () {
			this._super(template);
		}
	});

	return MultiNarrationComponent;
});