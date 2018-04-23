define(['lodash', 'jquery', './modules/BusyIndicator/BusyIndicatorView'],
	function(_, $, BusyIndicatorView) {

		function BusyIndicator() {
			
			this.view = new BusyIndicatorView( { controller: this} );
			this.depth = 0;

		}

		BusyIndicator.prototype = {
			
			start: function(){
				if (this.depth == 0){
					this.view.start();
				}

				this.depth++;
			},

			stop: function(all){
				this.depth--;

				if(this.depth <= 0 || all) {
					this.depth = 0;
					this.view.stop();
				}
			},

			setData: function(label, percentage) {

                    this.view.setData(label, percentage);

			}
		};

		return new BusyIndicator();
});