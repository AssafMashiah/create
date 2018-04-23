define( [ "jquery" , "lodash" , "modules/CGSHintUtil/CGSHintUtilView" ] ,

    function( $ , _ , cgsHintView ){

        var cgsHintUtil = function(){

            var storedData = localStorage.getItem( "CGSHints" );

            if( storedData ){

                try{

                    storedData = JSON.parse( storedData );

                    this.showMode = storedData.showMode || "default";
                    this.blockedHints = storedData.blockedHints || [];
                    this.hintsStack = {};

                }

                catch( e ){

                    console.error( e.message );

                }

            }

            else{

                this.showMode = "default";
                this.blockedHints = [];
                this.saveState();

            }

            this.hintsStack = {};

        };

        cgsHintUtil.prototype = {

            init : function( config ){

                if( !config || !config.length ) return;

                if( this.hintsStack.length ){

                    console.error( "" );

                    return null;

                }

                if( this.showMode == "hide" ) return;

                _.each( config , function( data ){

                    if( !~this.blockedHints.indexOf( data.id ) ){

                        this.hintsStack[ data.id ] = new cgsHintView( data );

                    }

                }.bind( this ) );

            } ,

            dispose : function( id ){

                if( id ){

                    this.hintsStack[ id ] && this.hintsStack[ id ].dispose && this.hintsStack.dispose();

                }

                else{

                    _.each( this.hintsStack , function( hint ){

                        hint.dispose && hint.dispose();

                    } );

                }

            } ,

            showAll : function(){

                this.showMode = "show";

                this.saveState();

            } ,

            hideAll : function(){

                this.showMode = "hide";

                this.saveState();

            } ,

            saveState : function(){

                var objToStore = {
                    showMode : this.showMode ,
                    blockedHints : this.blockedHints
                };

                localStorage.setItem( "CGSHints" , JSON.stringify( objToStore ) );

            } ,

            closeHint : function( hint ){}

        };

        return new cgsHintUtil();

    } );