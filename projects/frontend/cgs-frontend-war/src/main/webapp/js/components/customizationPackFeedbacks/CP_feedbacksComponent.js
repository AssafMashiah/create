define(['backbone', 'components/customizationPackFeedbacks/CP_feedbacksComponentView'],
    function(Backbone, CP_feedbacksComponentView) {


        var CP_feedbacksComponent = Backbone.Router.extend({

            /**
             * initialize
             * @param cfg: parent: $, data: {}, onChangeCallback: fnc()
             */
            initialize: function(cfg) {
                this.data = cfg.data;

                this.view = new CP_feedbacksComponentView({
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

                model.feedbackTypes = _.keys(data);
                model.selectedFeedback = model.feedbackTypes[0];
                model.selectedFeedbackScenario = this.selectedFeedbackScenarioDataToModel(model.selectedFeedback);

                model.allData = data;

                return model;
            },
            selectedFeedbackScenarioDataToModel: function(type) {
                var selectedFeedbackScenario = [];
                _.each(this.data[type], function(value, key) {
                    selectedFeedbackScenario.push({
                        'value': key,
                        'preliminary': value['preliminary'],
                        'final': value['final'],
                        'icon_class': key === "all_correct" ? 'icon_correct' : (key === 'all_incorrect' ? 'icon_incorrect' : 'icon_partially_correct')
                    });

                });
                return selectedFeedbackScenario;
            },
            getNewFeedbackTypeData: function(type) {
                return {
                    'selectedFeedbackScenario': this.selectedFeedbackScenarioDataToModel(type)
                };
            },

            modelToData: function(model) {
                return model;
            }

        });

        return CP_feedbacksComponent;
    });