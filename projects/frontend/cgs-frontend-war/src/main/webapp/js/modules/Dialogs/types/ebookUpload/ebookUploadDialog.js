define(['modules/Dialogs/BaseDialogView', 'translate', 'restDictionary', 'configModel', 'mustache', 'events', 
	'helpers', 'ebookPlayer', 'assets', 'editMode', "cgsUtil",
	'text!modules/Dialogs/types/ebookUpload/templates/ebookUpload.html',
	'text!modules/Dialogs/types/ebookUpload/templates/ebookUploadProgress.html',
	'text!modules/Dialogs/types/ebookUpload/templates/ebookPreview.html'],
function(BaseDialogView, translate, restDictionary, configModel, mustache, events, helpers, ebookPlayer, assets, editMode, cgsUtil,
		uploadTemplate, progressTemplate, ebookPreviewTemplate) {
	'use strict';
	var ebookUploadDialogView = BaseDialogView.extend({
		
		tagName: 'div',
        id: 'ebook-upload-dialog',

		events: {
			'change #ebook-conversion-select': 'updatePdfConversionLibrary'
		},

		initialize: function (options) {
			var publisher = require('userModel').getAccount().accountId;
			var basePath = require("configModel").configuration.cmsBasePath;
			this.basePath = basePath + '/publishers/' + publisher + '/';
			var userModel = require('userModel');

            this.customTemplate = uploadTemplate;
            this._super(options);
			this.allEbooks = options.config.ebookData.all;
			this.recentEbooks = options.config.ebookData.recents;
			this.maxEBookPages = userModel.account.elementsLimit.maxEBookPages || 500;
			this.pdfConversionLibrary = userModel.account.pdfConversionLibrary;
			this.enableConversionLibrarySelection = !!userModel.account.enablePdfConversionLibrarySelection;
			this.pdfConversionLibreries = AuthenticationData.configuration.availablePdfConverters;

			// add the relevant path to each ebook cover-image
			this.allEbooks.forEach(function(ebook, index) {
				if (ebook.coverImage && ebook.coverImage.length > 0) {
					this.allEbooks[index].coverImage = this.basePath + ebook.coverImage;
				} else {
					this.allEbooks[index].coverImage = false;
				}
				if (ebook.lastModified) {
					this.allEbooks[index].lastModified = moment(ebook.lastModified).format("MMM, DD, YYYY, h:mm a");
				}
			}.bind(this));

			// add the relevant path to each ebook cover-image
			this.recentEbooks.forEach(function(ebook, index) {
				if (ebook.coverImage&& ebook.coverImage.length > 0) {
					this.recentEbooks[index].coverImage = this.basePath + ebook.coverImage;
				} else {
					this.recentEbooks[index].coverImage = false;
				}
				if (ebook.lastModified) {
					this.recentEbooks[index].lastModified = moment(ebook.lastModified).format("MMM DD, YYYY, h:mm a");
				}
			}.bind(this));

            //all the possible phases of uploading and converting an epub file
            this.progressPhases = ['uploadingFile', 'calculatingEBookFileHash', 'savingFileToDisk', 'buildEBookStructure', 'generatingPageThumbnails', 'savingEBookDataToDb', 'generatingPageThumbnails'];
            this.currentPhaseIndex = -1;

        },
		/**
		 * filters an array by a string
		 * @param originalPagesArray
		 * @param userPageSelectionInput
		 * @returns {Array}
		 */
		filterRange: function(originalPagesArray, userPageSelectionInput) {
			var indexOfPagesToImport = this.rangeToListOfPages(userPageSelectionInput);
			var pagesToImport = [];
			indexOfPagesToImport.forEach(function(i) {
				pagesToImport.push(originalPagesArray[i]);
			});
			return pagesToImport;
		},

		/**
		 * transnumberOfPagesform a string pattern into an array matching the string.
		 * @param string
		 * @returns {Array}
		 */
		rangeToListOfPages: function(string) {
			var formats = string.split(',');
			var results = [];
			var numberOfPages = parseInt(this.serverResponseWithPages.structure.numberOfPages);
			formats.forEach(function(pattern) {
				if (pattern.length > 0) {
					pattern = pattern.trim();
					// pattern is in form of '1-5'
					if (pattern.indexOf('-') > -1) {
						var splitPattern = pattern.split('-');
						var maxIndex = parseInt(splitPattern[1]) > numberOfPages ? numberOfPages : parseInt(splitPattern[1]);
						for (var i = parseInt(splitPattern[0]) - 1; i < maxIndex; i++) {
							results.push(i);
						}
						// pattern is in form of '4'
					} else {
						var indexToAdd = parseInt(pattern) > numberOfPages ? numberOfPages : parseInt(pattern);
						results.push(indexToAdd - 1 );
					}
				}
			});
			return results;
		},

		/**
		 * Mustache render method
		 * @param $parent
		 */
        render: function ($parent) {
            this._super($parent, this.customTemplate);
			this.$addButton = this.$parent.find('#add');
			$("#ebook-conversion-select option[value='" + this.pdfConversionLibrary + "']").attr("selected", "selected");

            this.bindEvents();
			this.$addButton.hide();
        },

		/**
		 * Bind the events on the dialog (some of the events are registered in their
		 */
		bindEvents: function() {
        	var self = this;

			// bind tab events
			this.$('#ebooks-tabs a').click(function (e) {
				e.preventDefault();
				$(this).tab('show');
			});

			if (this.recentEbooks.length > 0) {
				this.$('#ebooks-tabs li:eq(1) a').tab('show');
			} else {
				this.$('#ebooks-tabs li:eq(0) a').tab('show');
			}

        	this.$(".import-book-area").on("click", function(){
        		self.$('#ebookfileUpload').trigger('click');
        	});
        	this.$('#ebookfileUpload').on('change', this.uploadEbookToServer.bind(this));

			this.$('.ebook-external-frame.import-existing').one('click', function () {
				$(this).siblings().unbind('click');
				var ebookId = $(this).data('ebookId');
				self.getConvertedEbook(ebookId);
			});

			this.disableAddButton();

			this.$addButton.unbind('click').on('click', function(e) {
				e.stopPropagation();
				if ($(this).hasClass('disabled')) return;
				var value = self.$('#ebook-page-selection').val();

				if (!self.$('#ebook-select-all-pages').is(':checked')) {
					self.serverResponseWithPages.structure.pages = self.filterRange(self.serverResponseWithPages.structure.pages, value);
				}
				self.saveEbookStructure(self.serverResponseWithPages);
			});

			this.$('#ebook-conversion-select').on('click', function(e) { e.stopPropagation(); });
        },

		/**
		 * disable the add button
		 */
		disableAddButton: function() {
			this.$addButton.attr('disabled', true).prop('disabled', true).addClass('disabled');
		},

		/**
		 * enable add button
		 */
		enableAddButton: function() {
			this.$addButton.attr('disabled', false).prop('disabled', false).removeClass('disabled');
		},

		updatePdfConversionLibrary: function(event) {
			this.pdfConversionLibrary = event.target.value;
		},

		//---------------------------------------------------------------------
		//---------------------- VALIDATION METHODS ---------------------------
		//---------------------------------------------------------------------

		/**
		 * validate that pattern of string is actually a range, you can see it here: http://regexr.com/3c770
		 * @param input
		 * @returns {boolean}
		 */
		validatePageInputString: function(input) {
			var pattern = new RegExp("^\\s*(((\\d+\\-\\d+|\\d+),\\s*)*(\\d+\\-\\d+|\\d+)+)+,?$");
			return pattern.test(input);
		},

		/**
		 * validate that the selected pages actually exists on the book.
		 * @param input
		 * @returns {boolean}
		 */
		validatePageExists: function(input) {
			var numbers = input.match(/\d+/g);
			var isValid = true;
			if (numbers) {
				numbers.forEach(function(number) {
					number = parseInt(number);
					if (number === 0 || number > parseInt(this.serverResponseWithPages.structure.numberOfPages)) {
						isValid = false;
					}
				}.bind(this));
			}
			return isValid;
		},

		/**
		 * Validate that the range is a valid range, for example, 6-2 is not valid but 2-6 is.
		 * @param input
		 * @returns {boolean}
		 */
		validateRange: function(input) {
			var ranges = input.match(/\d+\-\d+/g);
			var isValid = true;
			if (ranges) {
				ranges.forEach(function(range) {
					var numbers = range.split('-');
					if (parseInt(numbers[0]) >= parseInt(numbers[1])) {
						isValid = false;
					}
				})
			}
			return isValid;
		},

		/**
		 * Validate that you won't be able to add more than X pages per Lesson.
		 * @param input
		 * @returns {boolean}
		 */
		validateMaxPagesOnLesson: function(input) {
			var totalPagesToAdd = 0;
			var ranges = input.match(/\d+\-\d+/g);
			var pageNumbers = input.match(/\d+/g);
			if (pageNumbers) {
				totalPagesToAdd += pageNumbers.length;
			}
			if (ranges) {
				totalPagesToAdd -= ranges.length * 2;
				ranges.forEach(function(range) {
					var numbers = range.split('-');
					totalPagesToAdd += (parseInt(numbers[1]) - parseInt(numbers[0])) + 1;
				});
			}
			return cgsUtil.canAddPagesToLesson(require('lessonModel').lessonId, totalPagesToAdd);
		},

		/**
		 * Gets the current number of pages in the lesson.
		 * @returns {number}
		 */
		getNumberOfExistingPages: function() {
			return require('repo').getChildrenByTypeRecursive(require('lessonModel').lessonId, 'page').length;
		},

		/**
		 * Validate the input and use all the validation function above.
		 * @param context
		 */
		validatePageInput: function(context) {
			var isValid = true;
			var errorMessage = '';
			var input = $(context).val();
			if (!this.validatePageInputString(input)) {
				isValid = false;
				errorMessage = translate.tran('ebook.form.validation.error.string');
			}
			if (!this.validatePageExists(input)) {
				isValid = false;
				errorMessage = translate.tran('ebook.form.validation.error.page.exists');
			}
			if (!this.validateRange(input)) {
				isValid = false;
				errorMessage = translate.tran('ebook.form.validation.error.range');
			}

			if (!this.validateMaxPagesOnLesson(input)) {
				isValid = false;
				errorMessage = translate.tran('ebook.form.validation.error.page.limit').format(this.maxEBookPages);
			}

			if (!isValid) {
				this.setInputError(errorMessage, context);
			} else {
				this.clearInputError(context);
				this.enableAddButton();
				this.savedPageSelection = {
					ebookId: this.serverResponseWithPages.eBookId,
					input: input
				};
			}

		},

		/**
		 * sets the GUI to show input error on the page selection input.
		 * @param message
		 * @param inputElement
		 */
		setInputError: function(message, inputElement) {
			this.disableAddButton();
			$(inputElement).addClass('input-error');
			$('.ebook-page-selection-input-error-message').text(message).show();
		},

		/**
		 * clears the GUI from the input error.
		 * @param inputElement
		 */
		clearInputError: function(inputElement) {
			$(inputElement).removeClass('input-error');
			$('.ebook-page-selection-input-error-message').hide();
		},

		/**
		 * upload the chosen ebook file to the server
		 * @param e
		 */
		uploadEbookToServer: function(e){
            var chosenFile = e.target.files[0];
			var isValid = this.isValidFile(chosenFile);

            if(isValid !== true){
                this.onError({isValid : isValid}, true);
                return;
            }

        	var url = configModel.getConfig().basePath +
					  mustache.render(restDictionary.paths.EBOOK_UPLOAD.path,
						              {'publisherId' : require('userModel').getPublisherId()});
        	
        	this.xhr = new XMLHttpRequest();

			this.xhr.onload = this.onUploadSuccess.bind(this);
			this.xhr.onerror = this.onError.bind(this);
			this.xhr.upload.onprogress = this.onUploadProgress.bind(this);
        		
        	var formData = new FormData();
			formData.append("file", chosenFile);
			formData.append("pdfConversionLibrary", this.pdfConversionLibrary);

			this.xhr.open("POST", url);
			this.xhr.send(formData);
			this.changeToProgressView(chosenFile.name);
        },

		/**
		 * isValidFile
		 * @param file
		 * @returns {boolean} true if file is valid, otherwise return error string
		 */
       	isValidFile: function(file) {
            var isValid = true;
			var fileName = file.name;
            var fileExtension = this.getFileExtension(fileName);
			var fileSizeLimits = require('userModel').account.fileSizeLimits;

			var lookup = {};
			// this is a map to the fileSizeLimits array, so it will be easy to handle it later
			for (var i = 0, len = fileSizeLimits.length; i < len; i++) {
				lookup[fileSizeLimits[i].type] = fileSizeLimits[i];
			}

			if (["pdf","epub"].indexOf(fileExtension) === -1 ) {
				isValid = translate.tran("ebook.uploadFile.dialog.error.invalidFileType");
			} 
            if (lookup['epub'] && (lookup['epub'].size < file.size)) {
				isValid = translate.tran("ebook.uploadFile.dialog.error.invalidFileSize")
					.format(helpers.bytesToSize(lookup['epub'].size));
			}
			
            return isValid;
        },
        getFileExtension: function (filename){
        	return filename.split('.').pop().toLowerCase();

        },
		/**
		 * show progress of uploading the ebook file to server
		 * @param e
		 */
		onUploadProgress: function(e){
        	if (e.lengthComputable) {
        		var percents = ((e.loaded / e.total)/ this.progressPhases.length) * 100;
				this.updateProgressView({
					phase: this.progressPhases[this.currentPhaseIndex],
				 	percents: percents
				 });
			}
        },

		/**
		 * after a suceessfull upload of the ebook file, get the job progress status
		 * @param xhr
		 */
		onUploadSuccess: function(xhr) {
        	this.xhr = null;
        	//change current phase from 0 to 1
        	this.currentPhaseIndex ++;

        	var response = JSON.parse(xhr.target.response);
            if (response.httpStatus) {
                this.onError({"error" :response.data});
            } else {
                response = response[0];
                //this.ebookId = response.ebookId;
                this.jobId = response.jobId;

                this.getJobProgress(this.jobId);
            }
        },

		/**
		 * handles errors from server / client input
		 * @param error
		 * @param keepButtonString
		 */
        onError: function(error, keepButtonString) {
        	var self = this;
			this.xhr = null;
            var errors;
			var keys = _.map(_.keys(error), function(key) {
				return require('translate').tran('ebook.upload.error.' + key);
			}).join(', ');
            if (error.type =="error" || error.statusText == "error") {
                this.ebookId = null;
                errors = translate.tran("Network Problem description");
            } else if (error["FAILED_TO_CONVERT_EBOOK_FILE"]) {
                errors = error["FAILED_TO_CONVERT_EBOOK_FILE"].replace(/\n/g, "<br>")
            } else {
                errors = _.values(error).join(", ");
            }

			var $failedText = this.$('.upload-failed-message .failed-text');
			var $detailsToggle = this.$('#ebook-error-details-toggle');

			$failedText.html(errors);
			this.$('.upload-failed-message .failed-title').prepend(keys);
            this.$(".upload-failed-message").css('display', 'flex');

			$detailsToggle.on('click', function() {
				$failedText.toggle(300, 'linear');
			});

            if (!keepButtonString) {
               this.$("#dialogControls #cancel").text("close");
            }
			// add the back button

			var $backButton = $(mustache.render('<div id="back" class="btn">((Back))</div>'));
			this.$("#dialogControls").append($backButton);

			// on click back button, render first page again.
			$backButton.on('click', function(e) {
				self.render($('body'));
				$('#ebook-upload-dialog .overlay').css({ display : 'block' });
			});
        },

		/**
		 * change the upload ebook file dialog view to a progress bar view
		 */
		changeToProgressView: function(filename) {
        	//change current phase from -1 to 0
        	this.currentPhaseIndex ++;
        	var progressViewHtml = mustache.render(progressTemplate, {
        		'phase' : this.progressPhases[this.currentPhaseIndex]
        	});

        	this.$('#dialogContent').html(progressViewHtml);
        	this.$("#dialogTitle h3").html(translate.tran("ebook.uploadFile.dialog.title.progress"));
			if(this.enableConversionLibrarySelection) {
				var pdfConversionLibraryString = _.find(this.pdfConversionLibreries, {key :this.pdfConversionLibrary}).value;
				//show "converted by" string only on pdf files
				if(this.getFileExtension(filename) == "epub"){
					this.$("#conversionLibrary").html('');	
				}else{
					this.$("#conversionLibrary").html(translate.tran("ebook.converted.by.pdfConversionLibrary").format(pdfConversionLibraryString));
				}
				this.$(".ebook-upload-warning").show();
			} else {
				this.$("#conversionLibrary").html('');
				this.$(".ebook-upload-warning").hide();
			}
			this.$('#ebook-resource-preview').hide();
        },

		/**
		 * update the progress-bar according to the jobs on the server
		 * @param params
		 */
        updateProgressView: function(params){
            //set previous value of the percents, if it's not available
            if(!params.percents){
                params.percents = parseInt(  this.$('.progress-indication').get(0).style.width) || 0;
            }

        	this.$('.progress-phase').text( translate.tran("ebook.upload.progress.phase." + params.phase) + " ("+ Math.round(params.percents) + "%)");
            this.$('.progress-indication').css('width', params.percents + "%");
        },

		/**
		 * api to server to get the job status of the ebook conversion
		 * @param jobId
		 */
		getJobProgress: function(jobId){
        	var daoConfig = {
                path: restDictionary.paths.CHECK_JOB_PROGRESS,
                pathParams: {
                    jobId: jobId
                }
            };

            require('dao').remote(daoConfig, this.jobProgressResponse.bind(this), this.onError.bind(this));
        },

		/**
		 * handle the server response about the status of the job progress
 		 * @param jobProgress
		 */
		jobProgressResponse: function(jobProgress){

        	var currentPhase = this.getCurrentPhase(jobProgress.componentsProgressInPercent);
            if (typeof this.lastPhase == 'undefined') this.lastPhase = Object.keys(jobProgress.componentsProgressInPercent)[Object.keys(jobProgress.componentsProgressInPercent).length - 1];
            if (currentPhase == null || typeof currentPhase == 'undefined')  currentPhase = this.lastPhase;
            this.lastPhase = currentPhase;
            this.currentPhaseIndex = this.progressPhases.indexOf(currentPhase);
            //the percents are diveded to the number of stages of the conversion task
			var percents = (((jobProgress.componentsProgressInPercent[currentPhase] /100) + this.currentPhaseIndex)/this.progressPhases.length) * 100;

			console.warn("jobProgressResponse", jobProgress.status, jobProgress.componentsProgressInPercent, currentPhase, percents);
        	switch(jobProgress.status){
        			
        		case 'IN_PROGRESS':
        			this.updateProgressView(
        				{
        					'percents': percents,
        					'phase' : currentPhase
        				});

        			setTimeout(this.getJobProgress.bind(this, jobProgress.jobId), 1000);
        		break;

        		case 'PENDING':
        			this.updateProgressView(
        				{
        					'phase' : 'pending'
        				});

        			setTimeout(this.getJobProgress.bind(this, jobProgress.jobId), 1000);
        		break;

        		case 'CANCELED':
                    this.ebookId = null;
                    this.jobId = null;
        		break;

        		case 'FAILED':
        			// show the error to the user
                    this.ebookId = null;
                    this.jobId = null;
        			this.onError(jobProgress.errors);
        		break;

        		case 'COMPLETED':
        			this.updateProgressView(
        				{
        					'percents': percents,
        					'phase' : currentPhase
        				});
        			
        			var ebookId = jobProgress.properties.eBookId ? jobProgress.properties.eBookId : this.ebookId;
        			this.ebookId = null;
        			this.jobId = null;

        			this.getConvertedEbook(ebookId);
        		break;
        	}
        },

        getCurrentPhase: function(components) {
            for (var key in components) {
                if (components[key] != 100) {
                    return key;
                }
            }
            return null;
        },

		/**
		 * get the converted ebook from the server by it's id
		 * @param ebookId
		 */
        getConvertedEbook: function(ebookId){

        	var daoConfig = {
                path: restDictionary.paths.GET_EBOOK_CONVERTED_PAGES,
                pathParams: {
                    publisherId : require('userModel').getPublisherId(),
                    ebookId: ebookId
                }
            };

            require('dao').remote(daoConfig, this.startEbookPlayerAndEnablePageForm.bind(this), this.onError.bind(this));

        },

		/**
		 * save the ebook to the reop (sends the structure to the controller)
		 * @param value
		 */
        saveEbookStructure: function(value) {
        	this.controller.setReturnValue('ebook', value);
        	events.fire('terminateDialog', 'ebook');
        },

		/**
		 * start ebook player with the response from the server.
		 * @param response
		 */
		startEbookPlayerAndEnablePageForm: function(response) {
			var self = this;
			// save pages from server so we can filter it later
			this.serverResponseWithPages = response;

			if (this.serverResponseWithPages.structure.pages) {
				this.serverResponseWithPages.structure.numberOfPages = this.serverResponseWithPages.structure.pages.length;
			} else {
				this.serverResponseWithPages.structure.numberOfPages = 0;
			}

			// Reset the view to step 2
			var progressViewHtml = mustache.render(progressTemplate, {
				'phase' : this.progressPhases[this.currentPhaseIndex]
			});

			var pageSelectionLabel = translate.tran('ebook.uploadFile.page.rage.selection').format(
				1,
				this.serverResponseWithPages.structure.numberOfPages
			);

			this.$('#dialogContent').html(progressViewHtml);
			this.$('#dialogTitle h3').html(translate.tran('ebook.uploadFile.dialog.title.progress'));

			if(this.enableConversionLibrarySelection) {
				if(this.getFileExtension(this.serverResponseWithPages.originalFileName) == "epub"){
					this.$("#conversionLibrary").html('');
				}else{
					var pdfConversionLibraryString = _.find(this.pdfConversionLibreries, {key :this.serverResponseWithPages.conversionLibrary}).value;
					this.$("#conversionLibrary").html(translate.tran("ebook.converted.by.pdfConversionLibrary").format(pdfConversionLibraryString));
				}
				this.$(".ebook-upload-warning").show();
			} else {
				this.$("#conversionLibrary").html('');
				this.$(".ebook-upload-warning").hide();
			}

			this.$("#ebook-select-all-pages-label").html(pageSelectionLabel);
			this.$addButton.show();

			// add the back button
			var $backButton = $(mustache.render('<div id="back" class="btn">((Back))</div>'));
			this.$("#dialogControls").append($backButton);

			// on click back button, render first page again.
			$backButton.on('click', function(e) {
				self.render($('body'));
				$('#ebook-upload-dialog .overlay').css({ display : 'block' });
			});

			// enable form of selection
			var $inputRange = this.$('#ebook-page-selection');
			var $allPages = this.$('#ebook-select-all-pages');
			$inputRange.attr('disabled', false).prop('disabled', false);
			$allPages.attr('disabled', false).prop('disabled', false);

			// check if there's saved input
			if (this.savedPageSelection && this.serverResponseWithPages.eBookId === this.savedPageSelection.ebookId) {
				$inputRange.val(this.savedPageSelection.input);
				this.enableAddButton();
			}

			//register the events on the input fields
			// validate entry of correct string for pages
			var validatePageInputFunction = _.debounce(function() {
				self.validatePageInput(this);
			}, 600);
			$inputRange.on('keyup',validatePageInputFunction);

			// when you change all pages checkbox
			$allPages.on('change', function() {
				var isError = $inputRange.data('isError');
				var $errorMessage = self.$('.ebook-page-selection-input-error-message');
				if ($(this).is(':checked')) {
					self.enableAddButton();
					$inputRange.attr('disabled', true).prop('disabled', true);
					if ($inputRange.hasClass('input-error')) {
						$errorMessage.fadeOut();
					}
					if(!cgsUtil.canAddPagesToLesson(require("lessonModel").lessonId,self.serverResponseWithPages.structure.pages.length)){
						self.setInputError(translate.tran('ebook.form.validation.error.page.limit').format(self.maxEBookPages),
							$inputRange);
						self.disableAddButton();
					}
				} else {
					$inputRange.attr('disabled', false).prop('disabled', false);
					if ($inputRange.val().length === 0) {
						self.disableAddButton();
						self.clearInputError($inputRange);
					} else {
						self.validatePageInput($inputRange);
					}
				}
			});

			// change the resource view to the player
			var previewHtml = mustache.render(ebookPreviewTemplate);
			this.$('#ebook-resource-preview').html(previewHtml);
			this.$('#ebook-resource-preview').show();
			this.$('.ebook-upload-progress').remove();

			var host = {
				api: function(data){
					return {
						'bookmark_added': function () {},
						'bookmark_removed': function () {},
						'highlight_added': function () {},
						'highlight_removed': function () {},
						'hotspot_removed': function () {},
						'hotspot_updated': function () {},
						'hotspot_selected': function () {},
						'new_search': function () {},
						'on_init': function () {},
						'page_changed': function () {},
						'state_changed': function () {},
						'external_hotspot': function () {}
					};
				}
			};
			var player = new ebookPlayer(host, this.$('#ebook-preview-player'));
			player.api({
				action: "init",
				data: {
					basePaths: {
						player: window.location.origin.toString() + '/cgs/client/player/scp/players/db/'+ window.scpConfig.dbVersion +'/player/index.html',
						assetsPath: '',
						assetsBasePath: ''
					},
					viewMode: 'NORMAL',
					//TODO: hard coded.
					playerFormat: 'PLAYER',
					//TODO: check with Eyal (ebook)
					type: 'EBOOK',
					stageMode: 'SINGLE_PAGE',
					userInfo: { role: 'TEACHER' },
					saveState: false,
					useExternalMediaPlayer: false,
					scale: 1,
					// All this other data in not in the document
					complay: true,
					locale: 'en_US'
				},
				success: playEbook.bind(this),
				error: function() {}
			});

			var publisher = require('userModel').getAccount().accountId;
			//var basePath = require("configModel").configuration.basePath;
			var basePath = 'cms';
			var hackPath = basePath + '/publishers/' + publisher;

			var ebookData = {
				book_title: response.structure.title,
				pages: []
			};

			response.structure.pages.forEach(function(page) {
				ebookData.pages.push({
					cid: page.originalIndex,
					href: hackPath + '/' + page.href,
					title: page.title,
					thumbnailHref: page.thumbnailHref ?  hackPath + '/' + page.thumbnailHref : ''
				});
			});

			function playEbook() {
				player.api({
					action: 'play',
					data: {
						saveState: false,
						viewMode: 'NORMAL',
						sessionId: '',
						id: require('lessonModel').getLessonId(),
						data: ebookData,
						isReadOnly: editMode.readOnlyMode,
						searchEnabled: true,
						bookmarkEnabled: false,
						highlightEnabled: false,
						viewerToolbarEnabled: false,
						thumbnailsBarEnabled: true,
						navigationEnabled: true
					},
					success: function() {},
					error: function() {}
				});
			}

			// send the page selection info to the saveEbookStructure
		},

		/**
		 * dialog event that is called from base, when clicking on cancel button
		 */
		beforeTermination: function(){
        	if(this.xhr){
        		//cancel was clicked while uploading the file to the server, so we can abort the action
        		this.xhr.abort();

        	}else{
        		//the cancel was clicked while the job is in progress in the server
        		if(this.jobId){
        			var daoConfig = {
						path:restDictionary.paths.EBOOK_UPLOAD_CANCEL,
						pathParams: {
							publisherId: require('userModel').getPublisherId(),
							jobId: this.jobId
						}
					};
					require('dao').remote(daoConfig, null,this.onError.bind(this));
        		}
        	}
        }
        

	}, {type: 'ebookUploadDialogView'});

	return ebookUploadDialogView;

});