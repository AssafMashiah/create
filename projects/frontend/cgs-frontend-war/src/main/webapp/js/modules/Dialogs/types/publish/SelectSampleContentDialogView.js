define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
	'text!modules/Dialogs/types/publish/templates/SelectSampleContentDialog.html',
    'text!modules/Dialogs/types/publish/templates/publishTree.html', 'repo', 'translate'],
	function(_, $, BaseView, Mustache, events, BaseDialogView, template, treeTemplate, repo, i18n) {

	var SelectSampleContentDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog-tree',

        initialize: function(options) {
            this.config = options.config;
            this.customTemplate = template;
            this._super(options);
        },

        events: {
            'click .publish-item': 'getSelectedLessons'
        },

        render: function( $parent ) {
            this._super($parent, this.customTemplate);
            this.renderData();
            this.bindEvents();
        },

        renderData: function() {
            var courseModel = require('courseModel');
            var courseToc = repo.getSimpleChildrenRecursive(courseModel.getCourseId());
            var noOfItems = courseToc.noOfChildren || 0;
            var htmlContent =  Mustache.render(treeTemplate, courseToc, {'treeTemaplate' : treeTemplate});
            $('#sampleContentTree').html(htmlContent);
            $("#sampleContentTree input[data-content-type=course]").remove();
            $("#sampleContentTree input[data-content-type=toc]").remove();
            this.addCounterText(noOfItems);
            this.setSelectedLessons(this.config.samplesList);
            this.checkValidPublish();
        },

        setReturnValueCallback: {
            publishStart: function(){
                return this.config;
            }
        },

        getSelectedLessons: function () {
            var selectedLessons = [];
            var domSelectedLessons = $('.publish-item:checkbox:checked');
            domSelectedLessons.each(function(){
                selectedLessons.push({
                    cid: this.id.replace("checkbox_", "" ),
                    type: $(this).data("contentType")
                });
            });
            this.config.samplesList = selectedLessons;
            this.changeNoSelected(selectedLessons.length);
            this.checkValidPublish();
        },

        setSelectedLessons: function (selectedLessons) {
            selectedLessons.forEach(function(lesson) {
                var input = $('input.publish-item#checkbox_' + lesson.cid);
                input.prop("checked", true);
            });
            this.changeNoSelected(selectedLessons.length);
        },

        checkValidPublish: function () {
            //check if there are selected lessons
            if (!this.config.samplesList.length) {
                $("#publishStart").addClass("disabled")
            } else {
                $("#publishStart").removeClass("disabled")
            }
        },

        bindEvents: function() {
        	 $( ".publish-tree-expendable > .node-collapse" ).on('click', function(event){
				if($(event.srcElement).hasClass('node-collapse')){
					event.stopPropagation();
					$( this ).parent().toggleClass("publish-tree-collapsed");
				}
			});
        },

        addCounterText: function(noOfItems) {
            var $dialogControls = $("div.sampleContent .modal-footer");
            var $container = $('<div/>', {
                class: "counter"
            }).appendTo($dialogControls);
            $('<span/>', {text: i18n.tran("courseSample.counter.text1") + " "}).appendTo($container);
            $('<span/>', {text: "0", class: 'selectedLessons'}).appendTo($container);
            $('<span/>', {text: " " + i18n.tran("courseSample.counter.text2") + " " + noOfItems + "."}).appendTo($container);
        },

        changeNoSelected: function(no) {
            $("div.counter span.selectedLessons").text(no);
        }


    }, {type: 'SelectSampleContentDialogView'});
        

	return SelectSampleContentDialogView;

});