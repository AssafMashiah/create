define([ 'jquery', 'events'], function($, events) {
	function uploadUtil(){

	}
	uploadUtil.prototype= {
		getImageDimensions: function(path, obj){
			var img = $('<img id="tmpId"/>').attr('src', path).attr('imId',obj.id).bind("load",
				function(){
					events.fire('onImgDimensionsReady', img.width(), img.height(), obj);
					img.remove();
				});
			$('body').append(img);
		}
			
	};

	return new uploadUtil();

	
});