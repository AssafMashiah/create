define(["jquery", "lodash", "mustache"], function ($, _, Mustache) {

    // internals
    var _template = "" +
        "<div class='list_container'>" +
            "<div class='list_title'>{{#title}}<b>{{{title}}}</b> {{/title}}{{{subtitle}}}</div>" +
            "<ul class='list'>" +
                "{{#items}}" +
                "<li>" +
                    "{{{controlBefore.template}}}" +
                    "<span class='item_label'>{{#label}}<b>{{{label}}}</b> {{/label}}{{{description}}}</span>" +
                    "{{{controlAfter.template}}}" +
                "</li>" +
                "{{/items}}" +
            "</ul>" +
        "</div>";



    function _attachEvents(config) {
        _.each(config.items, function (item) {
            if (item.controlBefore) {
                $("#" + item.controlBefore.uid).on(item.controlBefore.eventName, item.controlBefore.callback);
            }
            if (item.controlAfter) {
                $("#" + item.controlAfter.uid).on(item.controlAfter.itemId, item.controlAfter.controlAfter);
            }
        });

    }

    function _generateUniqueIDs(config) {
        _.each(config.items, function (item) {
            if (item.controlBefore) {
                item.controlBefore.template = $(item.controlBefore.template).uniqueId()[0].outerHTML;
                item.controlBefore.uid =   $(item.controlBefore.template).attr("id");
            }
            if (item.controlAfter) {
                $(item.controlAfter.template).uniqueId();
                item.controlAfter.template = $(item.controlAfter.template).uniqueId()[0].outerHTML;
                item.controlAfter.uid =   $(item.controlAfter.template).attr("id");
            }

        });
    }

    /**
     *
     * @param config
     * @param config.label
     * @param config.controlBefore type=GenericControl
     * @param config.itemId
     * @param config.items
     * @param config.controlBefore.eventName
     * @param config.controlBefore.callback
     * @param config.controlAfter
     *
     * @constructor
     */
    function GenericList(config) {
        if (!(config.itemId instanceof $)) {
            config.itemId = $(config.itemId);
        }
        _generateUniqueIDs(config)
        if (!config.subtitle) config.subtitle = "";
        if (!config.description) config.description = "";
        config.itemId.html(Mustache.render(_template, config));
        _attachEvents(config)
    }

    GenericList.prototype = {

    };

    return GenericList;
});
