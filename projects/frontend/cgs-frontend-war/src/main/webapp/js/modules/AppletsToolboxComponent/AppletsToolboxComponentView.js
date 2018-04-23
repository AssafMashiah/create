define(['jquery', 'BaseView',
    'text!modules/AppletsToolboxComponent/templates/AppletsToolboxComponentView.html'
  ],
  function ($, BaseView, template) {
    var AppletsToolboxComponentView = BaseView.extend({
      el: '#applets-toolbox',
      clearOnRender: false,
      _placeholder_removed: false,

      events: {
        'click #add-applet-to-toolbox': 'showWidgetsDialog'
      },

      initialize: function (options) {
        this._super(options);
      },

      render: function () {
        this._super(template);
      },

      clearApplets: function () {
        $('#toolbox-list').empty();
      },

      showWidgetsDialog: function() {
        this.controller.showWidgetsDialog();
      },
    }, {
      type: 'AppletsToolboxComponentView'
    });

    return AppletsToolboxComponentView;

  });
