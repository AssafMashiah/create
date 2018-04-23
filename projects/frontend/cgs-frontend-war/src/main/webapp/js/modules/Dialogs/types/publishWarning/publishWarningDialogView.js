define(['lodash','jquery', 'repo', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/publishWarning/publishWarning.html'],
    function(_, $, repo, BaseView, Mustache, events, BaseDialogView, template) {

        var PublishWarningDialogView = BaseDialogView.extend({

            tagName:'div',
            className:'css-dialog-publish-warning',

            initialize: function(options) {

                this.options = options;

                var locks = [];

                _.each( options.config.data.locks , function( lock ){

                    try{
                        if( lock.lockDate && ( lock.entityType == "LESSON" || lock.entityType == "ASSESSMENT" ) ){

                            var name = [], eid = lock.contentId, record;

                            while ((record = repo.get(eid)) && record.type != 'course') {
                                eid = record.parent;
                                name.unshift(record.data.title);
                            }

                            locks.push({
                                userName: lock.userName ,
                                lesson: name.join(' > ') || lock.entityName
                            });

                        }
                    }

                    catch( e ){
                        logger.error(logger.category.PUBLISH, { message: 'Failed to parse lock string', error: e });
                    }

                } );

                options.config.data.locks = locks;

                this.customTemplate = template;
                this._super(options);
            },

            render:function($parent) {
                this._super($parent, this.customTemplate);
                this.resetPosition();
            },

            setReturnValueCallback: {

                proceed: function() {
                    return {
                        response: this.options.config.data
                    }
                }
            }

        }, {type: 'PublishWarningDialogView'});

        return PublishWarningDialogView;

    });