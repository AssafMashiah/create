define(['backbone', 'components/customizationPackInstructions/CP_instructionsComponentView'],
    function(Backbone, CP_instructionsComponentView) {


        var CP_instructionsComponent = Backbone.Router.extend({

            /**
             * initialize
             * @param cfg: parent: $, data: {}, onChangeCallback: fnc()
             */
            initialize: function(cfg) {

                this.view = new CP_instructionsComponentView({
                    el: cfg.parent,
                    data: this.dataToModel(cfg.data),
                    onChangeCallback: cfg.onChangeCallback,
                    controller: this
                });

                this.dataToModel(cfg.data);
            },
            
            refresh: function (data) {
                this.view.options.data = this.dataToModel(data);
                this.view.render();
                this.view.delegateEvents();
            },

            dataToModel: function(data) {
                var model = {};
                model.instructionMarkup = [];
                _.each(data, function(value, key) {
                    model.instructionMarkup.push({
                        instructionKey: key,
                        value: value,
                        index: model.instructionMarkup.length
                    });
                }, this);
                return model;
            },

            modelToData: function(model) {
                var data = {
                    markup: {},
                };

                _.each(model.instructionMarkup, function(modelInstructionItem) {
                    data.markup[modelInstructionItem.instructionKey] = modelInstructionItem.value;
                });
                return data;

            }

        });
        return CP_instructionsComponent;
    });