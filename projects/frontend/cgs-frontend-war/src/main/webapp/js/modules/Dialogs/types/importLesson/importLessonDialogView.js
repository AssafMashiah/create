define(['lodash', 'jquery', 'BaseView', '../../BaseDialogView',
    './importLessonContainer', 'react-dom', 'react', 'events', 'courseModel', 'router', 'connectionManager', 'busyIndicator'],
    function f639(_, $, BaseView, BaseDialogView, importLessonContainer, ReactDOM, React, events,
                  courseModel, router, connectionManager, busy) {

        var importLessonDialogView = BaseDialogView.extend({
            tagName: 'div',
            className: 'css-dialog',
            initialize: function f640(options) {
                this._super(options);
                this.options = options;
            },

            render: function render($parent) {
                this._super($parent);
                var $container = $(".css-dialog");
                this.container = $container[0];
                this.options.returnHandler = this.returnHandler.bind(this);
                ReactDOM.render(React.createElement(importLessonContainer, this.options),
                    this.container);
                this.addHiddenLayer($container);
            },

            addHiddenLayer: function(container) {
                var hiddenNode = document.createElement("div");
                hiddenNode.className = "overlay";
                hiddenNode.style = "display: block";
                container.append(hiddenNode);
            },

            returnHandler: function(status, data) {
                switch (status) {
                    case 'cancel':
                        events.fire("terminateDialog");
                        ReactDOM.unmountComponentAtNode(this.container);
                        break;
                }
            }

        }, {type: 'importLessonDialogView'});

        return importLessonDialogView;

    });