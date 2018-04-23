define(['lodash', 'jquery', 'BaseView', 'appletModel', 'events', 'dialogs', 'mustache',
    'text!modules/AppletsToolboxComponent/templates/AppletsToolboxRowView.html', 'editMode', 'bootstrap'
  ],
  function (_, $, BaseView, appletModel, events, dialogs, Mustache, template, editMode) {

    var AppletsToolboxRowView = BaseView.extend({
      className: 'item',
      tagName: 'tr',
      parentEl: '#toolbox-list',

      events: {
        'click .toolbox-row__delete': 'removeApplet'
      },
      initialize: function f38(options) {
        this._super(options);

        //Create Bootstrap tooltips
        this.$("[rel=tooltip]").tooltip();

        this.registerEvents();
      },

      registerEvents: function f39() {
      },

      render: function f40() {
        this._super(template);

        $(this.parentEl).append(this.el);
      },

      removeApplet: function () {
        this.controller.removeToolboxApplet(this.obj.guid);
      },
    }, {
      type: 'AppletsToolboxRowView'
    });

    return AppletsToolboxRowView;

  });
