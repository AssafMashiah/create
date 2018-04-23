define(['lodash', 'BaseController', 'repo', 'toolboxModel', 'courseModel', 'files',
    './AppletsToolboxComponentView', './AppletsToolboxRowView', './config', 'busyIndicator'
  ],
  function (_, BaseController, repo, toolboxModel, courseModel, files,
    AppletsToolboxComponentView, AppletsToolboxRowView, config, busy) {

    var AppletsToolboxComponent = BaseController.extend({
      subViews: {},

      initialize: function (configOverrides) {
        this.subViews = {}; //TEMP workaround because subview weren't cleared.

        this._super(config, configOverrides);
        this.view = new AppletsToolboxComponentView({
          controller: this
        });

        this.registerEvents();
        this.refreshTable();
      },

      refreshTable: function () {
        var courseId = courseModel.getCourseId();
        var course = repo.get(courseId);

        var toolboxWidgets = [];

        if (course && course.data) {
          toolboxWidgets = course.data.toolboxWidgets || [];
        }

        this.updateTableRows(toolboxWidgets);
      },

      registerEvents: function () {
        this.bindEvents({
          'courseToolboxUpdated': {
            'type': 'register',
            'func': this.refreshTable,
            'ctx': this,
            'unbind': 'dispose'
          },
        });
      },

      dispose: function f35() {
        _.invoke(this.subViews, 'dispose');

        this._super();

        delete this.subViews;
      },

      updateTableRows: function f36(applets) {
        if (!this.view) return;

        if (!applets) {
          applets = [];
        }

        this.view.clearApplets();

        _.invoke(this.subViews, 'dispose');

        this.subViews = {};

        _.chain(applets)
          .sortBy(function (applet) {
            return applet.name;
          })
          .each(function f37(applet) {
            this.subViews[applet.id] = new AppletsToolboxRowView({
              controller: this,
              obj: applet
            });
          }, this);

          if (!applets.length) {
            this.subViews['empty-row'] = new AppletsToolboxRowView({
              controller: this,
              obj: {
                emptyRow: true,
              },
            });
          }
      },

      showWidgetsDialog: function () {
        toolboxModel.showToolboxDialog({
          excludeAlreadySelected: true,
        });
      },

      removeToolboxApplet: function (appletId) {
        toolboxModel.removeToolboxApplet(appletId);
      },
    }, {
      type: 'AppletsToolboxComponent'
    });

    return AppletsToolboxComponent;

  });
