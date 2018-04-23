define(['jquery', 'BaseView', 'events'],
function($, BaseView, events) {

	var ModalView = BaseView.extend({

		tagName: 'div',
		className: 'screenModal',

		template: '<div class="screenModal_content"/>\
				   <div class="screenModal_x">X</div>',

		events: {
			"click .screenModal_x" : "close"
		},

		initialize: function(options) {
			this._super(options);
			this.initShorthand();
			this.initMask();
			this.initMembers();
		},

		initMembers: function(){
			this._docHeight = $(document).height();
		},

		initMask: function(){
			this._screenMask = $('<div class="screenMask"/>').insertBefore(this.$el);
		},

		initShorthand: function(){
			this._content = this.$el.find('.screenModal_content');
			this._x = this.$el.find('.screenModal_x');
		},

		render: function(){
			this.$el.append(this.template).appendTo($('body'));
		},

		show: function(view){
			view.render(this._content);
			this.$el.show();
			this._screenMask.show();
			this.alignModal();
		},

		alignModal: function(){
			var top = ((this._docHeight - this._content.height()) / 2) + 'px';
			this._content.css('marginTop', top); 
			this._x.css('top', top);
		},

		close: function(){
			this.$el.hide();
			this._screenMask.hide();
			this._content.empty();

			events.fire('closeModal');
		}

	}, {type: 'ModalView'});

	return ModalView;

});
