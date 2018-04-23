define(['Class', 'busyIndicator'], function (Class, BusyIndicator) {
	var PluginSpinnerModel = Class.extend({
		initialize: function () {
			this.started = false;
		},
		start: function () {
			this.started = true;

			BusyIndicator.start();
		},
		stop: function () {
			this.started = false;
			
			return BusyIndicator.stop();
		},
		forceStop: function () {
			this.started = false;
			
			return BusyIndicator.stop(true);
		}
	});	

	return new PluginSpinnerModel;
});