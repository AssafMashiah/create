define(['mustache', 'events', 'dialogs', 'repo'],
    function (mustache, events, dialogs, repo) {

        var CustomCourseMetadataUtil = function () {

        };

        // Check if required metadata is missing and if so show warning dialog
        // Return promise of when the user closes the dialog if there empty required metadata fields, or an empty object if not
        CustomCourseMetadataUtil.prototype.checkRequiredMetadataMissing = function (courseOrLessonId) {
            var customMetadataFields = repo.get(courseOrLessonId).data.customMetadataFields;
            var missingRequiredMetadataFields = [];
            var onDialogClosePromise = {};

            // Get all required custom metadata fields that are empty
            _.each(customMetadataFields, function (customMetadataField) {
                if (customMetadataField.required && customMetadataField.courseValue === undefined) {
                    missingRequiredMetadataFields.push(customMetadataField.name);
                }
            });

            // Show the required metadata fields in a warning dialog
            if (missingRequiredMetadataFields.length) {
                // This promise is used to know when to run onLockReceivedForSave()
                // It will be resolved when the dialog is closed
                onDialogClosePromise = $.Deferred();

                // Prepare dialog text
                var html = '\
                        <h5>{{header}}</h5>\
                        {{#missingRequiredMetadataFields}}\
                        <br>\
                        {{.}}\
                        {{/missingRequiredMetadataFields}}';
                html = mustache.render(html, {
                    header: require('translate').tran('save.requiredMetadataMissing.warningDialog.text'),
                    missingRequiredMetadataFields: missingRequiredMetadataFields
                });

                // Create dialog text
                var dialogConfig = {
                    title: "save.requiredMetadataMissing.warningDialog.title",
                    content: {
                        text: html
                    },
                    buttons:{
                        'ok':{ label:'OK', value: true }
                    }
                };

                events.once('onDialogClose', function () {
                    onDialogClosePromise.resolve();
                });

                dialogs.create('simple', dialogConfig, 'onDialogClose');
            };

            return onDialogClosePromise;
        };

        return new CustomCourseMetadataUtil;

    });