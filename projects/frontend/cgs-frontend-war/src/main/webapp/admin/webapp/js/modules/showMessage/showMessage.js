define(['lodash', 'jquery', 'modules/showMessage/constants', 'dialogs', 'events', 'mustache', 'translate'],
	function (_, $, constants, dialogs, events, Mustache, i18n) {

		function ShowMessage() {

			this.serverError = new ServerError(this, constants);
			this.serverSuccess = new ServerSuccess(this);
            this.clientError = new ClientError(this, constants);

            function ClientError(parent, constants){
                this.constants = constants;
                this.show = function(error){
                    if(error.title && error.message) {
                        parent.showDialog(error.title,{"message": error.message});
                    } else {
                        var consError = _.find(this.constants.errors, function(err) { return err.errorId == error.errorId; });
                    	if (consError && error.data instanceof Array) {
                    		var msg = _.chain(error.data)
		                    			.map(function(errCode) {
			                    			return this.constants.friendlyMessages[errCode] || errCode;
			                    		}, this)
			                    		.compact()
			                    		.value()
			                    		.join('<br />');
			                  parent.showDialog(consError.message, { 'message': msg });
                    	}
                    	else if (consError) {
                            parent.showDialog(consError.description, {"message": consError.message, "srcMessage": error.srcMessage, "data": error.data})
                        }
                    	else {
                    		parent.showDialog('Unknown Error', { message: 'Unknown Error' + (error.data ? error.data : "" ) });
                    	}
                    }
                }
            }

			function ServerError(parent, constants) {
				this.constants = constants;

				this.show = function (jqXHR) {
					if ([0, 403, 500].indexOf(jqXHR.status) >= 0) { //XMLHTTPRequest object
						this.showErrorMessageByHttpStatus(jqXHR.status);
					} else {
						if (!!jqXHR.responseText.length) {
							var responseJson = JSON.parse(jqXHR.responseText);
							this.showErrorMessageByErrorId(responseJson.errorId, responseJson.data);
						}
					}
				};

				this.showErrorMessageByErrorId = function (errorId, data) {
					var arr_errors = _.where(this.constants.errors, {"errorId":errorId});
					if(arr_errors.length) {
						var errorData = arr_errors[0];
						errorData.data = data;
						parent.showDialog("Server Error", errorData);
					}
				};

				this.showErrorMessageByHttpStatus = function (httpStatus) {
					var arr_errors = _.where(this.constants.errors, {"httpStatus":httpStatus});
					if(arr_errors.length) {
						var errorData = arr_errors[0];
						parent.showDialog("Server Error", errorData);
					}
				}

			}

			function ServerSuccess(parent) {
				this.show = function(message) {
					parent.showDialog("Server Success", {'message' : message || "Server Success"});
				}
			}

			this.showAlert = function(title, message) {
				var dialogConfig = {
					title:title,
					content:{
						text: Mustache.render(i18n._(message.message), message),
						icon:'warn'
					},
					buttons:{
						'cancel':{ label:'close', value: true }
					}
				};

				events.register('onShowMessage', this.onShowMessage, this);

				var dialog = dialogs.create('simple', dialogConfig, 'onShowMessage');
				dialog.show();
			}

			this.showDialog = function(title, message, callback) {
				var dialogConfig = {
					title:title,
					content:{
						text: Mustache.render(i18n._(message.message), message),
						icon:'warn'
					},
					buttons:{
						'cancel':{ label:'close', value: false },
						'ok':{label: 'ok', value: true},
					}
				};

				events.once('onDialogConfirmation', function (response) {
					
				}, this);

				var dialog = dialogs.create('simple', dialogConfig, 'onDialogConfirmation');
				dialog.show();
			}

			// Get error data (description and message) by error id
			this.getErrorById = function(errId) {
				var error = _.find(constants.errors, function(err) { return err.errorId == errId; });
				if (error) {
					return {
						description: error.description,
            			message: error.message
					}
				}
			}

			this.onShowMessage = function(response) {
				switch( response ) {
					case 'cancel' : {
						/////////////////////////
						// do nothing
						/////////////////////////
						break ;
					}
				}
			}

		}

		return new ShowMessage();
	}
);