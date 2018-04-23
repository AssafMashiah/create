define(['mustache', 'propsTextViewer', 'cgsUtil', 'text!components/customizationPackInstructions/templates/instructionsTemplate.html'],
    function(mustache, propsTextViewer, cgsUtil, template) {

        var instructionsView = Backbone.View.extend({

            initialize: function() {
                this.render();
	            cgsUtil.setInputMode(this.$el);
            },

            render: function() {
                this.$el.html(mustache.render(template, this.options.data));
                this.renderInstructionsRows();
            },

            renderInstructionsRows: function() {
                _.each(this.options.data.instructionMarkup, function(data, index) {

                    new propsTextViewer({
                        el: this.$('#props_text_viewer_' + index),
                        idx: index,
                        data: data,
                        propsTextViewersParent: this.$("#instructions_table_body"),
                        onChageCallback: _.bind(function(tveData) {

                            this.options.data.instructionMarkup[index].value = tveData.markup;
                            this.options.onChangeCallback(this.options.controller.modelToData(this.options.data));

                        }, this)
                    });

                }, this);

            },

            dispose: function() {
                this.remove();
            }


        });

        return instructionsView;
    });