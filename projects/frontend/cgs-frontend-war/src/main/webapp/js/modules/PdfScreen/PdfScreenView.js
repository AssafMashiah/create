define(['BaseScreenView', 'text!modules/PdfScreen/templates/PdfScreenView.html'],
function(BaseScreenView, template) {

	var PdfScreenView = BaseScreenView.extend({
		el: '#base',

		initialize: function(options) {
			this._super(options);
		},

		render: function() {
			this._super(template);
		}

	}, {type: 'PdfScreenView'});

	return PdfScreenView;

});
