define(['backbone', 'mustache', 'styleAndEffectsUtil', 'cgsUtil',
    'text!components/customizationPackStylesAndEffects/templates/stylesAndEffectsTemplate.html'],
    function(Backbone, mustache, styleAndEffectsUtil, cgsUtil, template) {

        var customizationPackStylesAndEffectsView = Backbone.View.extend({

            events : {
                'click .new_style_effect' : 'addNew'
            },

            initialize: function() {
                if(this.options.data){
                    this.render();
	                cgsUtil.setInputMode(this.$el);
                }
            },

            render: function() {
                var loremIpsumStrings = styleAndEffectsUtil.getLoremIpusmStrings()

                this.$el.html(mustache.render(template, $.extend(this.options.data,
                    {'defaultStyleCss' : styleAndEffectsUtil.getDefaultStyleCss(),
                    'lorem_Ipsum_part1' : loremIpsumStrings.lorem_Ipsum_part1,
                    'lorem_Ipsum_part2' : loremIpsumStrings.lorem_Ipsum_part2,
                    'lorem_Ipsum' : loremIpsumStrings.lorem_Ipsum
                })));
                this.bindRowEvent();
            },
            bindRowEvent: function(){
                var self = this;

                //open style and effect editor in click
                this.$('.style_and_effect_row').each(function(){
					//set height so the rows will be displayed not cut
                    $(this).find('.sampleText').css('height', styleAndEffectsUtil.getSmapleTextDivHeight($(this).find('.sampleText')));
             
                    var styleId = this.id;
                    //bind click event on the edit button
                    $(this).find('.edit').click(function(){
                        var newFonts =require('localeModel').hasFontChanges();
                        var callback = function(){
                            self.openStyleEditor(styleId);
                        };

                        if(!_.isEmpty(newFonts)){
                            self.openSaveDialog(newFonts, callback);
                        }else{

                            callback();
                        }
                        
                    });
                });
            },
            openStyleEditor: function(styleId){
                styleAndEffectsUtil.setActiveEditorId(styleId);
                var router = require('router');
                router.load(router.activeEditor.config.id, 'styleEditor');

            },
            openSaveDialog: function(unsavedFonts, callback){
                
                var template = "<div>{{unsavedFontMessage1}}</div>{{#fonts}}<ul><li>{{.}}</li></ul>{{/fonts}}<div>{{unsavedFontMessage2}}</div>";
                var dataToDisplay = mustache.render(template, {
                    'fonts': _.keys(unsavedFonts),
                    'unsavedFontMessage1': require('translate').tran('course.props_area.tab_design.edit.unsaved_fonts_dialog.message1'),
                    'unsavedFontMessage2': require('translate').tran('course.props_area.tab_design.edit.unsaved_fonts_dialog.message2')
                });


                var dialogConfig = {

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
            addNew : function(){
                var id = styleAndEffectsUtil.addNew(this.options.data.isStyle);

                var router = require('router');
                    router.load(router.activeEditor.config.id, 'styleEditor');
            }

        });

        return customizationPackStylesAndEffectsView;
    });