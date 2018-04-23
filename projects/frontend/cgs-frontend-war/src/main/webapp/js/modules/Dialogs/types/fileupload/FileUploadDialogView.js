define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'files', 'FileUpload', 'IconAndFileUpload', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/fileupload/FileUploadDialog.html'],
function(_, $, BaseView, Mustache, events, files, FileUpload, IconAndFileUpload, BaseDialogView, template) {

	var FileUploadDialogView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog',
		
		filePath: "",

		initialize:function f608(options) {
			this.customTemplate = template;
			this._super(options);

			this.locale = require('repo').get(require('courseModel').getCourseId()).data.contentLocales[0];

			this.isTTSEnabled = require('ttsModel').isTtsServiceEnabledByLocale(this.locale);

			var userModel = require('userModel');
			this.isOrder = userModel.account.enableAssetOrdering;

			var localeData = require('configModel').getLocaleData(this.locale);
			this.options.config.direction = localeData && localeData.direction || 'ltr';

			var enableNarrationAdditionalLanguages = userModel.account.enableNarrationAdditionalLanguages;

			if(enableNarrationAdditionalLanguages) {
				this.options.config.multiNarrationLocales = _.toArray(require("courseModel").getMultiNarrationLocales());

			} else {
				this.options.config.multiNarrationLocales = [];
			}

			this.options.config.has_multi_locales = !!this.options.config.multiNarrationLocales.length;

			this.options.config.multiNarrationChecked = this.options.config.editMode ? this.options.config.has_multi_locales : true;
			this.setMultiNarrationData();
		},

		render:function f609($parent, setEditMode) {
			this.$parent = $parent;
			this._super($parent, this.customTemplate);

			this.initCourseNarration();

			this.bindEvents();

			if (this.options.config.editMode) {
				this.setEditMode(true, this.options.config.narrations);
			}
			else {
				this.initMultiNarrations();
			}
		},
		setEditMode: function (setMultinarration, narrations) {
			var repo = require("repo");
			
				if (_.size(narrations) > 1 && setMultinarration) {
					this.options.config.editMode = false;

					this.$("#has_multinarration").attr("checked", true);
					this.setMultiNarrationData();
					this.show(this);
					this.initMultiNarrations();

					return this.setEditMode(false)
				} 

				this.initMultiNarrations();

				_.each(narrations, function (item) {
					
					if (item.assetId) {
						this.$(".narration_" + item.locale).find(".todo-options option[value='Order']").attr('selected', true);
						this.$(".narration_" + item.locale).find(".todo-options").trigger("change");
						this.$(".narration_" + item.locale).find(".order-id").val(item.assetId);
						this.$(".narration_" + item.locale).find(".chk-as-is").attr("checked", item.asIs).trigger("change");
						this.$(".narration_" + item.locale).find(".narration-text").val(item.narrationText);
						
						this.setOrderResponse(this.$(".narration_" + item.locale)); 
					} else {
						if (item.origin === 'tts') {
							this.$(".narration_" + item.locale).find(".todo-options option[value='TTS']").attr('selected', true);
							this.$(".narration_" + item.locale).find(".todo-options").trigger("change");
							this.$(".narration_" + item.locale).find(".chk-as-is").attr("checked", item.asIs).trigger('change');
							this.$(".narration_" + item.locale).find(".narration-text").val(item.narrationText);
						
							this.afterFileUpload(this.$(".narration_" + item.locale), {
								assetId: null,
								state: true,
								asIs: this.$(".narration_" + item.locale).find('.chk-as-is').is(':checked'),
								narrationText: this.$(".narration_" + item.locale).find('.narration-text').val().trim(),
								origin: 'tts',
								locale: this.$(".narration_" + item.locale).attr('data-locale'),
								src: item.component_src,
								isUpload: true
							}, true);
						} else {
							this.afterFileUpload(this.$(".narration_" + item.locale), item.component_src, true);
						}
					}
				}, this)
		},

		// Successful upload callback
		afterFileUpload: function(container, response, isSilent){
			if (!this.response) {
				this.response = {};
			}

			this.response[container.attr('data-locale')] = _.isString(response) ? { isUpload: true, src: response, locale: container.attr('data-locale'), origin: 'upload' } : response;

			this.controller.setReturnValue( 'yes', this.response );

			container.find('.tts-button').addClass('disabled').attr('disabled', true);

			if (!_.isBoolean(isSilent) || !isSilent) {
				container.find('.uploadStatus').text('file uploaded successfully');
				container.find('.uploadError').html('');
			}
		},

		// Upload error callback
		onUploadError: function(container, error) {
			container.find('.uploadStatus').text('');
			container.find('.uploadError').html(error);
		},
		initCourseNarration: function () {
			new FileUpload({
				activator: this.$(".narration_" + this.locale).find(".addFile"),
				options: {
					fileMymType: this.options.config.fileMymType,
					allowFiles: this.options.config.allowFiles
				},
				callback: this.afterFileUpload.bind(this, this.$(".narration_" + this.locale)),
				errorCallback: this.onUploadError.bind(this, this.$(".narration_" + this.locale)),
				context: this
			});
		},
		setMultiNarrationData: function () {
			// this.response = _.merge(this.response || {}, _.mapValues(require("courseModel").getMultiNarrationLocales(), function () {
			// 	return null;
			// }))

			_.each(this.options.config.multiNarrationLocales, function (item) {
				item.is_locale_tts_enabled = require('ttsModel').isTtsServiceEnabledByLocale(item.locale);
			});

			this.options.config.multiNarrationChecked = true;
		},
		initMultiNarrations: function (render) {
			_.each(this.options.config.multiNarrationLocales, function (item) {
				new FileUpload({
					activator: this.$(".narration_" + item.locale).find(".addFile"),
					options: {
						fileMymType: this.options.config.fileMymType,
						allowFiles: this.options.config.allowFiles
					},
					callback: this.afterFileUpload.bind(this, this.$(".narration_" + item.locale)),
					errorCallback: this.onUploadError.bind(this, this.$(".narration_" + item.locale)),
					context: this
				});
			}, this);
		},
		bindEvents: function() {
			var self = this;
			
			// Switch between upload button and order asset


			this.$("[class^=narration_]").each(function () {
				var container = $(this);

				container.find(".todo-options").on('change', function() {
					switch ($(this).val()) {
						case 'Upload':
							container.find('.todo-upload').show();
							container.find('.todo-order').hide();
							break;
						case 'Order':
							container.find('.order-id-label, .order-id').show();
							container.find('.tts-button').hide();
							container.find('.todo-upload').hide();
							container.find('.todo-order').show();
							break;
						case 'TTS':
							container.find('.order-id-label, .order-id').hide();
							container.find('.tts-button').show();
							container.find('.todo-upload').hide();
							container.find('.todo-order').show();
							break;
					}

					container.find('.order-id').trigger('blur');
					container.find('.uploadStatus').text('');
					container.find('.uploadError').html('');
				});


				$(this).find(".order-id").on('blur', function() {
					if(container.find('.todo-options').val() == 'Order') {
						self.setOrderResponse.call(self, container);
					}
				});
				$(this).find(".asset-notes").on('blur', function() {
					if(container.find('.todo-options').val() == 'Order') {
						self.setOrderResponse.call(self, container);
					}
				});
				$(this).find(".tts-button").on('click', function() {
					require('busyIndicator').start();

					var text;
					if (container.find('.chk-as-is').is(':checked')) {
						text = self.options.config.narrationText;
					}
					else {
						text = container.find('.narration-text').val().trim();
					}

					require('ttsModel').go(container.attr('data-locale'), text, function(url) {
						self.afterFileUpload(container, {
							assetId: null,
							state: true,
							asIs: container.find('.chk-as-is').is(':checked'),
							narrationText: container.find('.narration-text').val().trim(),
							origin: 'tts',
							locale: container.attr('data-locale'),
							src: url,
							isUpload: true
						});
						require('busyIndicator').stop();
					}, function() {
						container.find('.uploadError').html(require('translate').tran('Unable to communicate service'));
						require('busyIndicator').stop();
					})
				});

				$(this).find(".chk-as-is").on('change', function() {
					var val = $(this).is(':checked');
					if (val) {
						container.find('.narration-text').val('').addClass('hidden');
						container.find('.lbl-narration-text').addClass('hidden');
					}
					else {
						container.find('.narration-text').val(container.parent('.multiLingualWrapper').length > 0 ? '' : self.options.config.narrationText).removeClass('hidden');
						container.find('.lbl-narration-text').removeClass('hidden');
					}
					self.setOrderResponse.call(self, container);
				});

				$(this).find('.narration-text').on('change', function() {
					self.setOrderResponse.call(self, container);
				});

			});

			this.$("#has_multinarration").on('change', function () {
				self.options.config.multiNarrationChecked = $(this).is(':checked');
				if ($(this).is(':checked')) {
					self.setMultiNarrationData();
					self.show(self);
				} else {
					self.show(self);
					self.bindEvents();
				}
			});
			

		},

		setOrderResponse: function(container) {
			var assetData = {
				assetId: container.find('.order-id').val().trim(),
				asIs: container.find('.chk-as-is').is(':checked'),
				narrationText: container.find('.narration-text').val().trim(),
				locale: container.attr('data-locale'),
				notes: container.find(".asset-notes").val().trim(),
				isOrder: true
			};

			this.response = this.response || {};

			if (!this.options.config.editMode && this.response[container.attr('data-locale')]) {
				if (this.response[container.attr('data-locale')].origin !== 'order') {
					this.response[container.attr('data-locale')] = null;
				}
			}


			if (assetData.assetId || this.response[container.attr('data-locale')]) {
				this.response[container.attr('data-locale')] = this.response[container.attr('data-locale')] ? _.merge(this.response[container.attr('data-locale')], assetData) : assetData;
			} else {
				this.response[container.attr('data-locale')] = '';
			}

			container.find('.tts-button').removeClass('disabled').attr('disabled', false);

			this.controller.setReturnValue('yes', _.omit(this.response, function (item) { return _.isUndefined(item) }));
		}


	}, {type: 'FileUploadDialogView'});

	return FileUploadDialogView;

});