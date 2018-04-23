define(['jquery','lodash', 'clipboardManager'], function ($, _, clipboardManager) {
	
	function FocusManager(){
		this.focusedElement = null;
		this.bindMousedown();
	}
	
	FocusManager.prototype = {

		bindMousedown: function(){

			$(document).mousedown(_.bind(function(event){

				var newFocusedElement, $newFocused ;

				$newFocused = $(event.target);
				
				if (!$newFocused.attr('focusCapture')){
					$newFocused = $(event.target).parents('div[focusCapture]');
				}

				if ($newFocused)
					newFocusedElement = $newFocused.attr('focusCapture');

				if(newFocusedElement)
					this.setFocused(newFocusedElement, $newFocused);

			},this));
		},

		getFocusedElement: function(){
			return this.focusedElement;
		},

		setFocused: function(newFocusedElement, $focused){

			if (this.$focused)
				this.$focused.removeClass('focused');

			this.focusedElement = newFocusedElement;
			this.$focused = $focused;

			this.$focused.addClass('focused');

			// Remove focused item of clipboard manager
			if(this.focusedElement == 'props' || this.focusedElement == 'stage') {
				clipboardManager.setFocusItem(null);
			}
		}
	};

	return new FocusManager();

});