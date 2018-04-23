define(['jquery', 'BasePropertiesView', 'text!modules/LivePageBaseTaskEditor/templates/LivePageTaskPropsEditor.html',
        'StandardsList','standardsModel',
	    'text!modules/LivePageBaseTaskEditor/templates/LivePageTaskPropsEditor.html',
		'text!modules/LivePageBaseTaskEditor/templates/LivePageTaskSettingsWrapper.html'
        ],
function($, BasePropertiesView, template, StandardsList, standardsModel) {

	var LivePageBaseTaskPropsView = BasePropertiesView.extend({

		initialize:function f70(options) {
			this.initTemplate();
			this._super(options);
		},

        render: function() {
            this._super();
            this.standardsList = new StandardsList({
                itemId: '#standards_list',
                repoId: this.controller.config.id,
                getStandardsFunc: _.bind(function() {
                    return standardsModel.getStandards( this.controller.config.id);
                },this)
            });
        },
		initTemplate: function(){
			this.template = template;
		},

		dispose: function f71() {
			this.standardsList && this.standardsList.dispose();

			this._super();

			delete this.standardsList;
		},

		toggleIntegrationSharedDdl: function f72(isShow) {
			if (isShow) {
				this.$el.find(".sharedIntegrationg").show();
			} else {
				this.$el.find(".sharedIntegrationg").hide();

			}
		}

	}, {type: 'LivePageBaseTaskPropsView'});

	return LivePageBaseTaskPropsView;

});