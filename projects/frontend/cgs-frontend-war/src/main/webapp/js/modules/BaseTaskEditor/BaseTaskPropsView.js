define(['jquery', 'BasePropertiesView', 'text!modules/BaseTaskEditor/templates/TaskPropsEditor.html',
        'StandardsList','standardsModel', 'repo',
	    'text!modules/BaseTaskEditor/templates/TaskPropsEditor.html',
		'text!modules/BaseTaskEditor/templates/TaskSettingsWrapper.html'
        ],
function($, BasePropertiesView, template, StandardsList, standardsModel, repo) {

	var BaseTaskPropsView = BasePropertiesView.extend({

		initialize:function f70(options) {
			this.initTemplate();
			this._super(options);
		},

        render: function() {
            this._super();
			var id = this.controller.config.id;

	        if (this.controller.enableStandards) {
		        this.standardsList = new StandardsList(
			        {
				        itemId: '#standards_list',
				        repoId: id,
				        getStandardsFunc: _.bind(function () {
					        return standardsModel.getStandards(id);
				        }, this)
			        });
	        }
        },
		initTemplate: function(){
			this.template = template;
		},
	
		toggleIntegrationSharedDdl:function f72(isShow) {
			if (isShow) {
				this.$el.find(".sharedIntegrationg").show();
			} else {
				this.$el.find(".sharedIntegrationg").hide();

			}
		}

	}, {type: 'BaseTaskPropsView'});

	return BaseTaskPropsView;

});