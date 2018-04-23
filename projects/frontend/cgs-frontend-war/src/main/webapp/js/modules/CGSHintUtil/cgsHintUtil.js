define( [ "jquery" , "lodash" , "events" , "userModel" , "modules/CGSHintUtil/CGSHintView" , "modules/CGSHintUtil/CGSHintToggleView" , "modules/CGSHintUtil/CGSHintWrapper" , "restDictionary" , "dao" ] ,

    function( $ , _ , events , userModel , CGSHintView , CGSHintToggleView , CGSHintWrapper , restDictionary , dao ){

        var cgsHintUtil = function(){

        };

        cgsHintUtil.prototype = {
            onInitializeStart: function () {
                this.account = userModel.getAccount();

                if (this.account.enableCoachMarks) {                
                    // Create a wrapper to hold all the hints
                    this.createHintsWrapper();

                    // Create the toggleMode button
                    this.createHintToggle();
                }

                this.registerEvents();

                this.hintsStack = {};
            },
            onInitializeEnd : function() {
                if (!this.account.enableCoachMarks) return;
                
                if (_.size(this.hintsStack) > 0) {
                    this.dispose();
                }
                
                if ( this.getShowMode() == 'hideAll') return this.toggleView.hideAll();

                this.editor = require( "router" ).activeScreen.editor;
                this.activeScreen = require( "router" ).activeScreen;


                // Get current editor's config
                this.config = this.editor && this.editor.config && this.editor.config.cgsHints;

                if (this.activeScreen.config && this.activeScreen.config.cgsHints) {
                    this.config = _.union(this.config, this.activeScreen.config.cgsHints);
                }

                

                this.config = _.filter(this.config, function (item) {
                    var el = $(item.selector),
                    isEditMode = require('editMode').readOnlyMode,
                    selectorIsDisabled = el.is(':disabled') || el.hasClass('disabled') || el.attr('disabled');

                    return el.length &&//element exists and meets one of the folowing conditions
                            ((isEditMode && item.displayInEditMode)||// display hint when course/lesson is locked
                             (!isEditMode && !selectorIsDisabled)||// display hint when not edit mode and selector is not disabled
                             (!isEditMode && item.displayWhenSelectorDisabled)//display hint when not edit mode and selector is disabled
                            );
                });

                if (!this.config || !this.config.length) {
                    this.toggleView && this.toggleView.setDisabled();
                    return false;
                } else {
                    this.toggleView && this.toggleView.setEnabled();
                }

                _.each( this.config , function( data ){

                    data.id = 'cgs_hint_' + (+new Date()) + "_" + Math.ceil(Math.random() * 1000)

                    this.hintsStack[ data.id ] = new CGSHintView({
                        data: data,
                        $parent: this.wrapper.$el
                    } );

                }.bind( this ) );

                this.align();

            } ,
            registerEvents: function(){
                events.register( "cgs-hints-align", this.align.bind(this) );
                events.register( "init-cgs-hints", this.onInitializeEnd.bind(this) );
                events.register( "dispose-cgs-hints", this.dispose.bind(this) );
            },

            getShowMode: function(){
                this.showMode = userModel.user.customization ? userModel.user.customization.cgsHintsShowMode || "showAll" : "showAll";
                return this.showMode;
            },


            createHintsWrapper : function(){

                this.wrapper = new CGSHintWrapper( {
                    $parent : $( "body" )
                } );

            } ,
            createHintToggle : function(){

                this.toggleView = new CGSHintToggleView({
                    controller : this ,
                    $parent : $( "body" )
                });

            } ,

            dispose : function(){

                // Each view disposes itself
                _.each( this.hintsStack , function( hint ){

                    hint.dispose && hint.dispose();

                } );

                this.hintsStack = {};

                // If hints still found in wrapper - something went wrong in their disposal
                if (this.wrapper) {
                    if( this.wrapper.$el.children().length ){
                        logger.warn(logger.category.GENERAL, 'Hints utility: Children found after dispose process');
                    }
                    this.wrapper.empty();
                }

            } ,

            align : function(){

                if (this.showMode == 'hideAll') return;

                // Each HintView aligns itself
                _.each( this.hintsStack , function( hint ){

                    hint.align();

                } );

            } ,

            showAll : function(){

                var sendToServer = this.showMode != "showAll";

                this.showMode = "showAll";
                userModel.user.customization.cgsHintsShowMode = this.showMode;

                this.wrapper.show();

                this.onInitializeEnd();

                // Save hints show mode to DB
                if (sendToServer) {
                    this.saveMode();
                }

            } ,

            hideAll : function(){

                var sendToServer = this.showMode != "hideAll";

                this.showMode = "hideAll";
                userModel.user.customization.cgsHintsShowMode = this.showMode;

                this.wrapper.hide();

                // Since on showAll the hints are initialized, on hideAll they are disposed.
                _.each( this.hintsStack , function( hint ){

                    hint.dispose();

                } );

                if (sendToServer) {
                    this.saveMode();
                }

            } ,

            saveMode : function(){

                var daoConfig = {
                    path: restDictionary.paths.SET_CGS_HINT_SHOW_MODE,
                    pathParams : {
                        accountId : userModel.account.accountId ,
                        userId : userModel.user.userId ,
                        showMode : this.showMode
                    }
                };

                dao.remote(daoConfig);

            }

        };

        return new cgsHintUtil();

    } );