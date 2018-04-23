define(['mustache', 'propsTextViewer', 'cgsUtil',
	    'text!components/customizationPackPlayerInterface/templates/playerInterfaceTemplate.html'],
    function(mustache, propsTextViewer, cgsUtil, template) {

        var customizationPackPlayerInterfaceView = Backbone.View.extend({

            initialize: function() {
                this.render();
	            cgsUtil.setInputMode(this.$el);
            },

            render: function() {
                this.$el.html(mustache.render(template, this.options.data));
                this.renderPlayerInterfaceRows();
            },

            renderPlayerInterfaceRows: function() {
                _.each(this.options.data.playerIntefaceGroup, function(group, groupIndex) {
                    if(group.display){

                        _.each(group.groupItems , function(row, rowIndex){
                            new propsTextViewer({
                                el: this.$('#props_text_viewer_' + row.index),
                                idx: row.index,
                                data: {'value' : this.getStringifyedData(row.value)},
                                plainMode : true,
                                propsTextViewersParent: this.$("#player_interface_table_body"),
                                onChageCallback: _.bind(function(tveData) {
                                    group = _.where(this.options.data.playerIntefaceGroup, {'groupName' : group.groupName});
                                    if(group.length){
                                        group = group[0];
                                        rowItem = _.where(group.groupItems , {'index' : row.index});
                                        if(rowItem.length){
                                            rowItem = rowItem[0];
                                            rowItem.value = tveData.markup;
                                            
                                            this.options.onChangeCallback(this.options.controller.modelToData(this.options.data));

                                        }
                                   }

                                }, this)
                            });
                        },this);
                    }
                },this);

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

        return customizationPackPlayerInterfaceView;
    });