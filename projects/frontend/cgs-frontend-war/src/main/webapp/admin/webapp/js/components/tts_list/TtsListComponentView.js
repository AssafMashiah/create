define(['lodash', 'BaseView', 'events', 'text!./components/tts_list/templates/TtsListComponentView.html'],
	function (_, BaseView, events, template) {
	    var TtsComponentView = BaseView.extend({
	    	el: "#list",
	    	events: {
	    		"click #add_item": 'add',
	    		"click .delete-item": 'delete'
	    	},
	        initialize: function (options) {
	        	if (options.data) {
	        		this.data = options.data;
	        	} else {
	        		this.data = [];
	        	}

	        	this.$el = $(options.el);
	        	this.update_model = options.update_model;

	            this._super({}, options);
	        },
	        render: function () {
	        	this._super(template);
	        },
	        'delete': function (e) {
	        	var id = $(e.target).attr('data-id');

	        	this.data = _.reject(this.data, function (item) {
	        		return parseInt(item.id) === parseInt(id);
	        	})

	        	this.update_model(this.data);

	        	this.render();
	        },
	        searchProvider: function (id) {
	        	return _.find(this.data, function (item) {
	        		return item.id === id;
	        	});
	        },
	        'add': function (data) {
	        	var dialogConfig = {
					title: "Select Text-to-Speech Service Settings",
					content:{
						text: "",
						icon:""
					},
					buttons:{
						'yes': { label:'OK', value: true },
						'cancel': { label:'Cancel', value: false }
					},
					providers: this.controller.getProviders()
				};

				events.once('onTTSDialogClose', function(val) {
					if (val && !this.searchProvider(val.id)) {
						this.data.push(val);
			        	this.update_model(this.data);
			        	this.render();
					} 
				}, this);

				require('dialogs').create('tts', dialogConfig, 'onTTSDialogClose');
	        }
	}, {type: 'TtsComponentView'});

    
    return TtsComponentView;
});