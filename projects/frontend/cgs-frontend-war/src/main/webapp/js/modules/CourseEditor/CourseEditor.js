define(['lodash', 'BaseContentEditor', 'repo', 'validate', './config', 'events', 'files', 'assets', 'userModel',
    './CourseEditorView', 'modules/LessonsTableComponent/LessonsTableComponent', 'modules/AppletsTableComponent/AppletsTableComponent',
    'modules/AppletsToolboxComponent/AppletsToolboxComponent', 'dialogs', 'standardsModel', 'localeModel', 'ttsModel', 'ttsComponent', 'multiNarrationComponent', 'busyIndicator', 'modules/EBooksInUseComponent/EBooksInUseComponent'],
    function f491(_, BaseContentEditor, repo, validate, config, events, files, assets, userModel, CourseEditorView, LessonsTableComponent,
        AppletsTableComponent, AppletsToolboxComponent, dialogs, standardsModel, localeModel, TTSModel, TTSComponent, MultiNarrationComponent, busy, EBooksInUseComponent) {

        var CourseEditor = BaseContentEditor.extend({

            initialize: function f492(configOverrides) {

                this._super(config, configOverrides);

                repo.startTransaction({ ignore: true });
                //load account lists
                this.loadData();

                this.enableLo = userModel.account.enableLearningObjects;

                this.enableAssessment = userModel.account.enableAssessment;
                this.enableBookAlive = userModel.account.enableBookAlive;
                this.enableBornDigital = userModel.account.enableBornDigital;


                this.view = new CourseEditorView({controller: this});
                this.lessonsTable = new LessonsTableComponent(this.config);
                this.appletsTable = new AppletsTableComponent(this.config);
                this.appletsToolbox = new AppletsToolboxComponent(this.config);
                this.eBooksInUse = new EBooksInUseComponent(this.config);

                // Delete non-existing providers
                var localesToDelete = [],
                    availableServices = TTSModel.getServices();

                _.each(this.record.data.ttsServices, function(tts, locale) {
                    if (!availableServices || !availableServices[locale] || !_.find(availableServices[locale].providers, {id: tts.id})) {
                        localesToDelete.push(locale);
                    }
                });

                if (localesToDelete.length) {
                    repo.updateProperty(this.record.id, 'ttsServices', _.omit(this.record.data.ttsServices, localesToDelete), false, true);
                }

                this.initMultiNarrationComponent();
                if (!window.customizationPackLoading) {
                    this.view.renderCustomizationPackRelatedComponents();
                }

                repo.endTransaction();

                this.registerEvents();

				require('publishModel').getCoursePublishedUrl(repo._courseId).then(function() {
					events.fire('enable_menu_item', 'menu-button-share-a-link');
				}, function() {
					events.fire('disable_menu_item', 'menu-button-share-a-link');
				});
            },

            startPropsEditing: function() {
                // prevent super start editing
            },

            initMultiNarrationComponent: function () {
                this.multiNarrationComponent = new MultiNarrationComponent({
                    model: this.record.data.multiNarrationLocales || [],
                    update_model: function (data) {
                        var result = {};
                        var locales = _.pluck(data, 'locale');

                        _.each(data, function (item) {
                            result[item.locale] = item;
                        });

                        _.each(this.record.data.ttsServices, function (item, locale) {
                            if (locale.toLowerCase() !== this.record.data.contentLocales[0].toLowerCase()) {
                                var ttsLocaleMapping = require("ttsModel").localeMapping;
                                if(ttsLocaleMapping){
                                    //if we have a locale mapping we need to revert the key value order to check the course value
                                    var valueIndex = _.values(ttsLocaleMapping).indexOf(locale);
                                    if(valueIndex != -1 ){
                                        locale = _.keys(ttsLocaleMapping)[valueIndex];
                                    }
                                }
                                if (!~locales.indexOf(locale)) {
                                    delete this.record.data.ttsServices[locale];
                                }
                            }
                        }, this);

                        logger.info(logger.category.COURSE, 'Course multi-narrations locales list set to ' + locales.join(','));

                        repo.updateProperty(this.record.id, 'multiNarrationLocales', locales);

                        if (this.view.isTTSEnabled()) this.initTtsComponent();
                    }.bind(this),
                    el: "#multinarrations"
                })
            },
            initTtsComponent: function f493(e) {
                this.ttsComponent = new TTSComponent({
                    data: {
                        id: this.record.id,
                        ttsServices: require('cgsUtil').cloneObject(this.record.data.ttsServices),
                        courseLocale: this.record.data.contentLocales[0]
                    },
                    update_model: function f494(locale, data) {
                        if (!arguments.length) {
                            logger.audit(logger.category.COURSE, 'All tts services of the course were deleted');
                            !!this.record.data.ttsServices && repo.deleteProperty(this.record.id, 'ttsServices');
                        }
                        else if (!this.record.data.ttsServices || !_.isEqual(this.record.data.ttsServices[locale], data)) {
                            if (!data) {
                                logger.audit(logger.category.COURSE, 'Tts service of the course for ' + locale + ' locale was deleted');
                                repo.deletePropertyObject(this.record.id, 'ttsServices', locale);
                            }
                            else {
                                logger.audit(logger.category.COURSE, { message: 'Tts service of the course for ' + locale + ' locale was updated', data: data });
                                repo.updatePropertyObject(this.record.id, 'ttsServices', locale, data);
                            }
                        }

                        this.view.refreshCPComponents();

                        return  require('cgsUtil').cloneObject(this.record.data.ttsServices);
                    }.bind(this),
                    el: "#tts-services",
                    target: e
                })
            },

            setTTSService: function(e, isSet) {
                if (isSet) {
                    repo.updateProperty(this.record.id, 'ttsServices', {});
                    this.initTtsComponent(e);
                }
                else {
                    if (this.ttsComponent) {
                        this.ttsComponent.clearServices();
                        this.ttsComponent.dispose();
                    }
                    repo.updateProperty(this.record.id, 'ttsServices', undefined);
                }
            },

            loadData: function f495() {
                var userModel = require('userModel');
                this.contentLocales = userModel.account.contentLocales;
                var currentLocale = this.record.data.contentLocales[0];
                this.subjectAreas = this.getValueFromAccount('subjectAreas', currentLocale);
                this.gradeLevels = this.getValueFromAccount('gradeLevels', currentLocale);

				// union customMetadataFields saved in repo with new values from publisher account ( modified in admin)
                //target: array to add values, source: array to search values, key: key to merge by
                userModel.account.customMetadata = !_.isArray(userModel.account.customMetadata) ? [] : userModel.account.customMetadata;

                var customMetadataFields = require('cgsUtil').mergeByKey({
                    'target': repo.get(this.record.id).data.customMetadataFields,
                    'source': userModel.account.customMetadata.concat(
                        _.flatten(_.map(_.filter(userModel.account.customMetadataPackages, {'target' : 'course'}), function(package){
                        return package.customMetadata;
                    }))),
                    'key': 'id',
                    'propertyToKeep' : 'courseValue'

                });

                if (!_.isEqual(this.record.data.customMetadataFields, customMetadataFields)) {
                    repo.updateProperty(this.record.id, "customMetadataFields", customMetadataFields, false, true);
                }

                this.showMetadataTab = customMetadataFields && customMetadataFields.length;

	            this.showNarrationTab = (this.enableNarrationAdditionalLanguages || this.enableTextToSpeach);

            },

            getValueFromAccount: function(type, locale){
                var data = userModel.account[type];
                var localeData= _.find(data, {'locale': locale});
                if(localeData){
                    return localeData.value;
                }
                return [];


            },

            registerEvents: function f496() {
                this.bindEvents({
                    'lessonsCountChanged': { 'type':'register', 'func':this.view.setDiffLevelsButtonState, 'ctx': this.view, 'unbind': 'dispose' },
                    'customizationPack-done-loading': { 'type':'once', 'func':this.view.renderCustomizationPackRelatedComponents, 'ctx': this.view }
                });

                this.record = repo.get(this.config.id);

                var changes = {
                    title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
                    isbn: this.propagateChanges(this.record, 'isbn', validate.isbnCheck, true),
                    contentLocales: this.propagateChanges(this.record, 'contentLocales', validate.requiredField, true),
                    subjectArea: this.propagateChanges(this.record, 'subjectArea', validate.requiredField, true),
                    gradeLevel: this.propagateChanges(this.record, 'gradeLevel', validate.requiredField, true),
                    overview: this.propagateChanges(this.record, 'overview', true),
                    credits: this.propagateChanges(this.record, 'credits', true),
                    targetPopulation: this.propagateChanges(this.record, 'targetPopulation', true),
                    technicalRequirements: this.propagateChanges(this.record, 'technicalRequirements', true),
                    maxDepth: this.propagateChanges(this.record, 'maxDepth', true),
                    includeLo: this.propagateChanges(this.record, 'includeLo', true),
                    references: this.propagateChanges(this.record, 'references', true)
                };

                this.model = this.screen.components.props.startEditing(this.record, changes);
	            this.model.on('change:title', function _change_title(child, val) {
		            this.view.$el.find('#courseName h3').html(val);
	            }.bind(this));

                this.model.on('change:contentLocales', function f497(child, val) {

                    this.createArray(val, 'contentLocales');

                    logger.audit(logger.category.COURSE, 'Customization pack changed to ' + val);

                    localeModel.setLocale(val, true, function(){

                        repo.updateProperty(this.record.id, 'subjectArea', []);
                        repo.updateProperty(this.record.id, 'gradeLevel', []);

                        repo.updateProperty(this.record.id, 'ttsServices', null);

                        repo.reset();

                        this.router.load(this.router._static_data.id, this.router._static_data.tab, this.router._static_data.page);

                    }.bind(this));
                }, this);


                this.model.on('change:subjectArea', function f498(child, val) {
                    repo.startTransaction({ appendToPrevious: true });
                    this.createArray(val, 'subjectArea');
                    repo.endTransaction();
                }, this);
                this.model.on('change:gradeLevel', function f499(child, val) {
                    repo.startTransaction({ appendToPrevious: true });
                    this.createArray(val, 'gradeLevel');
                    repo.endTransaction();
                }, this);

                this.model.on('change:maxDepth', this.renderLevelsPreview, this);
                this.model.on('change:includeLo', this.renderLevelsPreview, this);
            },
            getTTSConfig: function f500() {
                var _currentService = this.record.data.ttsServices[this.record.data.contentLocales[0]];

                return _.merge(_currentService, _.find(this.ttsProviders, function f501(item) {
                    return item.id = _currentService.id;
                }))
            },

            onSelectStdPackage: function f502() {
                busy.start();
                standardsModel.getStandardsPackages(_.bind(this.onReceiveStdPackages, this));
                events.once('addPackages', this.addPackages, this);
            },

            /**
             * edit button click on differentation table,
             * shows differentiation levels dialog and
             * sets return event on setDiffLevels function
             */
            onEditDiffLevels: function f503() {
                this.showDiffLevelsDialog();
                events.once('setDiffLevels', this.setDiffLevels, this);
            },

            showDiffLevelsDialog: function f504() {
                var dialogConfig = {
                    title: "Differentiation levels",
                    closeOutside: false,
                    diffLevels: this.record.data.diffLevels,
                    buttons: {
                        ok: {label: 'ok'},
                        Cancel: { label: 'Cancel', value: false }
                    }
                };
                dialogs.create('diffLevels', dialogConfig, 'setDiffLevels');
            },
            isDifferentiationExists: function f542() {
                var arr_lessons = [];

                require("repo").getChildrenByTypeRecursive(this.record.id, "lesson", arr_lessons);

                return !!arr_lessons.length;
            },

            /**
             * the function updates the differentiation levels
             * returned from the dialog if it was closed
             * with the ok button
             *
             * @param returnValue
             * @param response
             */
            setDiffLevels: function f505(returnValue, response) {
                var cid;
                if (response === "ok") {
                    cid = require("courseModel").getCourseId();
                    if (this.isDifferentiationExists()) {

                        this.updateDiffLevels(returnValue, function () {
                            repo.updateProperty(cid,"diffLevels",returnValue);
                        });
                    } else {
                        repo.updateProperty(cid,"diffLevels",returnValue);
                        this.view.renderDiffLevels();
                    }
                }
            },

            updateDiffLevels: function (data, callback) {
                var diffData = {};

                diffData.defaultLevelId = _.find(data, function (item) { return item.isDefault; }).id;
                diffData.levels = _.map(data, function (item) { return _.omit(item, 'isDefault') });

                require('courseModel').updateDiffLevels(diffData, callback);
            },

            onReceiveStdPackages: function f506(data) {
                var currentStandardPackages;
                busy.stop();
                currentStandardPackages = this.record.data.standartsPackages;
                _.each(data, _.bind(function f508(item) {
                    _.extend(item, {
                        disable: (standardsModel.containsPackage(currentStandardPackages, item) != -1)
                    });
                }, this));
                data = _.sortBy(data, 'description');
                var dialogConfig = {
                    title: "Add standard package",
                    closeOutside: false,
                    standardPackages: data,
                    buttons: {
                        Add: { label: 'Add', value: null, canBeDisabled: true },
                        Cancel: { label: 'Cancel', value: false }
                    }
                }
                dialogs.create('standardPackage', dialogConfig, 'addPackages');
            },

            onRemoveStdPackage: function f509(package) {
                busy.start();
                standardsModel.removePackage(package);
            },
            onUpdateStdPackage: function f511(package) {
                busy.start();
                standardsModel.prepareUpdatePackage(package);
            },

            addPackages: function f512(returnValue, response) {

                //download package from server
                //repo.updatePropertyList(this.config.id, "stdPackages", returnValue);
                busy.start();
                standardsModel.packageChosen(returnValue, _.bind(function f513() {
                    this.view.getStandardsPackagesUpdate();
                    busy.stop();
                }, this));

            },
            //the method return boolean if the user can change the max depth -
            // return boolean if the request Max depth is lower then the current
            doMaxDepthCouldChange: function f514(newMaxDepth) {

                var children = repo.getSubtreeRecursive(this.config.id);
                var currentDepth = this.getTocCurrentDepth(this.getOnlyTocChildren(children), this.config.id);
                if (newMaxDepth >= currentDepth) {
                    return true;
                } else {
                    return false;
                }
            },
            //the method clear all the array and live only TOC type
            getOnlyTocChildren: function f515(childArr) {
                var newArr = [];
                for (var i = 1; i < childArr.length; i++) {
                    if (childArr[i].type == "toc") {
                        newArr.push(childArr[i]);
                    }
                }
                return newArr;
            },
            //recursive method that return the current depth of toc
            getTocCurrentDepth: function f516(childs, currentParent) {
                var i = 0 , found = true;
                while (found) {
                    if (childs.length > 0 && childs.length > i) {
                        if (childs[i].parent == currentParent) {
                            return 1 + this.getTocCurrentDepth(childs, childs[i].id);
                        } else {
                            i = i + 1;
                        }
                    } else {
                        found = false;
                    }
                }

                return 0;

            },
            createArray: function f517(v, field) {
                var arr = [];
                arr.push(v);

                repo.updateProperty(this.config.id, field, arr);
            },

            renderLevelsPreview: function f518() {
                this.view.renderLevelsPreview();
                this.screen.components.menu.refreshMenu();
            },

             openImageCropperDialogue : function(){

                var self = this;
                this.currentImageId = this.controller.record.id;
                var repoId = this.controller.record.id;
                //No image was chosen. Can't open dialog
                if( !this.currentImageId ){
                    return;
                }

                var dialogConfig = {
                    buttons: {
                        ok:     { label: 'OK' },
                        cancel:  { label: 'Cancel' }
                    },

                    content: {
                    },

                    data: {
                        img: this.controller.record.data.cover,
	                    beforeTerminationCallback: function (blob) {
		                    assets.uploadBlobAndSaveItLocally(blob, function (filePathInsideMediaFolder) {
			                    self.controller.onCoverFileUpload(filePathInsideMediaFolder);
		                    });
	                    }
                    }
                }
                this.previewDialog = dialogs.create('imageCropper', dialogConfig);
            },

            onCoverFileUpload: function f519(cover) {
                if (!cover) return;

                var coverUrl = assets.serverPath(cover);
                this.view.updateCourseCoverImgSrc(coverUrl);
                this.view.enableImageCropperButton(true);
                repo.updateProperty(this.config.id, "cover", cover);
                repo.updateProperty(this.config.id, "coverRefId", cover); // don't ask
                repo.updateProperty(this.config.id, "coverUrl", coverUrl);
            },

            onReferenceFileUpload: function f520(response) {
                if (!response) return;

                var fileName = response.split("/").pop(),
                    ref = {
                        fileName: fileName,
                        path: (response),
                        fileType: require('cgsUtil').getFileMediaType(fileName)
                    };

                repo.updatePropertyList(this.config.id, "references", ref);
                this.view.insertCourseReference(ref);

                // update course references count and enable menu button
                // this.screen.components.menu.setCourseReferencesCount();
                this.screen.components.menu.view.enableCourseReferences();
            },
            onCustomizationFileUpload: function(){
                require('cgsUtil').unsavedCourseNotification(function(){
                    localeModel.uploadLocale();
                }.bind(this));
            },

            deleteReferenceFile: function f521(filePath, callback) {

                var references_arr = _.clone(repo.get(this.config.id).data.references);
                if (!references_arr || !references_arr.length) {
                    return
                }

                //find items to remove in references array
                var fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
                var items_to_remove = _.where(references_arr, {'fileName': fileName});
                if (!items_to_remove.length) {
                    return
                }

                //remove deleted file from the references array
                references_arr.splice(references_arr.indexOf(items_to_remove[0]), 1);
                var self = this;

                repo.updateProperty(self.config.id, "references", references_arr);
                callback();

            },

            dispose: function() {
                this.lessonsTable && this.lessonsTable.dispose();
                this.appletsTable && this.appletsTable.dispose();
                this.appletsToolbox && this.appletsToolbox.dispose();
                this.eBooksInUse && this.eBooksInUse.dispose();
                this.multiNarrationComponent && this.multiNarrationComponent.dispose();
                this.ttsComponent && this.ttsComponent.dispose();

                this._super();

                delete this.lessonsTable;
                delete this.appletsTable;
                delete this.appletsToolbox;
                delete this.eBooksInUse;
                delete this.multiNarrationComponent;
                delete this.ttsComponent;
            },

            refreshComponents: function() {
               this.eBooksInUse.refreshTable();
            }

        }, {type: 'CourseEditor'});

        return CourseEditor;

    });
