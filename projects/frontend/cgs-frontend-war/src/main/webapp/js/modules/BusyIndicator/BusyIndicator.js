define(['lodash', 'jquery', 'events', './modules/BusyIndicator/BusyIndicatorView'],
	function(_, $, events, BusyIndicatorView) {

		function BusyIndicator() {
			
			this.view = new BusyIndicatorView( { controller: this} );
			this.depth = 0;

			this.bindEvents();

		}

		BusyIndicator.prototype = {

			bindEvents: function () {
				events.register('busyIndicator.showCancel', this.showCancel, this);
				events.register('busyIndicator.enableCancel', this.enableCancel, this);
			},
			
			start: function(){
				if (this.depth == 0){
					this.view.start();
					require('repo').busy(true);
				}

				this.depth++;
			},

			stop: function(all){
				this.depth--;

				if(this.depth <= 0 || all) {
					this.depth = 0;
					this.view.stop();
					require('repo').busy(false);
				}
			},

			setData: function(label, percentage) {
                this.view.setData(label, percentage);
			},

			showCancel: function (isShowCancel) {
				this.view.showCancel(isShowCancel);
			},

            enableCancel: function (isEnable) {
                this.view.enableCancel(isEnable);
            },

			cancelAction: function () {
				var cancelClickedEvent = 'busyIndicator.cancel.clicked';

				if (events.exists(cancelClickedEvent)) {
					events.fire(cancelClickedEvent);
				}
			}
		};

		return new BusyIndicator();
});