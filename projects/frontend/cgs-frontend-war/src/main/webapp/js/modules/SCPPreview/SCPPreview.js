define( [ "jquery" , "mustache" , "events" , "repo" , "configModel" , "userModel" , "courseModel" , "lessonModel" ,
    "conversionUtil" , "translate" , "modules/SCPPreview/config" , "text!modules/SCPPreview/templates/SCPLoading.html", "assets"] ,
    function( $ , mustache , events , repo , configModel , userModel , courseModel , lessonModel ,
        conversionUtil , i18n , playerConfig , loadingTemplate, assets ){

        var preview = {

            initPreview : function( config ){

                this.config = config;
                this.openLoading();
                this.loadingMessage( i18n.tran( "scp_preview.loading.collecting_data" ) );
                this.convertData();
            } ,

            openLoading : function(){

                $( this.config.container )
                    .html( mustache.render( loadingTemplate , {} ) );

            } ,

            loadingMessage : function( message ){

                $( this.config.container )
                    .find( "#context" )
                    .html( message );

            } ,

            closeLoading : function(){

                $( this.config.container )
                    .empty();

            } ,

            initPlayer : function(){

                var router = require("router");

                //generate the bast path where the ebook files are located on the server
                var ebookBasePath = mustache.render("{{{basePath}}}/publishers/{{{publisherId}}}/",{
                    basePath : require("configModel").configuration.cmsBasePath,
                    publisherId :require("userModel").getPublisherId()
                });
                
                //generate the navigation path to init the SCP
                var contentPathString = "{{{basePath}}}#/lessonView/{{courseId}}/courseVersion/{{courseVersion}}/lesson/{{lessonId}}/lessonVersion/{{lessonVersion}}";
                var contentPath = mustache.render(contentPathString, {
                        "basePath": "https:" + assets.serverPath('/../'),
                        "courseId" : courseModel.courseId,
                        "courseVersion" : 1,
                        "lessonId" : lessonModel.lessonId,
                        "lessonVersion" : 1,
                    });

                //add a spesific focus element if we preview from page or a differentiated sequence parent
                switch(router.activeEditor.elementType){
                    case "lo":
                        if(router.activeEditor.record.children.length){
                            contentPath += mustache.render("/contentItem/{{contentItemId}}/selected",{"contentItemId" : router.activeEditor.record.children[0]});
                        }
                        break;
                    case "page":
                        contentPath += mustache.render("/contentItem/{{contentItemId}}/selected",{"contentItemId" : router.activeEditor.elementId});
                    break;
                    case "differentiatedSequenceParent":
                        contentPath += mustache.render("/contentItem/{{contentItemId}}/diffLevel/{{diffLevelIndex}}/selected",
                            {
                                "contentItemId" : router.activeEditor.elementId,
                                "diffLevelIndex" : 1
                        });
                    break;
                }

                //generate the whole query string params for the SCP
                var queryString = "?randomkey={{randomkey}}&locale={{locale}}&vmode={{vmode}}&courseFrom={{courseFrom}}&ebookPath={{{ebookPath}}}&contentPath={{{contentPath}}}";
                var query = mustache.render(queryString, {
                    locale : repo.get(repo._courseId).data.contentLocales[0] || "en_US",
                    vmode: "p",
                    courseFrom : "memory",
                    ebookPath : ebookBasePath,
                    contentPath: contentPath,
                    randomkey: Math.random()
                });

                $( "<iframe id=\"SCPPreviewIframe\" allowfullscreen />" )
                    .appendTo( this.config.container )
                    .attr("src", "player/scp/index.html" + query)
                    .css( {
                        width: this.config.scale.width ,
                        height: this.config.scale.height
                    } );

            } ,

            getFileSystemCourseFullPath : function(){

                var publisherId = userModel.account.accountId;

                var replacement = "filesystem:http://$1/persistent/publishers/" + publisherId + "/courses/";

                return configModel.configuration.basePath.replace( /http:\/\/([\s\S]+)?\/cgs\/[\s\S]*/g , replacement );

            } ,

            convertData : function(){

                this.loadingMessage( i18n.tran( "scp_preview.loading.preparing_to_play" ) );

                //arrange the data in the format that SCP is expecting
                var scpConvertedData = {};
                scpConvertedData.data = {};
                scpConvertedData.data[this.config.data.manifest.cid] = this.config.data;

                this.convertedDataForScp =  scpConvertedData;
                console.log('Data For SCP:', this.convertedDataForScp);

                // this method is used by SCP code to get the lesson data
                window.getContentObject = function( success ) {

                    success( this.convertedDataForScp );

                }.bind( this );

                this.closeLoading();

                this.initPlayer();

            } ,

            dispose : function(){

                this.convertedDataForScp = null;

                $( "#SCPPreviewIframe" )
                    .remove();

            }

        };

        return preview;

    } );