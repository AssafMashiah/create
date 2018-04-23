define(['jquery', 'courseModel', 'files', 'assets', 'FileUpload', 'BasePropertiesView', 'standardsModel', 'events', 'localeModel',
        'cp_instructionComponent', 'cp_feedbackComponent', 'cp_PlayerInterfaceComponent',
        'cp_FontsComponent', 'cp_stylesAndEffects', 'cp_playersComponent', 'StandardsList',
        'repo', 'text!modules/CourseEditor/templates/CourseEditor.html',
		'text!modules/CourseEditor/templates/subMenu.html',
        'text!modules/CourseEditor/templates/LevelsPreview.html',
        'text!modules/CourseEditor/templates/standardPackageRow.html',
        'text!modules/CourseEditor/templates/diffLevelRow.html',
		'text!modules/CourseEditor/templates/miscellaneous.html',
        'mustache', 'dialogs', 'translate', 'editMode', 'cgsUtil', 'customCourseMetadata', 'bootstrap'
    ],
    function f523($, courseModel, files, assets, FileUpload, BasePropertiesView, standardsModel, events,
        localeModel, cp_instructionComponent, cp_feedbackComponent, cp_PlayerInterfaceComponent,
        cp_FontsComponent, cp_stylesAndEffects, cp_playersComponent, StandardsList, repo, template,
        subMenuTemplate, LevelsPreviewTemplate, standardPackageRow, diffLevelRow, miscellaneousTemplate,
        Mustache, dialog, i18n, editMode, cgsUtil, customCourseMetadata) {

        var CourseEditorView = BasePropertiesView.extend({

            events: {
                'click .delete_reference': 'deleteCourseReference',
                'click .verticalNavContainer [data-toggle=tab]': 'tabNavigate',
	            'click #CourseEditorTabs [data-toggle=tab]': 'switchSettingsView',
                'click #field_useTtsServices': 'showTtsComponent',
                'click .multiselect input[type="checkbox"]' : 'multiCheckboxCheck'
            },

            tabNavigate: function f524(e) {
                // check Learning Object is active
                this.checkLearningObject();
                this.checkContentLanguageEditable();

	            var target_element = $(e.currentTarget);
	            var pageId = target_element.attr('data-pageId');
	            var currentTab = target_element.attr('href');
	            if(currentTab == null) {
		            target_element.parents('ul').attr('id');
	            } else {
		            currentTab = currentTab.slice(1, currentTab.length);
	            }

                require('router').setTab(currentTab, pageId);
	            this.$el.children('.course-editor').removeClass(courseModel.activeSettingsTab);
	            this.$el.children('.course-editor').addClass(currentTab);

                //update tab title (may have ancestors with numeric value, so we need only the text from the ahref itself)
                var selectedTabText = $(target_element).clone().children().remove().end().text();
                this.$el.find('#tabTitle h3').html(selectedTabText);

                events.fire('init-cgs-hints');
                events.fire( "cgs-hints-align" );

                courseModel.activeSettingsTab = currentTab;
	            courseModel.activeSettingsPage = pageId;
            },

            switchSettingsView: function (e) {
	            e.preventDefault();
	            var tab, pageId;

	            var current_href = e.currentTarget &&
		            e.currentTarget.getAttribute &&
		            e.currentTarget.getAttribute('href');
	            if(current_href && current_href.length) {
                    tab = e.currentTarget.getAttribute('href').slice(1);
	            }
                pageId = $(e.currentTarget).attr('id');

	            // check Learning Object is active
	            this.checkLearningObject();
	            this.checkContentLanguageEditable();
	            if(tab == 'properties'){
					amplitude.logEvent('Open course settings',{
						"Course ID":this.controller.record.id
					});
	            }

                this.switchSettingsViewById(tab, pageId);
            },

            switchSettingsViewById: function(currentTab, pageId, onRender) {
	            if (currentTab == null) {  // no tab - choose first option and return
		            return;
	            }

	            require("router").setTab(currentTab, pageId);

	            // click the tab
	            this.$el.find('a[data-toggle=tab]').closest('.course-editor')
		            .removeClass(courseModel.activeSettingsTab || 'lessons')
	                .addClass(currentTab);

	            this.$el.find('a[href="#' + (currentTab !== "lessons" ? "properties" : "lessons") + '"]').tab('show');
	            //show sub-menu
	            if (["properties", "lessons"].indexOf(currentTab) < 0) {
		            this.$el.find('a[href="#' + currentTab + '"]').tab('show');
	            }

	            if (currentTab !== 'lessons') {
		            //update tab title
		            this.$el.find('#tabTitle h3').html(this.$el.find('.verticalNavContainer li[role=presentation].active').children().text());
	            	if (!onRender) {
	            		this.controller.refreshComponents();	
	            	}
	            } else {
		            this.$el.find('#tabTitle h3').html(this.controller.record.data.title);
	            }

	            courseModel.activeSettingsTab = currentTab;
	            courseModel.activeSettingsPage = pageId;
            },

            showTtsComponent: function f525(e) {
                this.controller.setTTSService(e, $(e.target).is(":checked"));

                this.refreshCPComponents();
            },

            refreshCPComponents: function() {
				this.customizationPackInstructionComponent && this.customizationPackInstructionComponent.refresh(localeModel.getConfig('stringData').repo);
				this.customizationPackFeedbackComponent && this.customizationPackFeedbackComponent.refresh(localeModel.getConfig('stringData').feedbacks);
            },

            initialize: function f526(options) {
				if (!window.courseEditorViewContext) {
					window.courseEditorViewContext = this;
				}
                this.template = template;
	            this.subMenuTemplate = subMenuTemplate;
                this._super(options);

                this.registerEvents();
                this.fileOptionObj = FileUpload.params.image;
                // file uploads
                new FileUpload({
                    activator: '#button_upload_cover',
                    options: this.fileOptionObj,
                    callback: this.controller.onCoverFileUpload,
                    context: this.controller
                });

                new FileUpload({
                    activator: '#button_upload_reference',
                    options: {
                        is_ref: true,
                        ignoreSizeLimit: true,
                        keepName : true,
                        disableTranscode: true
                    },
                    callback: this.controller.onReferenceFileUpload,
                    context: this.controller
                });

                $('#button_select_standard').click(_.bind(this.controller.onSelectStdPackage, this.controller));
                $('#button_select_diff_levels').click(_.bind(this.controller.onEditDiffLevels, this.controller));
                $('.course_cover_img #image_cropper_button').on( "click" , this.controller.openImageCropperDialogue.bind( this ) );
				$('#miscellaneous').on('click', '#button_upload_customization', this.controller.onCustomizationFileUpload.bind(this.controller));

                this.getStandardsPackagesUpdate();
            },

            registerEvents: function f527() {
                var selectDepth = this.$('#maxDepth');
                if (selectDepth.length > 0) {
                    selectDepth.on("change", _.bind(this.checkMaxDepth, this));
                }

                this.$('#field_isbn').on("change", function(e) {
                    var target = $(e.target);
                    target.val(target.val().trim())
                });
			},
            isTTSEnabled: function () {
                return this.$("#field_useTtsServices").is(":checked");
            },

			loadCustomizationPackRelatedData: function() {
				var customizationData = repo.get(repo._courseId).data.customizationPackManifest;
				this.customization = {};
				this.customization.fileName = localeModel.getCustomizationPackName();
				this.customization.language = customizationData.language;
				this.customization.version = customizationData.version;
				this.customization.date = customizationData.date;
			},

			renderCustomizationPackRelatedComponents: function() {

				this.loadCustomizationPackRelatedData();
				this.customizationPackInstructionComponent = new cp_instructionComponent({
				     parent: $("#CP_InstructionsComponent"),
				     data: localeModel.getConfig('stringData').repo,
				     onChangeCallback: _.bind(function(data) {
				         //save the data to course
				         var customizationOverride = localeModel.getLocale();
				         customizationOverride.stringData.repo = data.markup;
				         localeModel.updateCustomizationOverride(customizationOverride);
				     }, this)
				 });
				this.customizationPackFeedbackComponent = new cp_feedbackComponent({
				     parent: $("#CP_feedbacksComponent"),
				     data: localeModel.getConfig('stringData').feedbacks,
				     onChangeCallback: _.bind(function(data) {
				         //save the data to course
				         var customizationOverride = localeModel.getLocale();
				         customizationOverride.stringData.feedbacks = data;
				         localeModel.updateCustomizationOverride(customizationOverride);
				     }, this)
				 });

				this.customizationPackPlayerInterfaceComponent = new cp_PlayerInterfaceComponent({
				     parent : $("#CP_playerInterfaceComponent"),
				     data : localeModel.getDLStrings(),
				     onChangeCallback: _.bind(function(data){
				         localeModel.updateDLStringsFile(data);
				     },this)
				 });

				this.customizationPackFontsComponent = new cp_FontsComponent({
				     parent : $("#CP_fontsComponent"),
				     data : localeModel.getFonts(),
				     onChangeCallback: _.bind(function(data){
				        localeModel.updateFontsFiles(data);
				     },this)
				 });

				var styleAndEffects = require('styleAndEffectsUtil');
				var styleAndEffectsModel = styleAndEffects.getModel();

				this.customizationPackStylesComponent = new cp_stylesAndEffects({
				    'parent' : $("#CP_stylesComponent"),
				    'data' : {
				        'model' : styleAndEffectsModel ? styleAndEffectsModel.styles : null,
				        'isStyle': true
				    }
				});
				this.customizationPackEffectsComponent = new cp_stylesAndEffects({
				    'parent' : $("#CP_effectsComponent"),
				    'data' : {
				        'model' : styleAndEffectsModel ? styleAndEffectsModel.effects : null,
				        'isStyle':false
				    }
				});

				this.customizationPackPlayersComponent = new cp_playersComponent({
				    'parent' : $( "#CP_playersComponent" ),
				    'data' : localeModel.getThemingDefaults()
				});

				var miscellaneous = Mustache.render(miscellaneousTemplate, this);

				$("#miscellaneous").html(miscellaneous);

				if (courseModel.activeSettingsTab) {
				    styleAndEffects.activeEditorTopPosition &&
				    $( "#props_base" ).scrollTop( styleAndEffects.activeEditorTopPosition );
				}

				if (this.controller && this.controller.record.data.ttsServices && this.controller.enableTextToSpeach) {
					this.controller.initTtsComponent.call(this.controller);
				}
			},

            render: function f528() {
	            courseModel.activeSettingsTab = require('router').getActiveCourseTab();
	            this.currentTab = courseModel.activeSettingsTab;
                this._super({subMenuTemplate: this.subMenuTemplate});

                this.$el.unbind();
	            $('#props_base').addClass('course-props');

	            // check Learning Object is active
	            this.checkLearningObject();
	            this.checkContentLanguageEditable();

	            this.setTab(require('router').getActiveCourseTab(), require('router').getActiveCoursePage(), true);

	            this.renderLevelsPreview();
	            this.getStandardsPackagesUpdate();

               this.metadataComponent = new customCourseMetadata({
                    parent: $("#customCourseMetadata"),
                    data: this.controller.record.data.customMetadataFields,
                    updateCallback: _.bind(function(data) {
                        require('repo').updateProperty(this.controller.record.id, 'customMetadataFields', data);
                    }, this)
                });

	            if (this.controller.enableStandards) {
		            this.standardsList = new StandardsList(
			            {
				            itemId: '#standards_list',
				            repoId: this.controller.record.id,
				            getStandardsFunc: _.bind(function () {
					            return standardsModel.getStandards(this.controller.record.id);
				            }, this)
			            });
	            }

                this.renderMultiSelect();
				

            },
	        renderMultiSelect: function () {
		        var self = this, i, multiSelectDataValue;
		        $('.multiselect').each(function () {
			        var repoValue = $(this).attr('repoValue');
			        var multiSelectData = self.controller.record.data[repoValue];

			        if (multiSelectData) {
				        for (i = 0; i < multiSelectData.length; i++) {
					        multiSelectDataValue = multiSelectData[i];
					        $(this).find('input[name="' + repoValue + '_' + multiSelectDataValue + '"]').attr('checked', 'checked');
				        }
			        }
		        });
	        },
            multiCheckboxCheck : function(e){
                var element= $(e.target),

                repoValue = element.parents('.multiselect').attr('repoValue'),
                isChecked = element.attr('checked'),
                value = element.val(),
                newValuesArray=[];

                if(this.controller.record.data[repoValue]){

                    newValuesArray = require('cgsUtil').cloneObject(this.controller.record.data[repoValue]);

                    //need to remove value from array
                    if(newValuesArray.indexOf(value) > -1 && !isChecked){
                        newValuesArray.splice(newValuesArray.indexOf(value), 1);
                    }
                    //need to add value to array
                    if(newValuesArray.indexOf(value) == -1 && isChecked){
                        newValuesArray.push(value);
                    }

                }else{
                    //need to create a new array with value
                    if(isChecked) {
	                    newValuesArray.push(value);
                    }
                }
	            repo.updateProperty(this.controller.record.id, repoValue, newValuesArray);
            },

            /*
                function to use in the mustache template
             */
            publishDateFormated: function() {
                if (this.controller.record.data.header['publishedToProduction']) {
                    return cgsUtil.dates.formatServerDate(this.controller.record.data.header['publishedToProduction'].$date);
                }
            },

            updateDateFormated: function() {
                if (this.controller.record.data.header['last-modified']) {
                    return cgsUtil.dates.formatServerDate(this.controller.record.data.header['last-modified'].$date);
                }
            },

            getStandardsPackagesUpdate: function f530() {
                standardsModel.getStandardsPackages(_.bind(this.onReceiveStdPackages, this));
            },

            onReceiveStdPackages: function f531(data) {
                var updateCount = 0;

                if (!this.controller) return;

                $("#standards_package_selected tbody").empty();
                _.each(this.controller.record.data.standartsPackages, _.bind(function f532(pkg) {
                    var packageAtServer = _.where(data, {
                        name: pkg.name,
                        subjectArea: pkg.subjectArea
                    });
                    if (packageAtServer.length) {
                        packageAtServer = packageAtServer[0];
                        if (packageAtServer.version != pkg.version) {
                            pkg.update = true;
                            pkg.nextVersion = packageAtServer.version;
                            updateCount++;
                        }
                    }
                    this.addStdPackage(pkg);
                }, this));

                this.setStandardsUpdateCount(updateCount);
                this.$("[rel=tooltip]").tooltip({
                    placement: "right"
                });
            },

            deletePackage: function f533(stdPackage, event) {
                if (courseModel.getDirtyFlag()) {
                    var dialogConfig = {
                        title: "Can't delete standard package",
                        buttons: {
                            cancel: {
                                label: 'OK'
                            }
                        },
                        content: {
                            text: "You must save the course before standard package deletion"
                        },
                        closeOutside: true
                    };
                    dialog.create('simple', dialogConfig);
                    return;
                }
                this.controller.onRemoveStdPackage(stdPackage);
            },
            addStdPackage: function f535(stdPackage) {

                var self = this,
                    stkPkgRow = Mustache.render(i18n._(standardPackageRow), stdPackage),
                    packageId;


                stkPkgRow = $(stkPkgRow).appendTo("#standards_package_selected tbody");
                if (editMode.readOnlyMode) {
                    stkPkgRow.find("button").attr("disabled", "disabled");
                }

                stkPkgRow.find(".removeStdPkg").click(function f536(event) {
                    cgsUtil.unsavedCourseNotification(_.bind(self.deletePackage, self, stdPackage, event));
                });

                stkPkgRow.find(".updateStdPkg").click(function f537(event) {
                    cgsUtil.unsavedCourseNotification(function f538() {
                        stdPackage.nextVersion = $(event.target).attr('nextVersion');
                        (_.bind(self.controller.onUpdateStdPackage, self.controller, stdPackage))();
                    });
                });

                //enabel the 'add standarts' button after adding the first package
                if(!editMode.readOnlyMode && _.keys(this.controller.record.data.standartsPackages).length){
	                this.standardsList && this.standardsList.enableAddStandartButton();
                }
            },

	        setTab: function (tab, page, onRender) {
		        if (tab == null) {
			        tab = 'lessons';
			        this.$el.children('.course-editor').addClass(tab);
		        }

		        if(tab === 'lessons') {
			        var self = this;
			        require('clipboardManager').setFocusItem({
				        id: self.controller.record.id
			        });
		        }

		        this.switchSettingsViewById(tab, page, onRender);
	        },

            checkMaxDepth: function f540(e) {

                if (!this.controller.doMaxDepthCouldChange(e.currentTarget.selectedIndex + 1)) {
                    var maxDepth = parseInt(this.controller.record.data.maxDepth);
                    this.$('#maxDepth').prop('selectedIndex', maxDepth - 1);
                    var dialogConfig = {
                        title: "error",
                        buttons: {
                            cancel: {
                                label: 'OK'
                            }
                        },
                        content: {
                            text: "You have a lesson in a lower Hierarchy content. Please change the content and then you can change the levels of the hierarchy."
                        },
                        closeOutside: true
                    };
                    dialog.create('simple', dialogConfig);
                }

            },

            dialogResponse: function f541() {},


            checkLearningObject: function f543() {

                var arr_lessons = [];
                require("repo").getChildrenByTypeRecursive(this.controller.record.id, "lesson", arr_lessons);

                if ( !! arr_lessons.length) {
                    this.$('#includeLo').addClass('disabled').attr('disabled', 'disabled').unbind('click');
                } else {
                    if (!editMode.readOnlyMode) {
                        this.$('#includeLo').removeClass('disabled').removeAttr('disabled');
                    }
                }

            },

            checkContentLanguageEditable: function f544() {
                var arr_lessons = [];
                arr_lessons = _.union(require('repo').getChildrenRecordsByType(this.controller.record.id, 'lesson'),
                    require('repo').getChildrenRecordsByType(this.controller.record.id, 'toc'));

                if ( !! arr_lessons.length) {
                    this.$('#field_contentLocales').addClass('disabled').attr('disabled', true).attr('cantBeEnabled', true);
                } else {
                    if (!editMode.readOnlyMode) {
                        this.$('#field_contentLocales').removeClass('disabled').removeAttr('disabled').removeAttr('cantBeEnabled');
                    }
                }
            },

            /**
             * method renders the template for the hierarchy levels preview,
             * according to the maxDepth & includeLo parameters form the record in controller
             */
            renderLevelsPreview: function f545() {
                var levels = [],
                    i, maxDepth = parseInt(this.controller.record.data.maxDepth);

                // maxDepthPropagateChanges
                // if (this.checkMaxDepth(maxDepth) !== 0) { return;};

                // init array for mustache according to maxLevel
                for (i = 0; i < maxDepth; i++) {
                    levels.push({
                        'counter': i + 1,
                        'offset': i
                    });
                }


                var label = "";
                if (this.controller.enableBookAlive) {
                    if (this.controller.enableAssessment || this.controller.enableBornDigital) {
                        label = i18n.tran('course.levels.sequence') + '/' + i18n.tran('course.levels.page');
                    } else {
                        label = i18n.tran('course.levels.page')
                    }
                } else {
                    if (this.controller.enableAssessment || this.controller.enableBornDigital) {
                        label = i18n.tran('course.levels.sequence');
                    }
                }

                var LoLevel = this.controller.record.data.includeLo ? maxDepth + 2 : null,
                    mContext = {
                        levels: levels,

                        lessonLevel: function f546() {
                            return maxDepth;
                        },

                        LoLevel: LoLevel !== null ? LoLevel - 1 : undefined,

                        sequenceLevel: function f547() {
                            var sequencelevel;

                            if (LoLevel === null)
                                sequencelevel = maxDepth + 1;
                            else
                                sequencelevel = LoLevel;

                            return sequencelevel;
                        },
                        objectLabel: label
                    };

                this.$('.level_list_preview').html(Mustache.render(LevelsPreviewTemplate, mContext));
            },

            updateCourseCoverImgSrc: function f548(path) {
                this.$('#course_cover').attr('src', path);
            },


           enableImageCropperButton: function(show){
            var $cropperButton = this.$('.course_cover_img #image_cropper_button');
               if (show){
                   $cropperButton.show();
               } else {
                   $cropperButton.hide();
               }
            },

            /**
             * function reRenders the differentiation table in
             * course settings tab
             */
            renderDiffLevels: function f549() {
                var levels = this.controller.record.data.diffLevels;
                $(".diff_levels_list tbody").empty();
                _.each(levels, function f550(value, index) {
                    $(".diff_levels_list tbody").append(Mustache.render(diffLevelRow, value));
                });
            },
            insertCourseReference: function f551(newRef) {
                var ref = _.clone(newRef); // don't change source object

                ref.path = assets.serverPath(ref.path);

                // if this same file already uploaded, do not add it to the list again.
                var same_file_arr = $('#references_list').find('li a').filter(function f552() {
                    return $(this).attr('href') == ref.path
                });
                if (same_file_arr.length == 0) {
                    this.$('#references_list').append(Mustache.render(this.controller.config.course_reference_template, ref));
                }
            },

            deleteCourseReference: function f553(event) {
                var self = this;
                require('cgsUtil').deleteNotification(function(){
                    event.preventDefault();
                    event.stopPropagation();

                    var srcElement = $(event.target);
                    var url = srcElement.closest('li').children('a').attr('href');
                    //remove "filesystem:http://localhost/persistent
                    var deletePath = url.substr(url.indexOf("publishers"));

                    self.controller.deleteReferenceFile(deletePath, function f554() {
                        srcElement.parent().parent().unbind();
                        srcElement.parent().parent().remove();
                    }, srcElement);

                    // clean dom file input, so to enable to upload deleted file again.
                    $('div.course_references input[type="file"]').val(null);
                });

            },

            setAppletsUpdateCount: function f555(count) {
                if (count > 0)
                    $('#applets-updates').show().text(count);
                else
                    $('#applets-updates').hide().text('');
            },
            
            setEbooksInUseUpdateCount: function (count) {
                if (count > 0)
                    $('#ebooks-in-use-updates').show().text(count);
                else
                    $('#ebooks-in-use-updates').hide().text('');
            },

            setStandardsUpdateCount: function f556(count) {
                if (count > 0)
                    $('#standards-updates').show().text(count);
                else
                    $('#standards-updates').hide().text('');
            },

            disableDiffLevels: function() {
                var diffLevels = this.controller.record.data.diffLevels;

                return (!diffLevels || !diffLevels.length) && !!repo.getChildrenByTypeRecursive(this.controller.record.id, 'lesson').length;
            },

            setDiffLevelsButtonState: function() {
                var disable = this.disableDiffLevels();
                this.$('#button_select_diff_levels').attr({
                    'disabled': disable,
                    'cantBeEnabled': disable && disable.toString()
                });
            },
            showDiffLevelComponent: function(){
                //show add assessment id the course dont have a type, of if the course type is not ebook
                //and diff levels is not disabled by feature flags
                return  this.controller.enableDiffLevels && (this.controller.enableAssessment || this.controller.enableBornDigital);
            },

	        dispose: function() {
		        $('#props_base').removeClass('course-props');

		        if(this.metadataComponent) {
			        this.metadataComponent.view.unbind();
			        this.metadataComponent.view.remove();
		        }

		        if (this.customizationPackInstructionComponent) {
			        this.customizationPackInstructionComponent.view.unbind();
			        this.customizationPackInstructionComponent.view.remove();
		        }

		        if (this.customizationPackFeedbackComponent) {
			        this.customizationPackFeedbackComponent.view.unbind();
			        this.customizationPackFeedbackComponent.view.remove();
		        }

		        if (this.customizationPackPlayerInterfaceComponent) {
			        this.customizationPackPlayerInterfaceComponent.view.unbind();
			        this.customizationPackPlayerInterfaceComponent.view.remove();
		        }

		        if (this.customizationPackStylesComponent) {
			        this.customizationPackStylesComponent.view.unbind();
			        this.customizationPackStylesComponent.view.remove();
		        }

		        //dispose standarts
		        if(this.standardsList) {
			        this.standardsList.dispose();
		        }
				events.unregister('customizationPack-done-loading');

		        this._super();
	        }


        }, {
            type: 'CourseEditorView'
        });

        return CourseEditorView;
    });