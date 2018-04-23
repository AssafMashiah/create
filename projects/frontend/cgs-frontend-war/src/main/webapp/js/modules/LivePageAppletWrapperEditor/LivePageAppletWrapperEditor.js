define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'appletModel', 'editMode', './config', './LivePageAppletWrapperPropsView', './TaskTemplate'],
    function (LivePageElementEditor, repo, appletModel, editMode, config, LivePageAppletWrapperPropsView, taskTemplate) {

        var LivePageAppletWrapperEditor = LivePageElementEditor.extend({

                initialize: function (configOverrides) {
                    
                    var wrapper = repo.get(configOverrides.id),
                        appletRecord = wrapper && repo.get(wrapper.children[0]);

                    if (appletRecord && appletRecord.data && appletModel.appletManifest) {
                        var applet = _.find(appletModel.appletManifest.applets, function(app) { return app.guid == appletRecord.data.appletId });
                        if (applet) {
                            this.thumbnail = applet.thumbnail;
                        }
                    }

                    this._super(configOverrides);

                    repo.startTransaction({ ignore: true });
                    repo.updateProperty(this.record.id, 'thumbnail', this.thumbnail || this.record.data.thumbnail, false, true);
                    repo.endTransaction();

                    this.appletRepoId = this.record.children[0];
                    this.isEditable = function() {
                        return !editMode.readOnlyMode;
                    };
                    if (!this.config.previewMode) {
                        this.startPropsEditing();
                    }
                },

                registerEvents: function() {
                    var changes = {};

                    _.extend(changes, this.getGlobalEvents());

                    this.model = this.screen.components.props.startEditing(this.record, changes);

                    this.attachGlobalEvents();
                },

                startPropsEditing: function () {
                    this._super(null, LivePageAppletWrapperPropsView);
                    this.registerEvents();
                },
                
                openEditor: function () {
                    if (!editMode.readOnlyMode) {
                        this.router.load(this.appletRepoId);
                    }
                }

            },
            {
                type: 'LivePageAppletWrapperEditor',
                icons: {
                    'icon1': 'media/icons/applet_01.png',
                    'icon2': 'media/icons/applet_02.png',
                },
                template: taskTemplate.template
            });

        return LivePageAppletWrapperEditor;

    });
