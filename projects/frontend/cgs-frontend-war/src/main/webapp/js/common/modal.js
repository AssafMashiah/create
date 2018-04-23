define(['events', 'common/ModalView'], function(events, ModalView) {

	function Modal() {
		this.view = new ModalView({'controller' : this});
		this.registerEvents();
	}

	Modal.prototype = {

		registerEvents : function(){
			events.register('showModal');
			events.register('closeModal');
		},

		show: function(view){
			this.view.show(view);
		}

	}

	return new Modal();

});
