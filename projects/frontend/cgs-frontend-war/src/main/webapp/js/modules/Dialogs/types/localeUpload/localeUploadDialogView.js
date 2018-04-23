define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'FileUpload', 'files', 'busyIndicator',
    'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/localeUpload/localeUploadDialog.html'],
    function f648(_, $, BaseView, Mustache, events, FileUpload, files, busy, BaseDialogView, template) {

        var localeUploadDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            events: {
                'keyup #upload-pwd': 'checkPwd',
            },

            initialize: function f649(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f650($parent) {
                this._super($parent, this.customTemplate);

                new FileUpload({
                    activator: "#locale-file",
                    options: {
	                    uploadFileLocalyOnly: true,
                        //new feature to rename file from cws to zip (itreate through the files and execute the callback)
                        rename: function f651(name) {
                            //get the file extension
                            var ext = name.substring(name.lastIndexOf(".") + 1, name.length);

                            if (ext === 'zip') return name; //if we already upload zip so no need to change it
                            else {
                                return name.replace(name.substring(name.lastIndexOf(".") + 1, name.length), 'zip');
                            }
                        }
                    },
                    callback: this.openZip,
                    context: this
                });
            },

            openZip: function(filePath) {

                var path = files.coursePath(require('userModel').getPublisherId(), require('courseModel').getCourseId(), filePath),
                    self = this;

                busy.start();

                logger.audit(logger.category.COURSE, 'New customization pack was uploaded manualy');

                files.loadObject(path, 'blob_hack', function f652(result) {
                    require('localeModel').loadCustomizationPack(result, function() {
                        busy.stop();
                        self.controller.setReturnValue('hasNewPack', 'yes');
                        events.fire('terminateDialog', 'hasNewPack');
                        require('router').load(require('router')._static_data.id, require('router')._static_data.tab);
                    }, true);
                });
            },

            checkPwd: function(e) {
                this.$('#locale-file').attr('disabled', require('cryptojs').SHA1(this.$('#upload-pwd').val()).toString() != '9a9aabb0d1f0515455fe8e8e560f49635309f4cc');
            }

        }, {type: 'localeUploadDialogView'});

return localeUploadDialogView;

});