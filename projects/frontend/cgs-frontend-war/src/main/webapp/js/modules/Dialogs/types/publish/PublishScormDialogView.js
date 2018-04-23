define(['jquery', 'lodash', 'repo', 'mustache', 'translate',
        'modules/Dialogs/BaseDialogView',
        'text!modules/Dialogs/types/publish/templates/PublishScormDialogView.html'],
    function($, _, repo, Mustache, i18n, BaseDialogView, template ){

        var PublishScormDialogView = BaseDialogView.extend({

            tagName : 'div',
            className : 'css-dialog-scorm',

            initialize: function(options){
                this.options = options;
                this.customTemplate = template;
                this._super(options);
            },

            render: function($parent){

                var courseId = require( "courseModel" ).courseId;

                var courseRepo = repo.get( courseId );

                var config = {
                    children : !!courseRepo.children.length ,
                    emptyCourse : !courseRepo.children.length ,
                    title : courseRepo.data.title ,
                    id : courseRepo.id ,
                    html : this.buildTree( courseRepo )
                };

                var html = '<div class="publishWrapper"><ul class="first scorm-tree-list">{0}</ul></div>'
                    .format(Mustache.render(this.customTemplate, config));

                this._super( $parent , html );

                this.renderIncludeAncestorsStandards();

                //append an area where the user get a counter of how many lessons he selected.
                //currently only one lesson is supported. so no need for th counter
               /* $( "#dialogControls" )
                    .prepend( "<div style='float:  left; margin-top: 5px; margin-left: 10px;'>" +
                        "<span>" + require( "translate" ).tran( "course.pop_up.publish.publishing_method.selected_lessons.tip" ) + "</span>" +
                        "<span id='lessonsAssessmentsCounter' style='margin-right: 5px;'>0</span>" +
                        "</span></div>" );*/

                $( ".scorm-tree-expendable > .node-collapse" )
                    .bind( "click" , function( event ){
                        event.stopPropagation();
                        $( this ).parent().toggleClass( "scorm-tree-collapsed" );
                    } );

                $("label[id^=scormId_]")
                    .on("click", function(event) {
                        $('#dialog.publishScorm label.selected').removeClass('selected');
                        $(this).addClass('selected');

                        $('#dialog.publishScorm #publishCourse')
                            .removeClass('disabled')
                            .removeAttr('disabled');
                        });
            },

            renderIncludeAncestorsStandards: function () {
                var userModelAccount = require('userModel').getAccount();
                var publishSettings = userModelAccount.publishSettings;


                if (publishSettings && publishSettings.lessons && publishSettings.lessons.enableCourseLevelsCustomizationForScorm) {
                    // Append include ancestor standards to dialog
                    var includeAncestorsStandardsWrapperId = 'includeAncestorsStandardsWrapper';
                    var includeAncestorsStandardsTemplate =
                        '<div id="{0}" class="checkbox pull-left form-inline">\
                            <label>\
                                <input type="checkbox" id="includeAncestorsStandards" value="includeAncestorsStandards" checked="{{#checkIncludeAncestorsStandards}}{{checkIncludeAncestorsStandards}}{{/checkIncludeAncestorsStandards}}"> {1}\
                            </label>\
                        </div>'.format(
                            includeAncestorsStandardsWrapperId,
                            i18n.tran('publish.scorm.include_indexation_of_all_course_levels'));

                    $('#dialogControls').prepend(Mustache.render(includeAncestorsStandardsTemplate, {
                        checkIncludeAncestorsStandards: publishSettings.lessons.enableCourseLevelsCustomizationForScorm
                    }));
                }
            },

            buildTree: function( repoItem, ancestorsIndexString ){

                if( !~[ "toc" , "course" ].indexOf( repoItem.type.toLowerCase() ) ) return "";

                var html = "";
                var config;

                this.hiddenLessons = [];

                var tocIndex = 1;

                _.each( repoItem.children , function( child){

                    child = repo.get( child );

                    if( child.data.mode == "assessment" ) return;

                    if( child.data.isHidden && child.type == "lesson" ){

                        this.hiddenLessons.push( child.id );

                        return;

                    }

                    var tocIndexString;

                    // Put index on toc items only
                    if (child.type == 'toc') {
                        tocIndexString = ancestorsIndexString ? ancestorsIndexString + '.' + (tocIndex) : (tocIndex);
                        tocIndex++;
                    }

                    config = {
                        children : !!child.children.length ,
                        title : child.data.title ,
                        lesson : child.type != "toc" ,
                        id : child.id ,
                        html : this.buildTree( child, tocIndexString ),
                        tocIndexString: tocIndexString
                    };

                    html += Mustache.render( this.customTemplate , config );

                }.bind( this ) );

                if( !repoItem.children.length ){

                    config = {
                        children : !!repoItem.children.length ,
                        title : repoItem.data.title ,
                        id : repoItem.id
                    };

                    html += Mustache.render( this.customTemplate , config );

                }

                return html;

            },

            getIncludeAncestorsStandards: function() {
                return $('#includeAncestorsStandards').is(':checked');
            },

            setReturnValueCallback: {

                publishCourse: function() {
                    return {
                        target: this.options.config.target,
                        selectedLessons: this.getSelectedLessons(),
                        excludedLessons: this.getExcludedLessons(),
                        includeAncestorsStandards: this.getIncludeAncestorsStandards()
                    };
                }

            },

            getSelectedLessons: function () {
                var selectedLessons = [];

                var domSelectedLessons = $( ".css-dialog-scorm .scorm-tree-static label.selected" );

                domSelectedLessons.each(function(){
                    selectedLessons.push(this.id.replace( "scormId_", "" ));
                });

                return selectedLessons;
            },

            getExcludedLessons: function () {
                var excludedLessons = [];
                var domNotSelectedLessons = $( ".css-dialog-scorm .scorm-tree-static label:not(.selected)" );

                domNotSelectedLessons.each(function(){
                    excludedLessons.push(this.id.replace( "scormId_", "" ));
                });

                excludedLessons = _.union(excludedLessons, this.hiddenLessons);

                return excludedLessons;
            },

            dispose: function(){
                this._super();
            }

        });

        return PublishScormDialogView;

    });