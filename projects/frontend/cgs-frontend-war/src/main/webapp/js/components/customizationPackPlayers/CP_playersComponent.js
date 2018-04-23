define(['backbone', 'repo', 'components/customizationPackPlayers/CP_playersComponentView'],
    function(Backbone, repo, CP_playersComponentView) {


        var CP_playersComponent = Backbone.Router.extend({

            /**
             * initialize
             * @param cfg: parent: $, data: {}, onChangeCallback: fnc()
             */
            initialize: function(cfg) {
                this.model = this.dataToModel(cfg.data);
                this.onChangeCallback = cfg.onChangeCallback;

                this.view = new CP_playersComponentView({
                    el: cfg.parent,
                    data: this.model,
                    controller: this
                });

            },
            dataToModel : function(data){
                var model = {};
                model.players = [];

                model.players = _.map(data, function(value, key){
                    //get last modified for the current player
                    var lastModified = require('translate').tran('course.props_area.tab_design.players_table.lastModified.defaultValue'),
                    themingInCourse = repo.get(repo._courseId).data.themingLastModified;
                    if(themingInCourse){
                        lastModified = themingInCourse[key];
                    }

                    return {
                        'id': key,
                        'lastModified' : lastModified
                    };
                });
                return model;
            }

        });
        return CP_playersComponent;
    });