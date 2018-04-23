define(['jquery', 'events', 'modules/BaseDialogScreen/BaseDialogScreenView', 'text!modules/AppletDialogScreen/templates/AppletDialogScreenView.html'],
function($, events, BaseDialogScreenView, template) {

	var AppletScreenView = BaseDialogScreenView.extend({

		el: '#base',

		initialize: function(controller) {
			this._super(controller);			
		},

		initTemplate: function(){
			this.template = template;
		},
		render: function(){
			this._super();

			this.addButton('Cancel', 'closeButton', _.bind(function(event){
				if (!this.controller.editor.record.data.hasOwnProperty('appletData')) {
					var repo = require('repo');
					repo.revert();
					repo.startTransaction({ ignore: true });
					repo.remove(this.controller.editor.record.parent);
					repo.endTransaction();

					//call fail callback on applet model if exists
					var appletModel = require("appletModel");
					if( appletModel && appletModel.args && appletModel.args.failCallback &&
						typeof appletModel.args.failCallback == 'function'){

						appletModel.args.failCallback("user canceled applet add");
					}
				}
				event.stopPropagation();
				this.backToTask(event);
			},this));

			this.addButton('Done', 'cancelButton', _.bind(function(event){
				var self= this;

				//check if the applet has the data property, this data is added after the first time the applet is added successfuly
				var firstAppletInitialization = !this.controller.editor.record.data.hasOwnProperty('appletData');

				var appletDoneCallback = function () {
					//on the first time that the applet is closed successfuly after initialization,
					// we would like to call success callback defined in applet model
					if (firstAppletInitialization) {
						var appletModel = require("appletModel");
						if( appletModel && appletModel.args && appletModel.args.successCallback &&
							typeof appletModel.args.successCallback == 'function'){

							appletModel.args.successCallback();
						}
					}
					event.stopPropagation();
					self.backToTask(event);
				};

				//before close function
				if(typeof(this.controller.editor.beforeClose) == "function"){
					this.controller.editor.beforeClose(_.bind(function(){
						appletDoneCallback();
					}, this));
				}else{
					appletDoneCallback();
				}
			},this));
		}
		

	}, {type: 'AppletScreenView'});

	return AppletScreenView;

});