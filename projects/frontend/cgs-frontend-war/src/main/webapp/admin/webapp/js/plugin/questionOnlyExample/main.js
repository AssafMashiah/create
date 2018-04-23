define([],
    function() {

        console.log("main.js start");

        var previewTmpl ="<div class='title' ></div>" +
            "<div class='instructionContainer' ></div>" +
            "<div class='questionContainer' ></div>";
        var myStage,myData,instructionParent,childNumber= 0,$mainEl,$instructionCon;

        function myPlugin(){
        }


    var myPlugin = {
        onEdit : function(){
            myData = this.CGS.data.getItem();
                //render my data
                renderMyDataForEdit();
        },

        onPreview : function(){
            myData = this.CGS.data.getItem();
            //  render my data for preview
            renderMyDataForPreview( this.CGS.elo,myData);

        }
    }

        var renderMyDataForPreview = function(elo,myData){
            console.log('renderMyDataForPreview');
           elo.append(previewTmpl);


        };

        var renderMyDataForEdit = function(){
            console.log('renderMyDataForEdit');

        };

            return myPlugin;
    });






