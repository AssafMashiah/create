define(["require", "jquery", "mustache", "lodash", "text!conversion/templates/imageViewer.xml"],
    function(require, $, mustache, _, imageViewerTemplate) {
        function alignTextViewerData() {

        }

        alignTextViewerData.prototype = {

            alignData: function(data, json) {
                this.jsonArr = json;

                if (!data.title) return "";

                //data.title = data.title.replace(new RegExp("&nbsp;(?!</nbsp>)", "g"), ' ');

                // Next `if` statement used to be like this: !~data.title.indexOf( '<div' ) && ( data.title = "<div class='normal'>" + data.title + "</div>" );
                // Don't do this. Don't be like this.
                if (data.title.indexOf('<div') === -1) {
                  data.title = "<div class='normal'>" + data.title + "</div>"
                }

                var markup, inlineObject, toReplace, mathfieldCount = 0,
                    componentsCount = 0;
                var wrapedTextViewerMarkup = $("<wrapper>" + data.title + "</wrapper>");

                wrapedTextViewerMarkup.find(".actionsGroup").remove();
                wrapedTextViewerMarkup.find("narration").each(function () {
                    $(this).contents().unwrap();
                });

                //replace mathfield
                _.each($(wrapedTextViewerMarkup).find('mathfield'), function(mathfieldTag) {
                    params = {
                        markup: data.mathfieldArray[$(mathfieldTag).attr('id')].markup,
                        maxHeight: data.mathfieldArray[$(mathfieldTag).attr('id')].maxHeight,
                        widthEM: data.mathfieldArray[$(mathfieldTag).attr('id')].widthEM
                    };
                    mathfieldrendredTag = mustache.render(
                        '<mathField widthEM="{{widthEM}}" editMode="off" italicVariables="true" validate="false" autoComma="false" maxHeight="{{maxHeight}}">{{{markup}}}</mathField>', params);
                    $(mathfieldTag).replaceWith($(mathfieldrendredTag));
                    mathfieldCount++;
                });

                //replace inline components- types: 'inlineImage', 'inlineSound', 'inlineNarrtion'
                _.each($(wrapedTextViewerMarkup).find('component'), function(inlineComponent) {
                    inlineObject = this.jsonArr[inlineComponent.id];

                    switch (inlineObject.type) {
                        case 'inlineNarration':
                            inlineObject.data.narrations = escape(JSON.stringify(inlineObject.data.narrations));

                            inlineTemplate = "<{{type}} src='{{data.narrations}}' {{#data.naturalWidth}}originalWidth={{data.naturalWidth}}{{/data.naturalWidth}} {{#data.naturalHeight}}originalHeight={{data.naturalHeight}}{{/data.naturalHeight}} ></{{type}}>";
                            break;

                        case 'MathML':
                        case 'latex':

                            inlineTemplate = "<mathObject imgSrc='{{data.component_src}}' {{#data.naturalWidth}}originalWidth={{data.naturalWidth}}{{/data.naturalWidth}} {{#data.naturalHeight}}originalHeight={{data.naturalHeight}}{{/data.naturalHeight}} type='{{type}}'>{{#data.markup}}{{{data.markup}}}{{/data.markup}}</mathObject>";
                            break;

                        default:
                            inlineTemplate = "<{{type}} src='{{data.component_src}}' {{#data.naturalWidth}}originalWidth={{data.naturalWidth}}{{/data.naturalWidth}} {{#data.naturalHeight}}originalHeight={{data.naturalHeight}}{{/data.naturalHeight}} ></{{type}}>"
                            break;

                    }

                    toReplace = mustache.render(inlineTemplate, inlineObject)
                    $(inlineComponent).replaceWith($(toReplace));
                    componentsCount++;

                }, this);

                //general narration
                if (data.narrationType == "1") {
                    var narrations;

                    if (data.has_multinarration) {
                        narrations = _.extend({}, data.multiNarrations, _.isObject(data.narration) ? data.narration : {});

                        _.each(narrations, function(item, key) {
                            if (!item) {
                                delete narrations[key];
                            }
                        });

                        narrations = escape(JSON.stringify(narrations));
                    } else {
                        narrations = escape(JSON.stringify(data.narration));
                    }

                    $(wrapedTextViewerMarkup).append($('<textViewerNarration multiLanguage="' + !! data.has_multinarration + '" src="' + narrations + '" />'));
                    componentsCount++;
                }

                _.each($(wrapedTextViewerMarkup).find('a'), function(inlineElement) {

                    var inlineObject = this.jsonArr[inlineElement.id];
                    if (inlineObject) {
                        if (inlineObject.type == 'infoBaloon' && inlineObject.children.length == 1) {
                            var xmlMarkup = "",
                                child = this.jsonArr[inlineObject.children[0]];

                            switch (child.type) {
                                case 'imageViewer':
                                    var imageHtml = require('json2xml').convert(this.jsonArr, child.id);
                                    xmlMarkup = $("<div>").text(imageHtml).html();
                                    xmlMarkup = xmlMarkup.replace(/&amp;#x2F;/g, "/").replace(/"/g, "");
                                    break;
                                case 'soundButton':
                                    xmlMarkup = "&lt;mediaPlayer autoplay=false src=" + child.data.sound + " type=soundButton height=47 width=70 &gt; &lt;/mediaPlayer&gt;";
                                    break;
                                case 'textViewer':
                                    var text = _.map($(child.data.title), function(el) {
                                        return $(el).html()
                                    }).join('&lt;br&gt;');
                                    xmlMarkup = "&lt;textViewer&gt;" + text.replace(/"/g, "&quot;") + " &lt;/textViewer&gt;";
                                    break;
                            }

                            //need to replace the a to real markup - wrap the result with current viewer
                            $(inlineElement).replaceWith('<balloontip  id="' + child.id + '" markup="' + xmlMarkup + '">' + inlineElement.innerHTML + '</balloontip>');
                            componentsCount++;
                        }
                        else if (inlineObject.type == 'hyperlink') {
                            $(inlineElement).replaceWith('<hyperlink link="' + encodeURI(inlineObject.data.url) + '">' + inlineElement.innerHTML + '</balloontip>');
                            componentsCount++;
                        }
                    }

                }, this);

                if ($(wrapedTextViewerMarkup).find('div').length > 1) {
                    $(wrapedTextViewerMarkup).find('div').removeClass('cgs');
                }
                $(wrapedTextViewerMarkup).find('div').each(function () {
                    if (!$(this).contents().length) {
                        $(this).append("<br />");
                    }

                    $(this).replaceWith($("<span/>").attr({
                        'class': data.styleOverride || $(this).attr('customStyle') || $(this).attr('class')
                    }).html($(this).html()));
                });

                $(wrapedTextViewerMarkup).find('inlineNarration').each(function() {
                    if ($(this).prev().length > 0 && $(this).prev()[0].tagName == 'SPAN') {
                        $(this).prev().append($(this));
                    }
                });

                data.title = $(wrapedTextViewerMarkup).html();
                //in definition, mtq subanswer and bank items,  if the text viewer data contains only a mathfield component,
                //the conversion to dl will convert it to a mathfield witout text viewer wrap
                if (((["definition", "mtqsubanswer", "clozebanksubitem"]).indexOf(json[data.parent].type.toLowerCase()) > -1) &&
                    ($(wrapedTextViewerMarkup).text().trim() == "") && (mathfieldCount == 1) && (componentsCount == 0)) {
                    data.title = $(wrapedTextViewerMarkup).find('mathField').get(0).outerHTML;
                    data.isMathfieldOnly = true;
                }

                return data;
            }
        };

        return new alignTextViewerData();
    });
