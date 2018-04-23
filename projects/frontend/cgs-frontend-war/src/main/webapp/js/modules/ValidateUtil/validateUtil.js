define(['mustache', 'events', 'dialogs', 'repo', 'userModel', 'cgsUtil', 'translate',
        'text!modules/ValidateUtil/templates/validationWarningTemplate.html'],
    function (mustache, events, dialogs, repo, userModel, cgsUtil, i18n, validationWarningTemplate) {

        // This is a validation service that checks its validation types (see below)
        // Each validationType object must implement the methods enable(), course(), lesson()
        var ValidationStates = {
            APPROVED: "APPROVED",
            CANCELLED: "CANCELLED"
        };

        var ValidateUtil = {
            // entityParams = {id, type}
            validate: function (entityParams) {
                var emptyRequiredFields = [];
                _.each(this.validationTypes, function (validationType) {
                    if (validationType.enable()) {
                        emptyRequiredFields.push.apply(emptyRequiredFields, validationType[entityParams.type](entityParams));
                    }
                }.bind(this));

                // Show warning dialog if there are empty required fields
                var onDialogClosePromise = ValidationStates.APPROVED;

                if (emptyRequiredFields.length) {
                    onDialogClosePromise = this.showWarningDialog(emptyRequiredFields, entityParams);
                }

                // Return a promise that will be resolved when the warning dialogs is closed
                return onDialogClosePromise;
            },

            showWarningDialog: function (emptyRequiredFields, entityParams) {
                // Show required fields in a warning dialog

                // Rearrange fields for mustache
                var fieldsByTab = _.map(_.groupBy(emptyRequiredFields, 'tab'), function (fields, tab) {
                    return {
                        tab: tab,
                        fields: fields
                    };
                });

                // This promise will be resolved when the dialog is closed
                var onDialogClosePromise = $.Deferred();

                // Prepare dialog text
                var html = mustache.render(validationWarningTemplate, {
                    header: require('translate').tran('validate.emptyRequiredFields.warningDialog.text'),
                    fieldsByTab: fieldsByTab
                });

                // Create dialog text
                var dialogConfig = {
                    title: "validate.emptyRequiredFields.warningDialog.title." + entityParams.type,
                    html: html,
                    buttons: {
                        'ok': {
                            label: i18n.tran('validate.emptyRequiredFields.warningDialog.continueSave'),
                            value: ValidationStates.APPROVED
                        },
                        'cancel': {
                            label: i18n.tran('Cancel'),
                            value: ValidationStates.CANCELLED
                        }
                    }
                };

                events.once('onDialogClose', function (dialogReturnValue, dialogButtonClicked) {
                    onDialogClosePromise.resolve(dialogReturnValue);
                });

                dialogs.create('html', dialogConfig, 'onDialogClose');

                return onDialogClosePromise;
            },

            validationTypes: {
                // each validationType object must have the methods enable(), course(), lesson()
                general: {
                    // returns whether to enable validation or not
                    enable: function () {
                        return false;
                    },

                    // Perform validation on course
                    course: function (entityParams) {

                    },

                    // Perform validation on lesson
                    lesson: function (entityParams) {

                    }
                },
                scormTaltal: {
                    // returns whether to enable validation or not
                    enable: function () {
                        // Return true only if there is scorm taltal custom metadata package and course has enabled scorm taltal validation

                        var enable = false;

                        this.scormTaltalPackages = _.indexBy(_.filter(userModel.account.customMetadataPackages, {type: 'scormTaltal'}), 'target');
                        if (this.scormTaltalPackages.course) {
                            var customMetadataFields = repo.get(repo._courseId).data.customMetadataFields;
                            var enablePackageFieldsValidation = _.find(customMetadataFields, {id: 'enablePackageFieldsValidation'});
                            if (enablePackageFieldsValidation && enablePackageFieldsValidation.courseValue === true) {
                                enable = true;
                            }
                        }

                        return enable;
                    },

                    // Returns course empty required fields
                    course: function (entityParams) {
                        return this.checkEmptyRequiredFields(entityParams);
                    },

                    // Perform validation on lesson
                    lesson: function (entityParams) {
                        return this.checkEmptyRequiredFields(entityParams);
                    },

                    checkEmptyRequiredFields: function (entityParams) {
                        var courseEmptyRequiredFields = [];

                        courseEmptyRequiredFields.push.apply(courseEmptyRequiredFields, this.checkRequiredTargetFields(entityParams));
                        courseEmptyRequiredFields.push.apply(courseEmptyRequiredFields, this.checkEmptyRequiredMetadata(entityParams));

                        return courseEmptyRequiredFields;
                    },

                    // Check if required metadata is missing and if so show warning dialog
                    // Return promise of when the user closes the dialog if there empty required metadata fields, or an empty object if not
                    checkEmptyRequiredMetadata: function (entityParams) {
                        var missingRequiredMetadataFields = [];

                        // Merge scorm taltal package with filled course fields and see if there's a required field with empty 'courseValue'.
                        var customMetadataFields = cgsUtil.mergeByKey({
                            'target': repo.get(entityParams.id).data.customMetadataFields,
                            'source': this.scormTaltalPackages[entityParams.type].customMetadata,
                            'key': 'id',
                            'propertyToKeep': 'courseValue'
                        });

                        // Get all required custom metadata fields that are empty
                        _.each(customMetadataFields, function (customMetadataField) {
                            if (customMetadataField.required && !_.isBoolean(customMetadataField.courseValue) &&
                                _.isEmpty(customMetadataField.courseValue)) {

                                missingRequiredMetadataFields.push({
                                    name: customMetadataField.name,
                                    tab: 'Metadata'
                                });
                            }
                        });

                        return missingRequiredMetadataFields;
                    },

                    checkRequiredTargetFields: function (entityParams) {
                        var emptyRequiredTargetFields = [];
                        if (this.scormTaltalPackages && this.scormTaltalPackages[entityParams.type]) {
                                _.each(this.scormTaltalPackages[entityParams.type].requiredTargetFields, function (field) {
                                    if (_.isEmpty(repo.get(entityParams.id).data[field.repoKey])) {
                                        emptyRequiredTargetFields.push(field);
                                    }
                                });
                        }
                        return emptyRequiredTargetFields;
                    }

                }
            }
        };

        return _.extend(ValidateUtil, {
            ValidationStates: ValidationStates
        });

    });