define({
        sequence : {
            children: ["questionOnly","openQuestion","FreeWriting","mc","narrative","pedagogicalStatement","selfCheck","header"],
            data : {
                type : 'simple',
                isPdfConverted: true
            }
        },
        mc :{
            //children : ["progress",'question','instruction','mcAnswer']
        },
        progress : {
            data : {
                feedback_type : ['local','none']
            }
        },
        question : {

        },
        instruction : {
            children : ['textViewer']
        },
        mcAnswer : {

        },
        option : {

        },
        hint: {

        },
        imageViewer : {

        },
        textViewer : {
             is_valid : function f991(record){
                 result = $("<div>" + record.data.title + "</div>").has('img','mathfieldtag').length;
                return result == 0;

             }
        },
        questionOnly : {}

});