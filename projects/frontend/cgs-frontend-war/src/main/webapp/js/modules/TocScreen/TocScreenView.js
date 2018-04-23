define(['BaseScreenView', 'text!modules/TocScreen/templates/TocScreenView.html'],
function(BaseScreenView, template) {

	var TocScreenView = BaseScreenView.extend({

        el: '#base',

        initialize: function(options) {
            this.template = template;
			this._super(options);
		},

        render: function() {
            this._super(this.template);
        }

	}, {type: 'TocScreenView'});

	return TocScreenView;

});
