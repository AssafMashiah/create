define(['jquery', 'modules/BaseDialogScreen/BaseDialogScreenView', 'text!modules/DialogScreen/templates/DialogScreenView.html'],
function($, BaseDialogScreenView, template) {

	var DialogScreenView = BaseDialogScreenView.extend({

		el: '#base',

		initialize: function(controller) {
			this._super(controller);
		},
		initTemplate: function(){
			this.template = template;
		},

		render: function(){
			this._super();
			this.addButton('Close', 'closeButton', _.bind(function(event){
				//before close function
				if(typeof(this.controller.editor.beforeClose) == "function"){
					this.controller.editor.beforeClose(_.bind(function(){
						event.stopPropagation();
						this.backToTask(event);
					}, this));
				}else{
					event.stopPropagation();
					this.backToTask(event);
				}
			},this));
		}

	}, {type: 'DialogScreenView'});

	return DialogScreenView;

});