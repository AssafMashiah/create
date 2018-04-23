define(["jquery", "lodash", "repo", "mustache"], function ($, _, repo, Mustache) {

    // internals
    var _checkbox = "<input type='checkbox' id='{{id}}' class='{{classes}}' {{{attrs}}}>",
        _div = "<div id='{{id}}' class='{{classes}}' {{{attrs}}}></div>",
        _button = "<button id='{{id}}' class='{{classes}}' {{{attrs}}}>(({{text}}))</button>",
        _span = "<span id='{{id}}' class='{{classes}}' {{{attrs}}}>{{text}}</span>";

    function _getControl(control, controlId, controlClasses, controlAttrs, controlText) {
        return Mustache.render(control, {id: controlId, classes: controlClasses, attrs: controlAttrs, text:controlText});
    }

    /**
     *
     * @param config
     *
     *
     * @constructor
     */
    function HTMLControlFactory() {

    }

    HTMLControlFactory.prototype = {
        checkbox: function (id, classes, attrs) {
            return _getControl(_checkbox, id, classes, attrs);
        },
        div: function (id, classes, attrs) {
            return _getControl(_div, id, classes, attrs);
        },
        button: function (id, classes, attrs, text) {
            return _getControl(_button, id, classes, attrs, text);
        },
        span: function (id, classes, attrs, text) {
            return _getControl(_span, id, classes, attrs, text);
        }
    };

    return new HTMLControlFactory();
});
