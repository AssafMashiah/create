define(['lodash', 'moment', 'events', 'modules/Dialogs/BaseDialogView', 'configModel',
		'text!modules/Dialogs/types/importEpub/importEpub.html', 
		'text!modules/Dialogs/types/importEpub/importProgress.html', 
		'mustache', 'restDictionary', 'translate', 'websocket','cgsUtil'],
	function(_, moment,  events,  BaseDialogView, configModel, template, progressTemplate, mustache, restDictionary, translate, websocket, cgsUtil) {

		var dialogView = BaseDialogView.extend({

			tagName : 'div',
			step: 0,
			progressStep: [],
			stepJobName: ['savingFileToDisk','generatingEBookTOC', 'ebookTOCAnalysis', 'buildEBookStructure', 'generatingPageThumbnails', 'savingEBookDataToDb', 'creatingCourse'],
			stepsInfo: {},
			stepJobPercent: {'savingFileToDisk':3,
							'generatingEBookTOC':2,
							'ebookTOCAnalysis':2,
							'buildEBookStructure':10,
							'generatingPageThumbnails':15,
							'savingEBookDataToDb':1,
							'creatingCourse':1},
			events: {
				'click #submitBtn': function (e) {
					e.preventDefault();
					this.import();
				},
				'click #button_upload': function (e) {
					e.preventDefault();
					this.$el.find('#fileUpload').trigger('click');
				},
				'change #contentLocales': function (e) {
					e.preventDefault();
					e.currentTarget.classList[e.currentTarget.selectedIndex ? 'add' : 'remove']('has-value');
					this.validate();
				},
				'click #contentLocales': function (e) {
					e.currentTarget.classList.add('has-value');
				},
				'change #learningObject': function (e) {
					e.preventDefault();
					e.currentTarget.classList[e.currentTarget.selectedIndex ? 'add' : 'remove']('has-value');
					this.validate();
				},

				'blur #courseName': function (e) {
					e.preventDefault();
					this.validate();
				},
				'change #fileUpload': function (e) {
					e.preventDefault();
					this.validate();
					this.$el.find('#file_name').html(this.file.name);
				},

				'change #fileUpload': function (e) {
					e.preventDefault();
					this.validate();
					if (this.file) {
						this.$el.find('#file_name').html(this.file.name);
					}
				}, 
				'dragover #dropzone': function(e) {
					e = e.originalEvent;
					e.stopPropagation();
					e.preventDefault();
					if (e.dataTransfer.files.length && e.dataTransfer.files[0]) {
						e.dataTransfer.dropEffect = 'link';
						this.$el.find('#dropzone').addClass('dropping');
					}
				},
				'dragexit #dropzone': function(e) {
					this.$el.find('#dropzone').removeClass('dropping');
				},
				'dragleave #dropzone': function(e) {
					this.$el.find('#dropzone').removeClass('dropping');
				},
				'drop #dropzone': function(e) {
					e = e.originalEvent;
					if (e.dataTransfer.files.length) {
						this.file = e.dataTransfer.files[0];
						this.$el.find('#file_name').html(this.file.name);
					}
					this.$el.find('#dropzone').removeClass('dropping');
					e.stopPropagation();
					e.preventDefault();
					this.validate();
				}
			},

			initialize: function(options) {
				this.options = options;
				this.customTemplate = template;
				this.totalProgress = _.reduce(this.stepJobPercent, function (total ,a, b) {
					return total + a;
					});
				this.progressStep.push(this.stepJobPercent['savingFileToDisk']/this.totalProgress);
				this.progressStep.push(
					(this.stepJobPercent['generatingEBookTOC']+
					this.stepJobPercent['ebookTOCAnalysis'])/this.totalProgress
					);
				this.progressStep.push(
					this.stepJobPercent['buildEBookStructure']+
					this.stepJobPercent['generatingPageThumbnails']
					);
				this.tocSummary = {};
				this.jobId = null;
				this.stepsInfo = {};
				this.socketMessage = this.socketMessage.bind(this);
				this._super(options);
			},

			getFieldsValues: function () {
				try {
					this.contentLocales = this.$contentLocales.val() || '';
					this.courseName = this.$el.find('#courseName').val() || '';
					this.learningObject = this.$el.find('#learningObject').val() || '';
					if (this.$el.find('#fileUpload').prop('files')[0]) {
						this.file = this.$el.find('#fileUpload').prop('files')[0] || null;
					}
					if (this.file && !this.courseName) {
						this.courseName = this.file.name.split('.')[0]
						this.$el.find('#courseName').val(this.courseName);
					}
				} catch (err) {
					console.error(err);
				}
			},

			validate: function() {
				this.getFieldsValues();

				//set input direction according to content locale
				if(["iw_IL", "ar_IL"].indexOf(this.contentLocales) >= 0) {
					this.$courseName.removeClass('ltr').addClass('rtl');
				} else {
					this.$courseName.removeClass('rtl').addClass('ltr');
				}

				this.$el.find('#submitBtn').attr('disabled',
					!(this.file && this.contentLocales.length && this.learningObject.length && this.courseName.length));
			},

			import: function() {
				this.getFieldsValues();


				var chosenFile = this.file;
				var isValid = true;//this.isValidFile(chosenFile);

				if(isValid !== true){
					this.onError({isValid : isValid}, true);
					return;
				}

				var url = configModel.getConfig().basePath +
						  mustache.render(restDictionary.paths.EPUB_UPLOAD.path,
										  {'publisherId' : require('userModel').getPublisherId()});

				this.xhr = new XMLHttpRequest();

				this.xhr.addEventListener("error", this.onXHR.bind(this));
				this.xhr.addEventListener("abort", this.onXHR.bind(this));
				this.xhr.addEventListener("load", this.onXHR.bind(this));
				this.xhr.addEventListener("progress", this.onXHR.bind(this));
				this.xhr.upload.addEventListener("progress", this.onXHR.bind(this));

				var formData = new FormData();
				formData.append("file", chosenFile);
				formData.append("courseName", this.courseName);
				formData.append("contentLanguage ", this.contentLocales);
				formData.append("learningObject  ", this.learningObject);

				this.xhr.open("POST", url);
				this.xhr.send(formData);
				

			},

			onXHR: function (e) {
				var status = e.target.status + "";
				if (status.indexOf('4') == 0 || status.indexOf('5') == 0) {
					console.warn('error', status, e.target.statusText);
					events.fire('terminateDialog');
					require('showMessage').showAlert(e.target.status,{message:e.target.statusText});
				} else if (e.type == "progress") {
					if (this.step <= 1) this.calculateProgress(e.loaded/e.total*this.stepJobPercent['savingFileToDisk']/this.totalProgress);
				} else if (status == "200" && e.type == "load") {
					this.jobId = e.target.response;
					if (this.step < 2) this.setStep(2);
					this.jobPollId = setInterval(this.getJobProgress.bind(this),500,this.jobId);
					//this.getJobProgress(this.jobId);
					this.connectToWebsocket();
// 					websocket.connectAndSubscribe('uploadAndConvert/'+this.jobId,this.socketMessage.bind(this)).then (function (stompClient) {
// 						this.subscription = subscription;
// 					}.bind(this));
				} else if (e.type === "abort"){
					this.disconnect();				  	
					events.fire('terminateDialog');
				}
			},
			connectToWebsocket: function () {
				if (!websocket.isConnected) {
					websocket.connect(function () {
						websocket.subscribe('uploadAndConvert/'+this.jobId,this.socketMessage);
					}.bind(this));
				} else {
					websocket.subscribe('uploadAndConvert/'+this.jobId,this.socketMessage);
				}
			},
			calculateProgress: function (value) {
				if (this.step == 0) this.changeToProgressView();
				if (this.isPaused) return;
				var step = this.step;
				//var currentProgress = this.progressStep[step-1] + (this.progressStep[step] - this.progressStep[step-1])*value;
				this.$("#progress").width(Math.round(value*100)+"%");
				if (this.step >= 3) {
					this.$('#button_continue').hide();
					this.$('#buildEbookStructure').text(this.stepsInfo.buildEBookStructure?  this.stepsInfo.buildEBookStructure + '%' : translate.tran('upload.file.pending'));
					this.$('#generatingPageThumbnails').text(this.stepsInfo.generatingPageThumbnails?  this.stepsInfo.generatingPageThumbnails + '%' : translate.tran('upload.file.pending'));
					this.$('#creatingCourse').text(this.stepsInfo.creatingCourse?  this.stepsInfo.creatingCourse + '%' : translate.tran('upload.file.pending'));
				}
			},

			showContinue: function (val) {
				if (this.step > 2) return;
				this.$("#button_continue").show();
				var countDown = require('userModel').account.ePubConversionConfDelay;
				var self = this;
				this.$("#button_continue").text(translate.tran('dialog.importepub.progress.continue.label') + ' ('+ countDown+')');
			},

			continueContdown: function (countDown) {
				countDown = Math.floor(countDown);
				if (countDown === 0) this.nextStep();
				self.$("#button_continue").text(translate.tran('dialog.importepub.progress.continue.label') + ' ('+ Math.floor(countDown)+')');
			},

			cancelCountdown: function (countDown) {
				countDown = Math.floor(countDown);
				
				self.$("#button_cancel").text(translate.tran("Close") + ' ('+ Math.floor(countDown)+')');
				if (countDown > 0) {
					this.cancelTimeout = setTimeout(this.cancelCountdown.bind(this), 1000, countDown - 1);
				} else if (countDown <= 0) this.cancelConversion();
			},

			render: function( $parent ) {
				this.locales = require('userModel').account.contentLocales.options;
				this.selectedLocale = require('userModel').account.contentLocales.selected;

				this._super($parent, this.customTemplate);

				this.$contentLocales = this.$el.find('#contentLocales');
				this.$courseName = this.$el.find("#courseName");

				this.$contentLocales.val(this.selectedLocale);

				if (this.selectedLocale) {
					this.$contentLocales.addClass('has-value');
				}

				this.validate();
				//this.changeToProgressView();
			}, 

			changeToProgressView: function() {
				if (this.step > 0) return;
				this.currentPhaseIndex ++;
				var progressViewHtml = mustache.render(progressTemplate, {
					'phase' : 1//this.progressPhases[this.currentPhaseIndex]
				});

				this.$('#dialogContent').html(progressViewHtml);
				this.$("#dialogTitle h3").html(translate.tran("dialog.importepub.progress.title"));
				this.$('#success-message').hide();
				this.nextStep();
				this.$('#button_cancel').on('click',this.cancelConversion.bind(this));
				this.$('#button_continue').on('click',this.continueConversion.bind(this));
				this.$('#button_continue').hide();
				this.$('#filename').text(this.file.name);
				//this.$('#button_cancel').hide();
			},
			
			nextStep: function() {
				this.isPaused = false;
				if (this.step >= 5) return;
				this.step++;
				this.renderStep(this.step);
			},

			setStep: function(step) {
				if (this.step === step) return;
				this.step = step;
				this.renderStep(this.step);
			},

			renderStep: function(step) {
				this.$("#progress-info").html(translate.tran("dialog.importepub.progress.info.step"+step+"label"));
				this.$("#progress-step").html(translate.tran("dialog.importepub.progress.info.step").format(step,4));
				switch (step) {
					case 2:
						this.$('#button_cancel').show();
						if (this.tocSummary.tocItemsCount) {
							this.$('.tocinfo').show();
						} else {
							this.$('.tocinfo').hide();
						}
						this.$('#toclevels').text(this.tocSummary.tocItemsCount);
						this.$('#lessons').text(this.tocSummary.lessonsCount);
						this.$('#pages').text(this.tocSummary.pagesCount);
						break;
					case 3:
						this.$('.stepsinfo').show();
						this.$('.tocinfo').hide();
						this.$('#buildEbookStructure').text((this.stepsInfo.buildEBookStructure || 0) + '%');
						this.$('#generatingPageThumbnails').text((this.stepsInfo.generatingPageThumbnails || 0) + '%');
						this.$('#creatingCourse').text((this.stepsInfo.creatingCourse || 0)+ '%');
						this.$('#button_continue').hide();
						break;
					case 5:
						this.$('.content-row').hide();
						this.$('#button_cancel').text(translate.tran("Close"));
						this.$('#success-message').show();
						this.cancelCountdown(6);
					case 1:
					case 4:
						this.$('#button_continue').hide();
						this.$('.tocinfo').hide();
						this.$('.stepsinfo').hide();
				}
			},

			cancelConversion: function() {

				if (!this.jobId) {
					this.xhr.abort();
					setTimeout(cgsUtil.openImportEpubDialog,1);
					return;
				} else if (this.step != 5) {
					var daoConfig = {
						path: restDictionary.paths.EBOOK_UPLOAD_CANCEL,
						pathParams: {
							publisherId : require('userModel').getPublisherId(),
							jobId: this.jobId
						}
					};

					require('dao').remote(daoConfig, function (data) {

					}.bind(this), this.onError.bind(this));
				}
				this.disconnect(); 									  	
				events.fire('terminateDialog');
				if (this.step != 5) setTimeout(cgsUtil.openImportEpubDialog,1);
			},

			continueConversion: function() {
				websocket.stompClient.send('/app/uploadAndConvert/'+this.jobId+'/continue');
				this.setStep(3);
			},


			getJobProgress: function(jobId){
				var daoConfig = {
					path: restDictionary.paths.CHECK_JOB_PROGRESS,
					pathParams: {
						jobId: jobId
					}
				};
				require('dao').remote(daoConfig, this.jobProgressResponse.bind(this), this.onError.bind(this));
			},

			socketMessage: function(message){
				clearInterval(this.jobPollId);
				this.jobPollId = null;
				switch (message.code) {
					case "PROGRESS": 
						this.jobProgressResponse(message.body);
						break;
					case "TOC_SUMMARY": 
						this.tocSummary = message.body;
						this.renderStep(this.step);
						break;
					case "COURSE_CREATED":
					    cgsUtil.onOpenCourseChosen(message.body);
					    if (this.step != 5) this.setStep(5);
					    break;
					case "ERROR":
					    this.onError(message.body);
					    break;
					case "COUNTDOWN": 
						this.showContinue();
						this.continueContdown(message.body);
						break;
				}
			},

			jobProgressResponse: function (data) {
				if (this.jobPollId && !websocket.isConnected ) this.connectToWebsocket();
				if (data.status === "FAILED") {
					this.disconnect();
					events.fire('terminateDialog');
					for (var e in data.errors) {
						this.onError({status:translate.tran('importepub.error.' + e), statusText: data.errors[e]});
					}
					return;
				} else if (data.status == "COMPLETED") {
					this.disconnect();
					this.setStep(5);
					cgsUtil.onOpenCourseChosen(data.properties.courseId);
					return;
				}

				var total = 0;
				var inProgress = false;
				var currentStepValue;
				for (c in data.componentsProgressInPercent) {
					var stepPercent = this.stepJobPercent[c];
					var value = data.componentsProgressInPercent[c];
					if (value < 100) {
						inProgress = true;
					}
					if (c == "buildEBookStructure" && this.step < 3) {
						this.setStep(3);
					}
					var stepValue = value/100*stepPercent;
					this.stepsInfo[c] = value;
					total += stepValue;
				}
				if (!inProgress) {
					//this.disconnect();
				} else {
				}
				this.calculateProgress(total/this.totalProgress);
			},

			disconnect: function () {
				clearInterval(this.jobPollId);
				this.jobPollId = null;
				clearInterval(this.continueInterval);
				clearTimeout(this.cancelTimeout);
				this.continueInterval = null;
				websocket.disconnect();
			},

			onError: function (data) {
				require('showMessage').showAlert(data && data.status,{message:data && data.statusText});
			}

		}, {type: 'importEpubDialogView'});

		return dialogView;

	});