define(['lodash','jquery', 'repo', 'BaseView',  'modules/Dialogs/BaseDialogView', 'mustache', 'restDictionary',
    'text!modules/Dialogs/types/referenceSequence/referenceSequenceRow.html'],
function(_, $,repo, BaseView,  BaseDialogView, mustache, restDictionary,  template) {

    var referenceSequenceDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',
        id: 'reference-to-sequence',

		events:{
            'click div.items-list': 'toggleEntry',
            'click a.sequence-link': 'sequenceSelected',
            'dblclick a.sequence-link': 'submitSequence',
        },

		initialize: function(options) {

			this.customTemplate = template;
            this.partialTemplate = {'templateRow': template};
            
			this._super(options);

		},
        getReferenceSequenceTreeData : function(callback){
            var referenceSequenceApi = {
                path: restDictionary.paths.SEQUENCE_TREE_OF_HIDDEN_LESSONS,
                    pathParams: {
                        courseId: require('courseModel').getCourseId(),
                        publisherId: require('userModel').account.accountId
                    }
                };
            require('busyIndicator').start();

            require('dao').remote(referenceSequenceApi, _.bind(function f711(response) {
                if(response){
                    this.referenceSequenceTreeData = response.root;
                    var prepareData = function(item){
                        if(item.children === undefined || item.children === false){
                            if(item.type == 'sequence'){
                                item.children = false;
                                item.isLeaf = true;
                            }else{
                                //item without children that is not a sequence, we dont need to disply it
                                item.dontShow = true;
                            }
                        }else{
                            item.isLeaf = false;
                            var tmpChildren = [];

                            _.each(item.children, function(childItem) {
                                //in case of course without lo, we need to cahnge the hirarchy returned from server,
                                //the server returns a dummy "lo", and we need to not display it, but display its children
                                if(childItem.type == "lo" && ! repo.get(repo._courseId).data.includeLo){
                                   tmpChildren = tmpChildren.concat(childItem.children);
                                }else{
                                    //dont display differentiatedSequenceParent
                                    if(childItem.type !== 'differentiatedSequenceParent'){
                                        tmpChildren.push(childItem);
                                    }
                                }
                                
                            });
                            item.children = tmpChildren;

                            _.each(item.children, function(childItem){
                                prepareData(childItem);
                            });
                        }
                    };
                    
                    prepareData(this.referenceSequenceTreeData);
                    require('busyIndicator').stop();
                    callback();
                }else{
                    require('busyIndicator').stop();
                }

            },this));
        },


		render: function( $parent ) {
            var superRenderFunction = this._super;

            this.getReferenceSequenceTreeData(
                _.bind(function(){
                    superRenderFunction.call(this, $parent, this.customTemplate, this.referenceSequenceTreeData, this.partialTemplate);
                    this.$el.find('div#yes').addClass('disabled');
                }, this));
        },
		
		beforeTermination: function() {
			if ($(event.target).hasClass('disabled'))
                    return 'cancel_terminate';
		},

		toggleEntry: function(event) {
            var entryDiv = $(event.target);
            if (entryDiv.hasClass('opened')) {
                entryDiv.next().slideUp('fast');
                entryDiv.removeClass('opened');
            }
            else {
                entryDiv.next().slideDown('fast');
                entryDiv.addClass('opened');
            }
        },

        
		sequenceSelected: function(event) {
            var lessonLink = $(event.target);

            this.$el.find('a.sequence-link').removeClass('selected');
            lessonLink.addClass('selected');

            var breadcrumbsString = '';
            lessonLink.parents('[name]').each( function(){
                breadcrumbsString = $(this).attr('name') +" > " + breadcrumbsString;
            });

            this.controller.setReturnValue('yes', {
                referencedSequenceId: lessonLink.attr('cid'),
                referencedLessonId: lessonLink.parents('[type="lesson"]').attr('cid'),
                breadcrumbs: breadcrumbsString.substr(0,breadcrumbsString.length-2)
            });
            this.$el.find('div#yes').removeClass('disabled');
        },

        submitSequence: function(event) {
            this.sequenceSelected(event);
            this.controller.onDialogTerminated('yes');
        }

	}, {type: 'referenceSequenceDialogView'});

	return referenceSequenceDialogView;
});