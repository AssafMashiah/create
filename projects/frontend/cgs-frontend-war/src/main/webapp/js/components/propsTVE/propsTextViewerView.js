define(['mustache', 'assets', 'busyIndicator', 'files', 'localeModel', 'dialogs', 'repo', 'text!components/propsTVE/propsTextViewerTemplate.html'],
    function(mustache, assets, busyIndicator, files, localeModel, dialogs, repo, template) {

        var propsTextViewerView = Backbone.View.extend({
            events: {
                'focusout .contentEditableTve': 'updateMrkup',
                'focusin .contentEditableTve': 'disableOtherUploadButtons',
                'keyup .contentEditableTve': 'saveRange',
                'click .contentEditableTve': 'saveRange',
                'click .uploadInlineImage': 'uploadInlineImage',
                'change .fileUpload': 'narrationUploadHandler',
                'change .imgUpload': 'imgUploadHandler',
                'click .upload_tts': 'showNarrateTtsDialog',
                'click .remove-narration' : 'removeNarration'

            },
            isContentEditableSelected: function f1298() {
                var selection = document.getSelection();
                var selectedNode = selection && selection.focusNode && selection.focusNode.parentNode || false;
                var validEditableNodes = ['DIV'];

                if (selectedNode && validEditableNodes.indexOf(selectedNode.nodeName) !== -1) {
                    return true;
                }

                return false;
            },
            styleShorcuts: function f1299(element) {
                var self = this;
                var isCtrlDown = false;

                $(element).bind('keydown', function f1300(e) {
                    if (self.isContentEditableSelected()) {
                        if (e.keyCode === 17) isCtrlDown = true;
                        else {
                            if (isCtrlDown && [66, 73, 85].indexOf(e.keyCode) !== -1) {
                                e.preventDefault();
                                return false;
                            }
                        }
                    }

                    return true;
                });

                $(element).bind('keyup', function f1301(e) {
                    if (self.isContentEditableSelected()) {
                        if (e.keyCode === 17) isCtrlDown = false;
                        else {
                            if (isCtrlDown && [66, 73, 85].indexOf(e.keyCode) !== -1) {
                                e.preventDefault();
                                return false;
                            }
                        }
                    }

                    return true;
                });
            },
            initialize: function() {
                this.data = this.dataToModel(this.options.data);
                this.propsTextViewersParent = this.options.propsTextViewersParent;
                this.courseLocale = repo.get(repo._courseId).data.contentLocales[0];
                this.options.isTTSEnabled = require('ttsModel').isTtsServiceEnabledByLocale(this.courseLocale);
                this.render();

	            this.editableDiv.length &&
	            this.editableDiv.get(0).addEventListener('paste', this.handlePaste.bind(this));
            },

            render: function() {
                this.readOnly = require('editMode').readOnlyMode;
                this.$el.html(mustache.render(template, this));

                this.editableDiv = this.$el.find('.contentEditableTve');

                this.styleShorcuts(this.editableDiv);

                this.narrationUpload = this.$('.fileUpload');
                this.imgUpload = this.$('.imgUpload');
                this.bindEvents();
            },
            showNarrateTtsDialog: function (e) {
                if (!$(e.target).hasClass('disabled')) {
                    this.selection = getSelection.call(this);
                    var dialog_config = {
                        title: "Text to Speech",
                        asIsText: $("<div />").append(this.data.value).text(),
                        closeOutside: false,
                        buttons: {
                            ok: {label: 'OK'},
                            Cancel: { label: 'Cancel', value: false }
                        }
                    };

                    require("events").once('narrate_tts', function (response) {
                        if (response) {
                            this.onNarrationUpload({ path: response, locale: this.courseLocale, isTTS: true });
                            this.copyHandler(response);
                        }
                    }.bind(this));

                    dialogs.create('narrate_tts', dialog_config, 'narrate_tts');
                }
            },
            triggerNarrationUpload: function(event) {
                if (!$(event.target).hasClass('disabled')) {
                    this.narrationUpload.trigger(event);
                }
            },

            bindEvents: function() {
                var self = this;
                // File upload activator click
                this.$(".uploadNarration").click(_.bind(function(event) {
                    if (!$(event.target).hasClass('disabled')) {
                        this.narrationUpload.trigger(event);
                    }

                }, this));
                this.$(".uploadInlineImage").click(_.bind(function(event) {
                    if (!$(event.target).hasClass('disabled')) {
                        this.imgUpload.trigger(event);
                    }

                }, this));

            },
            imgUploadHandler: function(evnt) {
                this.uploadHandler(evnt, 'image');
            },
            narrationUploadHandler: function(evnt) {
                this.uploadHandler(evnt, 'narration');
            },

            copyHandler: function (file) {
                var custom_base_dir = require('repo').get(require('courseModel').courseId).data.customizationPackManifest.baseDir;
                var src = [files.coursePath(), custom_base_dir, 'cgs', 'media', ''].join('/');
                    file = [files.coursePath(), file].join("");

	            //create folders in customization pack directory
	            function _makeCustomizationPackDirs() {
		            var deferred = $.Deferred();
		            files._makeDirs([src], deferred.resolve);
		            return deferred.promise();
	            }

	            var promise = _makeCustomizationPackDirs();

	            promise.done(function() {
		            files.copyFile(file, src, true);
	            });

            },

            /*handle paste to teacher guid, removed any format and paste plain text only*/
            handlePaste : function(e){
                var selection = getSelection.call(this),
                    pastedHtml;

                if (selection){
                    this.range = selection.getRangeAt(0);
                }

                try {
                    pastedHtml = e && e.clipboardData && e.clipboardData.getData('text/plain');
                } catch (e) {
                    return e.preventDefault();
                }

                if (pastedHtml && pastedHtml.length) {
                   if (selection.type === 'Range') {
                        this.range.extractContents();
                    }
                    pastedHtml = document.createTextNode(pastedHtml);
                    this.range.insertNode(pastedHtml, this.range.endOffset);

                    this.saveUpdatedData({
                        markup: this.modelToData(this.editableDiv.html().trim())
                    });
                    e.preventDefault();
                }
            },

            uploadHandler: function(event, type) {

                if (!event.target.files.length) return;

                event.stopPropagation();
                event.preventDefault();
                busyIndicator.start();

                var self = this,
                    baseCustomizationDirectory = require('repo').get(require('courseModel').courseId).data.customizationPackManifest.baseDir,
                    mediaPath = [files.coursePath(), baseCustomizationDirectory, 'cgs', 'media', ''].join('/');

                        require("events").fire('busyIndicator.showCancel', true);
                        require("events").fire('busyIndicator.enableCancel', false);
                        var uploadToServerFailedOrAborted = function(){
                            $(event.target).val('');
                            busyIndicator.stop("all");
                        };

                        var url = assets.uploadAbsPath([baseCustomizationDirectory, 'cgs', 'media', ''].join('/') + event.target.files[0].name) + '?isSha1=false',
	                        blob = event.target.files[0];

                        assets.uploadAssetToServer({
                            url: url,
                            file: blob,
                            successCallback: function(data) {
	                            var fullPath = data.filePath,
		                            relarivePath = files.removeCoursePath(undefined, undefined, fullPath),
                                    filePath = files.coursePath(undefined, undefined, relarivePath),
                                    filename = filePath.substr(filePath.lastIndexOf('/') + 1);

	                            files.saveAsset({
		                            directory: mediaPath,
		                            inputElement: event.target,
		                            callback: function(file) {
			                            if (type == "narration") {
				                            self.onNarrationUpload({ locale: self.courseLocale, path: file.name });
			                            } else {
				                            self.onImageUpload(file.name, assets.serverPath(relarivePath));
			                            }
			                            busyIndicator.stop();
		                            },
		                            fileName :event.target.files[0].name
	                            });

                            },
                            abortCallback: uploadToServerFailedOrAborted,
                            errorCallback: uploadToServerFailedOrAborted
                        });

            },

            onNarrationUpload: function(data) {
				var path;
                if (data.path.indexOf('media') === -1) {
                    path = ['media', data.path].join('/');
                } else {
                    path = data.path.indexOf("/") === 0 ? data.path.substring(1) : data.path;
                }

                if (data.isTTS) {
                    path = path.split("/");
                    path = path[0] + "/" + path[path.length - 1];
                }

	            var narration = {};

                narration[data.locale] = path;

                //get text selection
                this.editableDiv.focus();

                var selection = this.selection || getSelection.call(this);
                var range = selection ? selection.getRangeAt(0) : this.range;
                if (!range) {
                    return;
                }
                var narrationimgElem = this.editableDiv.find('inlinefile[type="textViewerNarration"]');
                if (narrationimgElem.length) {
                    $(narrationimgElem).attr('narrations', escape(JSON.stringify(narration)));
                } else {
                    narrationimgElem = $('<inlinefile/>').attr({
                        'type': 'textViewerNarration',
                        'narrations': escape(JSON.stringify(narration))
                    });

                    range.setStart(range.startContainer, range.startContainer.length);
                    range.setEnd(range.endContainer, range.endContainer.length);

                    range.insertNode(narrationimgElem[0], range.endOffset);
                }

                localeModel.addMediaFileToOverride({
                    id: path,
                    value: {
                        "name": narration[data.locale]
                    }
                });

                this.saveUpdatedData({
                    markup: this.modelToData(this.editableDiv.html().trim())
                });

                this.$('.narration_icon').removeClass('disabled');
            },

            removeNarration : function(e){
                if(!$(e.currentTarget).hasClass('disabled')){
                    var narration = this.editableDiv.find('inlinefile[type="textViewerNarration"]');
                    if(narration){
                        $(narration).remove();
                        this.$('.narration_icon').addClass('disabled');
                        this.saveUpdatedData({
                            markup: this.modelToData(this.editableDiv.html().trim())
                        });
                    }

                }
            },

            updateMrkup: function(evnt) {
                this.saveUpdatedData({
                    markup: this.modelToData(evnt.target.innerHTML.trim())
                });
                this.isEnabled = false;
            },

            saveRange: function() {
                var selection = getSelection.call(this);
                if (selection)
                    this.range = selection.getRangeAt(0);
            },

            saveUpdatedData: function(data) {
                this.options.data.value = data.markup;
                this.data = this.dataToModel(this.options.data);
                this.options.onChageCallback(data);
            },

            modelToData: function(model) {
                var data = '';

                var wrapedMarkup = $("<wrapper>" + model + "</wrapper>");
                 $(wrapedMarkup).find('inlinefile').each(function () {
                    if ($(this).attr('name') && !$(this).attr('narrations')) {
                        $(this).text($(this).attr('name')).removeAttr('name').removeAttr('style');
                    } else {
                        if ($(this).attr('narrations')) {
                            var narrations = JSON.parse(unescape($(this).attr('narrations')));
                            var name = _.values(narrations)[0];

                             $(this).text(name).removeAttr('narrations').removeAttr('style');
                        }
                    }
                });

                $(wrapedMarkup).find('img').each(function () {
                    $(this).replaceWith($('<inlinefile/>', {
                        'type': 'inlineImage'
                    }).text($(this).attr('name')));
                });

                data = $(wrapedMarkup).html();
                data = data.replace(/&nbsp;/g,' ').replace(/&amp;/g, '&').replace(/<br>/g,'\n');
                data = JSON.stringify(data);
                data = data.substring(1, data.length - 1);

                return data;
            },
            dataToModel: function(data) {

                var model = {};
                model.hasFile = false;

                var wrapedMarkup = $("<wrapper>" + JSON.parse('"' + data.value + '"') + "</wrapper>");
                _.each($(wrapedMarkup).find('inlinefile'), function(inlinefile) {
                    var text = $(inlinefile).text();
                    $(inlinefile).attr('name', text).text('');
                    var type = $(inlinefile).attr('type');
                    switch(type){
                        case 'inlineSound':
                            $(inlinefile).attr('type', 'textViewerNarration');
                            model.hasFile = data.hasFile = true;
                        break;

                        case 'textViewerNarration':
                            model.hasFile = data.hasFile = true;
                        break;

                        case 'inlineImage':
                           $(inlinefile).replaceWith($('<img/>',
                            {   'style': "height:24px",
                                'src' : assets.serverPath([localeModel.baseDir, 'cgs', localeModel.getConfig('mediaFiles')[text].name].join('/')),
                                'name': text
                            }));

                        break;
                    }

                });
                model.value = $(wrapedMarkup).html();

                return model;

            },

            disableOtherUploadButtons: function() {
                this.propsTextViewersParent.find(".props_text_container").not("#" + this.$el.attr('id')).find('.uploadNarration, .upload_tts, .uploadInlineImage, .remove-narration').addClass('disabled');
                this.$el.find('.uploadNarration, .upload_tts, .uploadInlineImage, .remove-narration').removeClass('disabled');
                this.isEnabled = true;
            },

            hasFile: function() {
                return this.options.data.hasFile;
            },
            onImageUpload: function(fileName, url) {
                path = ['media', fileName].join('/');

                //get text selection
                var selection = getSelection.call(this);

                var range = selection ? selection.getRangeAt(0) : this.range;
                if (!range) {
                    this.editableDiv.focus();

                    selection = getSelection.call(this);
                    range = selection ? selection.getRangeAt(0) : this.range;

                    if (!range) {
                        return;
                    }
                }

                var narrationimgElem = $('<img/>' ,
                {
                    'name': fileName,
                    'src': url ? url : assets.absPath([localeModel.baseDir, 'cgs/media', fileName].join('/')),
                    'style' : 'height:24px;'
                });


                range.setStart(range.startContainer, range.startOffset);
                range.setEnd(range.endContainer, range.endOffset);

                range.insertNode(narrationimgElem[0], range.endOffset);

                localeModel.addMediaFileToOverride({
                    id: fileName,
                    value: {
                        "name": path
                    }
                });

                this.saveUpdatedData({
                    markup: this.modelToData(this.editableDiv.html().trim())
                });

            }

        });

        function getSelection() {
            //get text selection
            var selection = document.getSelection();

            if (!selection.baseNode) {
                return false;
            }

            if (selection.baseNode != this.editableDiv[0]) {
                if ($(selection.baseNode).parents('.' + this.editableDiv.attr('class')).length == 0) {
                    return false;
                }
            }

            return selection;
        }


        return propsTextViewerView;
    });