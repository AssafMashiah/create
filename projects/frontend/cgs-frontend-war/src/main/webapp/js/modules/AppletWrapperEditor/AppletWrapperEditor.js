define(['BaseContentEditor', 'repo', 'events', 'appletModel', 'editMode', './config', './AppletWrapperPropsView', './AppletWrapperSmallStageView', './AppletWrapperStageView', './TaskTemplate'],
    function f45(BaseContentEditor, repo, events, appletModel, editMode, config, AppletWrapperPropsView, AppletWrapperSmallStageView, AppletWrapperStageView, taskTemplate) {

        var AppletWrapperEditor = BaseContentEditor.extend({

                initialize: function f46(configOverrides) {
                    this.setStageViews({
                        small: AppletWrapperSmallStageView,
                        normal: AppletWrapperStageView
                    });

                    var wrapper = repo.get(configOverrides.id),
                        appletRecord = wrapper && repo.get(wrapper.children[0]);

                    if (appletRecord && appletRecord.data && appletModel.appletManifest) {
                        var applet = _.find(appletModel.appletManifest.applets, function(app) { return app.guid == appletRecord.data.appletId });
                        if (applet) {
                            this.thumbnail = applet.thumbnail;
                        }
                    }

                    this._super(config, configOverrides);

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
                    this.checkAppletCustomDataRecieved();
                },
                checkAppletCustomDataRecieved: function(){
                    var applet = repo.get(this.appletRepoId);
                    if(applet){
                        if(applet.data.customData && events.exists("appletCustomData")){
                            events.fire("appletCustomData", {"appletWrapperId" : this.record.id, "customData": applet.data.customData});
                            repo.deleteProperty(this.appletRepoId, "customData" , false, true );
                        }
                    }

                },

                startPropsEditing: function f47() {
                    this._super();
                    this.view = new AppletWrapperPropsView({controller: this});
                },
                startEditing: function f48(event) {
                    if (!editMode.readOnlyMode) {
                        if (!event || event.toElement.tagName === 'IMG') { // when clicking on the applet image, open the applet for editing.
                            this.router.load(this.appletRepoId);
                        } else if (event && event.toElement.tagName === 'DIV') { // when clicking on the applet's blank area, we want the clipboard to be enabled.
                            this._super(event);
                        }
                    }
                }

            },
            {
                type: 'AppletWrapperEditor',
                template: taskTemplate.template
            });

        return AppletWrapperEditor;

    });
