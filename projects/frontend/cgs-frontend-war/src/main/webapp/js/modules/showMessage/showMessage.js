define(['lodash', 'jquery', 'modules/showMessage/constants', 'dialogs', 'alertComponent', 'dialogComponent', 'events', 'mustache', 'translate', 'busyIndicator'],
	function f1090(_, $, constants, dialogs, alertComponent, dialogComponent, events, Mustache, i18n, busy) {

		function ShowMessage() {

			this.serverError = new ServerError(this, constants);
			this.serverSuccess = new ServerSuccess(this);
            this.clientError = new ClientError(this, constants);

            function ClientError(parent, constants){
                this.constants = constants;
                this.show = function(data){
                	busy.stop(true);

                    if(data.title && data.message) {
                        parent.showAlert(data.title,{"message": data.message});
                    }
                    else if(data.errorId) {
                        var arr_errors = _.first(_.where(this.constants.errors, {"errorId":data.errorId}));
                        if (arr_errors) {
                            parent.showAlert(arr_errors.description, {
                    			"message": Mustache.render(arr_errors.message,data)
                    		});
                        }
                    }
                    else {
						parent.showAlert("UNKNOWN ERROR", {"message": i18n.tran('Unknown error occurred.')});
                    }
                }
            }

			function ServerError(parent, constants) {
				this.constants = constants;

				this.show = function f1091(jqXHR) {
                	busy.stop(true);

					if ([0, 403, 500].indexOf(jqXHR.status) >= 0) { //XMLHTTPRequest object
						this.showErrorMessageByHttpStatus(jqXHR.status);
					} else {
						if (!!jqXHR.responseText.length) {
							var responseJson = JSON.parse(jqXHR.responseText);
							this.showErrorMessageByErrorId(responseJson.errorId, responseJson.data);
						}
					}
				};

				this.showErrorMessageByErrorId = function f1092(errorId, data) {
                	busy.stop(true);

					var arr_errors = _.where(this.constants.errors, {"errorId":errorId});
					if(arr_errors.length) {
						var errorData = arr_errors[0];
						errorData.data = data;
						parent.showAlert(errorData.title || "Server Error", errorData);
					}
				};

				this.showErrorMessageByHttpStatus = function f1093(httpStatus) {
                	busy.stop(true);

					var arr_errors = _.where(this.constants.errors, {"httpStatus":httpStatus});
					if(arr_errors.length) {
						var errorData = arr_errors[0];
						parent.showAlert(httpStatus ? errorData.title || "Server Error" : "Network Problem", errorData);
					}
				}

			}

			function ServerSuccess(parent) {
				this.show = function(message) {
					parent.showAlert("Server Success", {'message' : message || i18n.tran("Server Success")});
				}
			}

			this.showAlert = function(title, message, noReplace) {
				//don't show alert twice
				if (this.alertComponent &&
				   (this.alertComponent.config.title === title)) {
					return;
				}

				dialogs.hide();

				var onCloseFunc = function() {
					dialogs.show.call(dialogs);
					delete this.alertComponent;
				};

				var alertContent = Mustache.render(message.message, message).trim();
				if (!noReplace) {
					alertContent = alertContent.replace(/(?:\r\n|\r|\n)/g, '<br />');
				} else {
					alertContent = alertContent.replace(/(?:\r\n|\r|\n)/g, ' ');
				}
					
				this.alertComponent = new alertComponent({
					title: title,
					message: alertContent,
					onClose: _.bind(onCloseFunc, this)
				});

				this.alertComponent.show();
			}

			this.showDialog = function(title, message, callback) {
				if (this.dialogComponent &&
				   (this.dialogComponent.config.title === title)) {
					return;
				}

				var onCloseFunc = function(ok) {
					callback && callback(ok);
					delete this.dialogComponent;
				};

				var content = Mustache.render(message.message, message).trim()
					.replace(/(?:\r\n|\r|\n)/g, '<br />');

				this.dialogComponent = new dialogComponent({
					title: title,
					message: content,
					onClose: _.bind(onCloseFunc, this)
				});

				this.dialogComponent.show();
			}

			this.showConfirmation = function(title, message, callback) {
				var dialogConfig = {
					title: title,
					content: {
						text: message,
						icon: 'warn'
					},
					buttons: {
						"ok": { label: 'Ok' },
						"cancel": { label: 'Cancel' }
					}
				};

				events.once('onConfirmResponse', function (response) {
					if (callback) callback(response == "ok");
				}, this);

				var dialog = dialogs.create('simple', dialogConfig, 'onConfirmResponse');
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