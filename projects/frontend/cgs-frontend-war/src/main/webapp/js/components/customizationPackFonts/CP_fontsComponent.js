define(['backbone', 'files', 'busyIndicator', 'localeModel', 'components/customizationPackFonts/CP_fontsComponentView'],
    function(Backbone, files, busy, localeModel, CP_fontsComponentView) {


        var CP_fontsComponent = Backbone.Router.extend({

            /**
             * initialize
             * @param cfg: parent: $, data: {}, onChangeCallback: fnc()
             */
            initialize: function(cfg) {
                this.data = cfg.data;
                this.model = this.dataToModel(this.data);
                this.onChangeCallback = cfg.onChangeCallback;

                this.view = new CP_fontsComponentView({
                    el: cfg.parent,
                    data: this.model,
                    controller: this
                });

            },
            
            refresh: function (data) {
                this.view.options.data = this.dataToModel(data);
                this.view.render();
                this.view.delegateEvents();
            },

            //font file format : cgs/fonts/{{fontFamilyName}}_{{fontStyle}}+{{anotherFontStyle}}.{{extension}} 
            //              or : cgs/fonts/{{fontFamilyName}}_{{fontStyle}},{{anotherFontStyle}}.{{extension}} 
            //this function converts the above fotmat to an array of font families each with its different sub family item and each with its file
            dataToModel: function(data) {
                var model = [];
        
                _.each(data, _.bind(function(file){
                    //extract relevant data from font name
                    var filePaths =  file.split('/'),
                    filename = filePaths[filePaths.length-1];
                    var fontData = this.getDataFromFontFileName(filename);
                   
                    var fontFamilyInArray = _.find(model, function(familyItem){
                        return familyItem.fontFamilyName === fontData.fontFamily;
                    });

                    //if family exists- add to it 
                    if(fontFamilyInArray){
                        var subFamilyItem = _.find(fontFamilyInArray.familyItem, function(subItem){
                            return subItem.name === fontData.fontFamilyStylesInString;
                        });
                        //if sub family exists- add to it anoter file extension
                        if(subFamilyItem){
                            subFamilyItem.types.push(fontData.fileExtension);
                        }else{
                            //add new sub family 
                           fontFamilyInArray.familyItem.push({
                                'name' : fontData.fontFamilyStylesInString,
                                'styles' : fontData.fontFamilyStyles,
                                'types':[fontData.fileExtension]
                           });
                        }
                        //add new font family
                    }else{
                        var newfamily = {};
                        newfamily.fontFamilyName =  fontData.fontFamily;
                        newfamily.familyItem = [];
                        newfamily.familyItem.push({
                            'name' : fontData.fontFamilyStylesInString,
                            'styles' : fontData.fontFamilyStyles,
                            'types':[fontData.fileExtension]
                        });
                        model.push(newfamily);
                    }
                },this));
                return model;
            },
            //converts the data back to an array of font paths in the format :
            //cgs/fonts/{{fontFamilyName}}_{{fontStyle}}+{{anotherFontStyle}}.{{extension}} 
            modelToData: function(model) {
                var data = [];

                _.each(model, function(fontFamily){
                    var fontFamilyName = fontFamily.fontFamilyName;
                    _.each(fontFamily.familyItem, function(fontItem){
                        var fontName = fontItem.name;
                        _.each(fontItem.types, function(extension){
                            var path = "cgs/fonts/"+ fontFamilyName;
                            if(fontName){
                                path += "_" +fontName;
                            }
                            path += "." +extension;
                            data.push(path);
                        });
                    });
                });

                return data;

            },
            getDataFromFontFileName: function(fileName){
                var ans = {};
                ans.fileExtension = fileName.substring(fileName.lastIndexOf('.')+1, fileName.length);
                var fileWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
                ans.fontFamily= fileWithoutExtension.substring(0, fileWithoutExtension.lastIndexOf('_'));
                ans.fontFamilyStylesInString = fileWithoutExtension.substring(fileWithoutExtension.lastIndexOf('_')+1, fileWithoutExtension.length);
                // added suport for comma separator for extra style fonts
                if (ans.fontFamilyStylesInString.indexOf('+') > -1) {
                    ans.fontFamilyStyles = ans.fontFamilyStylesInString.split('+');
                } else {
                    ans.fontFamilyStyles = ans.fontFamilyStylesInString.split(',');
                }
                return ans;

            },

            //add new font family (zip file) to file system and view
            add_font: function(fontFileData) {

                var path = files.coursePath(require('userModel').getPublisherId(), require('courseModel').getCourseId(), fontFileData.filePath),
                    self=this;

                busy.start();

                //open the zip file with the fonts
                files.loadObject(path, 'blob_hack', function f652(result) {
                    //load the font files to customization pack in cgs/fonts and update fonts override in locale model
                    localeModel.loadFontFamily(result, function(numberFilesUploaded, fileNotUploaded) {
                        // in this case the localeModel.getFonts() will return the updated font list, so no need to call onChangeCallback() that is saving the font list changes
                        self.data = localeModel.getFonts();
                        self.refresh(self.data);
                        busy.stop();

                        var dialogConfig = {
                            title: "Embed Fonts",
                            buttons: {
                                cancel: { label: 'Close' }
                            },
                            closeOutside: false,
                            data : {
                                'numberFilesUploaded': numberFilesUploaded ,
                                'zipName' : fontFileData.originalName,
                                'filesList' : fileNotUploaded,
                                'hasInvalidFiles': fileNotUploaded && fileNotUploaded.length
                            }
                        };

                        require('dialogs').create('uploadFontDone', dialogConfig);
                    });

                });
            }

        });
        return CP_fontsComponent;
    });