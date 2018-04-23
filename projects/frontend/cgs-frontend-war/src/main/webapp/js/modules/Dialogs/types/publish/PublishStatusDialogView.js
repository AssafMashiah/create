define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
	'text!modules/Dialogs/types/publish/templates/PublishStatusDialog.html'],
	function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var PublishStatusDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog-publishStatus',

		initialize: function(options) {
			// pointers to the functions on publishModel
			this.getPackagePhase = options.config.getPackagePhase;
			this.getPackageStatus = options.config.getPackageStatus;
            this.getConversionResults = options.config.getConversionResults;
            this.getPackagePercentStatus = options.config.getPackagePercentStatus;
            this.getErrors = options.config.getErrors;
            this.phases = options.config.publishTargets;
            this.packageId = options.config.packageId;
            this.publisherId = options.config.publisherId;

			this.courseTitle = options.config.courseTitle;
			this.customTemplate = template;

			this._super(options);
		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);

			// ask the server every 1 second to update the status
			this.timer = setInterval(this.getStatus.bind(this), 1000);

			// register to the "update status from server" event - when the event is fire - update the status in the dialog
			events.register('publishStatusUpdated', this.updateStatus, this);
			events.register('publishStatusError', this.updateStatus, this);

			// first time the dialog is up - update according to the current phase of the publish process
			this.getStatus();
		},

		getStatus: function(){
			// send request for the server to update the publish status
			this.getPackageStatus();
		},

		updateStatus: function() {

			// update the current phase in the dialog GUI
			this.publishPhase = this.getPackagePhase(); // get the phase from publishModel
			this.conversionResults = this.getConversionResults();
            this.componentsProgressInPercent = this.getPackagePercentStatus();
            this.errors = this.getErrors();

			for(var phase in this.componentsProgressInPercent){
				var phaseProgress =  this.componentsProgressInPercent[phase];
				this.setPercentage(phaseProgress, phase);
			}

			// bubbling - if false - meaning this is the phase we start the dialog from (Reverse order)
			//				if true - we are marking phases as done.
			var bubbling = false;

			// handling the DIV's classes according to the current phase
			switch (this.publishPhase) {
				case "COMPLETED" :
				case "FAILED" :
				case "CANCELED" :
					// if the phase is completed - all other DIVs should get the icon-ok mark on
					// if the phase is failed/canceled the text in this DIV should change and the other DIVs should be as they are at the moment
					switch (this.publishPhase) {
						case "COMPLETED" :
							logger.info(logger.category.PUBLISH, 'Course publish end');
							bubbling = true;
							break;
						case "FAILED" :
							logger.warn(logger.category.PUBLISH, { message: 'Course publish failed', errors: this.errors });
							this.$('#dialogContent .currentPhase i.icon-ok-publish')
                                .removeClass('icon-ok-publish done dont-show')
                                .addClass('fail icon-remove-publish');
							break;
						case "CANCELED" :
							logger.info(logger.category.PUBLISH, 'Course publish canceled');
							this.$('#dialogContent i.icon-ok-publish').each(function() {
								var step = $(this).prev('label').text().substr(0, 3);
								$(this).prev('label').text(step + "Publish Canceled");
							});
							break;
					}

					// clear interval of getting the phase from the server
					this.timer = clearInterval(this.timer);
					events.unbind('publishStatusUpdated', this.updateStatus);
					events.unbind('publishStatusError', this.updateStatus);

					// change the button from cancel to close
					this.changeCancelToClose();
					// if the phase is not completed - stop changing the dialog GUI
					if (!bubbling) {
						break;
					}
				case "PUBLISHING" :
					if (this.publishPhase === "PUBLISHING") {
						$('#dialogControls #cancel').addClass('disabled');	
					}
					if (bubbling) {
                        _.each(this.conversionResults, function(result, key){
                            if(result.status == "COMPLETED"){
                                _.each(result.tokens, function(token){
                                    var a = $('<iframe />');
                                    a.attr("src", Mustache.render(location.origin + '/cgs/rest/publishers/{{publisherId}}/packages', this) + "/download/" + token);
                                    a.attr("id","tokenDownloadIframe");
                                    $('body').append(a);
                                }.bind(this));
                            }
                        }.bind(this));
					}
			}
		},
		setPercentage : function( perc , pahaseId){
			
			this.$("#"+pahaseId).find('.percents-progress').css('width',perc + '%');
			if(perc < 100){
				if(perc > 0){
					this.$("#"+pahaseId).find('.percents-area').removeClass('hide-progress');
				}
				this.$("#"+pahaseId).addClass('currentPhase');
			}
			if(perc == 100){
				this.$("#"+pahaseId).find('.percents-area').addClass('hide-progress');
				this.$("#"+pahaseId).find('.icon-ok-publish').addClass('done');
				this.$("#"+pahaseId).removeClass('currentPhase');
			}
        },

		changeCancelToClose: function(){
			// change the button from cancel to close and change the click handler
			this.btn = $('#dialogControls #cancel');
			this.btn.removeClass("disabled");
			this.btn.text(require( "translate").tran( "Close" )).unbind('click').click(_.bind(
				function() {
                    $("#tokenDownloadIframe").remove();
					this.controller.setReturnValue('publishStatus', this.publishPhase) ;
					this.controller.onDialogTerminated('publishStatus');
				}, this));
		}

	}, {type: 'PublishStatusDialogView'});

	return PublishStatusDialogView;

});