define(['backbone', 'components/customizationPackPlayerInterface/CP_playerInterfaceComponentView'],
    function(Backbone, CP_playerInterfaceComponentView) {


        var CP_playerInterfaceComponent = Backbone.Router.extend({

            /**
             * initialize
             * @param cfg: parent: $, data: {}, onChangeCallback: fnc()
             */
            initialize: function(cfg) {

                this.view = new CP_playerInterfaceComponentView({
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
                model.playerIntefaceGroup = [];

                var strings= _.each(data.split('\n'), function(string, index){
                    var splitedString = string.split('=') ;
                    
                    if(splitedString.length > 1 ){
                        var key = splitedString[0].trim(),
                        display = (splitedString[1] && !!splitedString[1].match(/ ?\{\} ?;?/) ? false : true) && key !=='LanguageUtil.config.direction',
                        groupKey = key.split('.');

                        groupKey = groupKey.splice(0,groupKey.length-1);
                        groupKey = groupKey.join('.');

                        var groupItem = _.where(model.playerIntefaceGroup , {'groupName' : groupKey});
                        if(!groupItem.length){
                            var item = {};
                            item['groupName'] = groupKey;
                            item['groupItems'] = [];
                            item['display'] = display;

                            model.playerIntefaceGroup.push(item);
                        }
                        groupItem = _.where(model.playerIntefaceGroup , {'groupName' : groupKey});
                        if(groupItem.length){
                            groupItem = groupItem[0];
                            var hasIconKey = require('translate').tran(key+"_icons") !== key+"_icons";
                            groupItem.groupItems.push({
                                'key' : key,
                                'value' : splitedString[1].replace( / ?[\"\'](.*)?[\"\'];?[\r\n]*/g , "$1" ),
                                'display' : !splitedString[1].match(/ ?\{\} ?;?/) ,
                                'index' : index,
                                'icon' : hasIconKey ? require('translate').tran(key+"_icons") : "" ,
                                'isTextFont' : groupKey.search('textarea.tooltips') >-1 && hasIconKey
                            });
                        }
                    }
                },this);
                
                return model;
            },

            modelToData: function(model) {
                var data = '';
                _.each(model.playerIntefaceGroup, function(group){
                    _.each(group.groupItems, function(item){
                        if(item.display){
                            data += item.key + " = \"" + item.value + "\";\n";
                            
                        }else{
                            data += item.key + " = " + item.value + "\n";

                        }

                    });
                });
                
                return data;

            }

        });
        return CP_playerInterfaceComponent;
    });