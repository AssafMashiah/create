define(['jquery', 'lodash', 'repo', 'mustache', 'translate', 'restDictionary',
        'modules/Dialogs/BaseDialogView',
        'text!modules/Dialogs/types/publish/templates/PublishScormDialogView.html',
        'text!modules/Dialogs/types/publish/templates/publishTree.html'],
    function($, _, repo, Mustache, i18n, restDictionary, BaseDialogView, template, treeTemaplate ){

        var DistributeTreeDialogView = BaseDialogView.extend({

            tagName : 'div',
            className : 'css-dialog-tree',

            initialize: function(options){
                this.options = options;
                this.customTemplate = template;
                this._super(options);
            },

            render: function($parent){

                this._super( $parent , '<div id="publishCoureTree"></div>' );
              
                this.renderData(function(){
                    this.renderIncludeAncestorsStandards();
                    this.bindEvents();
                }.bind(this));
               
            },

            renderData: function(callback) {
                var daoConfig = {
                    path: restDictionary.paths.GET_COURSE_ITEMS_TREE,
                    pathParams: {
                        publisherId: require('userModel').getPublisherId(),
                        courseId : repo._courseId,
                        tocItemContentType: true
                    }
                };

                require('dao').remote(daoConfig, function(courseItemsTree) {

                    var result ={};
                    var alignData = function(parent, data){
                        parent.id = data.id;
                        parent.name = data.name;

                        if(!data.items)
                        {
                            parent.items = false;

                        }else{
                            parent.items = [];
                            _.each(data.items, function(item){
                                parent.items.push(alignData({}, item));
                            });
                        }
                        return parent;
                    };
                    var result = alignData(result , courseItemsTree);


                    var html =  Mustache.render(treeTemaplate,result,{'treeTemaplate' : treeTemaplate});

                    $("#publishCoureTree").html(html);
                    callback();
                });
            },
            bindEvents: function(){
                 //tree collapse
                $( ".publish-tree-expendable > .node-collapse" ).on('click', function(event){
                    if($(event.srcElement).hasClass('node-collapse')){
                        event.stopPropagation();
                        $( this ).parent().toggleClass("publish-tree-collapsed");
                    }
                });

                //check all children
                $('.publish-item').on('click', function(event){
                    $(this).closest('li').find('.publish-item').attr('checked', $(this).is(":checked"));

                });


            },

            renderIncludeAncestorsStandards: function () {
                var publishItemsSeparatelyCheckbox = '<div id="includeAncestorsStandardsWrapper" class="checkbox pull-left form-inline"><input disabled type="checkbox"><label title="Publish each item separately">Publish each item separately</label></div>';
                $('#dialogControls').prepend(publishItemsSeparatelyCheckbox);
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

        return DistributeTreeDialogView;

    });