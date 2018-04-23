define(['mustache', 'propsTextViewer', 'cgsUtil',
        'text!components/customizationPackFeedbacks/templates/feedbacksTemplate.html',
        'text!components/customizationPackFeedbacks/templates/feedbacksTable.html'
    ],
    function(mustache, propsTextViewer, cgsUtil, template, partialTemplate) {

        var cp_feedbacksView = Backbone.View.extend({

            events: {
                'change #feedbackTypesDropDown': 'changeFeedbackType'
            },

            initialize: function() {
                this.render();
	            cgsUtil.setInputMode(this.$el);
            },

            render: function() {
                this.$el.html(mustache.render(template, this.options.data, {
                    feedbacksTable: partialTemplate
                }));
                this.selectedFeedbackScenario = this.options.data.selectedFeedbackScenario;

                this.renderPropsTextViewers();
            },
            changeFeedbackType: function(changetEvent) {
                var data = this.options.controller.getNewFeedbackTypeData(changetEvent.target.value);
                this.$('#feedbacks_table_body').html(mustache.render(partialTemplate, data));
                this.selectedFeedbackScenario = data.selectedFeedbackScenario;

                this.renderPropsTextViewers();

            },
            renderPropsTextViewers: function() {
                _.each(this.selectedFeedbackScenario, function(data, index) {

                    new propsTextViewer({
                        el: this.$('#props_tve_' + data.value + '_preliminary'),
                        idx: index + ".1",
                        data: {
                            value: this.getStringifyedData(data.preliminary)
                        },
                        displayInlineImage: true,
                        propsTextViewersParent: $("#feedbacks_table_body"),
                        onChageCallback: _.bind(function(tveData) {
                            this.options.data.allData[this.$("#feedbackTypesDropDown").val()][data.value]['preliminary'] = tveData.markup;
                            this.options.onChangeCallback(this.options.controller.modelToData(this.options.data.allData));
                        }, this)
                    });

                    new propsTextViewer({
                        el: this.$('#props_tve_' + data.value + '_final'),
                        idx: index + ".2",
                        data: {
                            value: this.getStringifyedData(data.final)
                        },
                        displayInlineImage: true,
                        propsTextViewersParent: $("#feedbacks_table_body"),
                        onChageCallback: _.bind(function(tveData) {
                            this.options.data.allData[this.$("#feedbackTypesDropDown").val()][data.value]['final'] = tveData.markup;
                            this.options.onChangeCallback(this.options.controller.modelToData(this.options.data.allData));
                        }, this)
                    });

                }, this);

            },

            getStringifyedData: function(data) {
                try {
                    JSON.parse('"' + data + '"');
                    return data;
                } catch (err) {
                    var ans = JSON.stringify(data);
                    return ans.substring(1, ans.length - 1);
                }

            },

            dispose: function() {
                this.remove();
            }

        });

        return cp_feedbacksView;
    });