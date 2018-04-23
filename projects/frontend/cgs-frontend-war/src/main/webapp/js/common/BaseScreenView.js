define(['jquery', 'BaseView', 'userModel'], function($, BaseView, userModel) {

	var BaseScreenView = BaseView.extend({

		initialize: function(options) {
			this.removeModals();
			this._super(options);
		},

		// This function isn't really needed.
		removeModals: function() {
			$('body>.modal').remove();
		},

		render: function(template, partials) {
			this._super(template, partials);
			$(document).off('mousedown.triggerChange').on('mousedown.triggerChange', this.triggerChange);
			this.handleBackespaceHistory();
		},

		triggerChange: function(e) {
			if (document.activeElement) {
                if ((document.activeElement.tagName == 'INPUT' && ['text', 'password'].indexOf($(document.activeElement).attr('type')) > -1 ||
                document.activeElement.tagName == 'TEXTAREA')) {
	                $(document.activeElement).trigger('change');
	            }
	            else if ($(document.activeElement).attr('contenteditable')) {
	            	var el = e.target;
	            	if (el != document.activeElement && $(el).parents().index(document.activeElement) < 0) {
	            		$(document.activeElement).focusout();
	            	}
	            }
			}
		},

		handleBackespaceHistory: function () {
			 $(document).off("keydown.handleBackspace").on("keydown.handleBackspace", function (e) {
                if (e.which === 8) {
                    if (document.activeElement &&
                        (document.activeElement.tagName == 'INPUT' &&
                        ['text', 'password', 'url', 'number'].indexOf($(document.activeElement).attr('type')) > -1 ||
                        document.activeElement.tagName == 'TEXTAREA') ||
                        $(document.activeElement).attr('contenteditable')) {
                        return true;
                    } else {
                        return e.preventDefault();
                    }
                }
            }.bind(this));
		},
		adjustHeight: function () {
			var headerHeight = $('.screen-header').outerHeight();
			
			$('.screen-content').height("-webkit-calc(100% - " + headerHeight + "px)");
		}

	}, {type: 'BaseScreenView'});

	return BaseScreenView;

});
