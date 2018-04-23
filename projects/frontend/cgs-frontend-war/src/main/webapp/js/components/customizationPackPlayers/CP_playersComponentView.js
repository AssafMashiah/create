define(['mustache', 'events', 'repo', 'localeModel', 'cgsUtil', 'text!components/customizationPackPlayers/templates/CP_playersTemplate.html'],
    function(mustache, cgsEvents, repo, localeModel, cgsUtil, template) {

        var playersView = Backbone.View.extend({

            events:{
                'click .player-edit' : 'checkFontChanges',
                'click .player-reset' : 'resetDataConfirmation'
            },

            initialize: function() {
                this.render();
	            cgsUtil.setInputMode(this.$el);
            },

            render: function() {
                this.$el.html(mustache.render(template, this.options.data));
            },

            checkFontChanges: function(){
                var self = this,
                type = $(event.target).parents('.playerRow').attr('id'),

                newFonts =require('localeModel').hasFontChanges(),
                
                callbackFunc = function(){
                    self.editPlayer(type);
                };

                if(!_.isEmpty(newFonts)){
                    self.openSaveDialog(newFonts, callbackFunc);
                }else{

                    callbackFunc();
                }

            },
            openSaveDialog: function(unsavedFonts, callback){
                
                var template = "<div>{{unsavedFontMessage1}}</div>{{#fonts}}<ul><li>{{.}}</li></ul>{{/fonts}}<div>{{unsavedFontMessage2}}</div>",
                dataToDisplay = mustache.render(template, {
                    'fonts': _.keys(unsavedFonts),
                    'unsavedFontMessage1': require('translate').tran('course.props_area.tab_design.edit.unsaved_fonts_dialog.message1'),
                    'unsavedFontMessage2': require('translate').tran('course.props_area.tab_design.edit.unsaved_fonts_dialog.message3')
                }),

                dialogConfig = {

                    title: "course.props_area.tab_design.edit.unsaved_fonts_dialog.title",

                    content: {
                        text: dataToDisplay,
                        icon: 'warn'
                    },

                    buttons: {
                        "save": { label: 'course.props_area.tab_design.edit.unsaved_fonts_dialog.button.save' },
                        "continue": { label: 'course.props_area.tab_design.edit.unsaved_fonts_dialog.button.continue' },
                        "cancel": { label: 'course.props_area.tab_design.edit.unsaved_fonts_dialog.button.cancel' }
                    }

                };

                require('events').once('onResponse', function (response) {
                    if(response == 'save'){
                        require("courseModel").saveCourse(callback);
                    }
                    if(response == 'continue'){
                        callback();
                    }

                }, this);

                var dialog = require('dialogs').create('simple', dialogConfig, 'onResponse');
            },
        
            //open edit themeing dialog
            editPlayer: function(type){
                
                var dialogConfig = {

                    title: "Players Design",
                    playerType: type,
                    closeOutside : false,
                    buttons: {
                        yes:        { label: 'Save' },
                        cancel:     { label: 'Close' }
                    }

                };
                cgsEvents.once( 'onThemingEnd' , function( response ) {
                    this.updateLastModified(type);
                    
                }, this );

                require('dialogs').create( 'theming', dialogConfig, 'onThemingEnd' );
            },

            //update the last modified property for the changed player
            updateLastModified : function(playerType){
                var lasModified = repo.get(repo._courseId).data.themingLastModified;
                if(lasModified){
                    lasModified =  lasModified[playerType];
                    this.$('#'+playerType+ " .lastModified").html(lasModified);
                }
            },

            resetDataConfirmation: function(){
                var type = $(event.target).parents('.playerRow').attr('id'),
                
                dialogConfig = {

                    title: "course.props_area.tab_design.players_table.reset.confirmation.popup.title",
                    content: {
                        text: "course.props_area.tab_design.players_table.reset.confirmation.popup.message",
                    },
                    buttons: {
                        yes:        { label: 'Ok' },
                        cancel:     { label: 'Cancel' }
                    }

                };
                cgsEvents.once( 'onResetConfirmation' , function( response ) {
                    if(response == 'yes'){
                        this.resetData(type);
                    }
                    
                }, this );

                require('dialogs').create( 'simple', dialogConfig, 'onResetConfirmation' );

            },

            //reset the player's state to the default values- delete the theming for the current player 
            resetData : function(type){
                var currentTheming =  localeModel.getThemingData() || localeModel.getSavedTheming();
                if(currentTheming && currentTheming[type]){
                    currentTheming[type] = null;
                    localeModel.updateTheming(currentTheming, type , true);
                    this.updateLastModified(type);
                }
            }
        });

        return playersView;
    });