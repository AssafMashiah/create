define(['jquery', 'mustache', 'BasePropertiesView', 'text!modules/TextViewerEditor/templates/TextViewerProps.html', 'repo'],
    function f1138($, Mustache, BasePropertiesView, template, repo) {


        var TextViewerPropsView = BasePropertiesView.extend({

            initialize: function f1139(options) {
                this.template = template;
                this._super(options);

                this.defaultNarrationTypes = [
                    {"name": "None", "value": ""},
                    {"name": "General", "value": "1"}
                ];


            },

            initNarrationTypes: function f1140() {
                var types = this.controller.record.data.availbleNarrationTypes;
                if(!types){

                    types = this.defaultNarrationTypes;
                
                    //instruction inside questionOnly is disable PerParagraph narration type
                    var instruction = repo.getAncestorRecordByType(this.controller.record.id,"instruction");
                    var questionOnly = repo.getAncestorRecordByType(this.controller.record.id,"questionOnly");
                    var mtqArea = repo.getAncestorRecordByType(this.controller.record.id,"mtqArea");
                    var linkingArea = repo.getAncestorRecordByType(this.controller.record.id,"linking_area");

                    if (!(instruction && questionOnly) && !mtqArea && !linkingArea) {
                        types.push({"name": "Per Paragraph" , "value": "2"});
                    }
                }

                _.each(types, function f1141(item) {
                    var mustached = Mustache.render('<option value="{{value}}">(({{name}}))</option>', item);
                    $("#narration_type").append(mustached);
                });
            }

        }, {type: 'TextViewerPropsView'});

        return TextViewerPropsView;

    });
