define(['backbone', 'components/customizationPackStylesAndEffects/cp_stylesAndEffectsView', 'translate'],
    function(Backbone, CP_stylesAndEffectsComponentView, translate) {


        var CP_stylesAndEffectsComponent = Backbone.Router.extend({

            /**
             * initialize
             * @param cfg: parent: $, data: {}, onChangeCallback: fnc()
             */
            initialize: function(cfg) {

                this.view = new CP_stylesAndEffectsComponentView({
                    el: cfg.parent,
                    data: this.dataToModel(cfg.data),
                    controller: this
                });
            },
            dataToModel : function(data){
                var groupData = _.groupBy(data.model, function(item){return !!item.isSystem; });
                var titleTranslationKey = {
                    'default_styles' : 'course.props_area.tab_design.styles_editor.default_styles',
                    'default_effects' : 'course.props_area.tab_design.effects_editor.default_effects',
                    'publisher_styles' : 'course.props_area.tab_design.styles_editor.publisher_styles',
                    'publisher_effects' : 'course.props_area.tab_design.effects_editor.publisher_effects'
                };

                data.model = [];
                data.model[0] = {
                    'isDefault' : true,
                    'title' : require('translate').tran(titleTranslationKey['default_'+(data.isStyle?'styles' : 'effects')]),
                    'data' : groupData[true],
                    'hasData' : groupData[true] && groupData[true].length
                };
                data.model[1] = {
                    'isDefault' : false,
                    'title' : require('translate').tran(titleTranslationKey['publisher_'+(data.isStyle?'styles' : 'effects')]),
                    'data' : groupData[false],
                    'hasData' : groupData[false] && groupData[false].length
                };

                return data;

            }
        });
        return CP_stylesAndEffectsComponent;
    });