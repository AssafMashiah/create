define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'repo', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/previewAssessments/previewAssessmentsDialog.html'],
    function f639(_, $, BaseView, Mustache, events, repo, BaseDialogView, template) {
        var previewAssessmentsDialogView = BaseDialogView.extend({
            tagName: 'div',
            className: 'css-dialog',
            events:{},

            initialize: function(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function($parent) {
                this._super($parent, this.customTemplate);
                var courseId = require("courseModel").getCourseId();
                var container = this.$el.find("#preview_assessments_container");
                this.renderLessons(container, repo.getChildren(courseId));
            },

            renderLessons: function renderLessons(div, children) {
                if (!children.length) return;
                children.sort(function(a, b){ 
                    return (a.type === 'toc') - (b.type === 'toc');
                });
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var currentToc = div;
                    var nextChildren = repo.getChildren(child.id);
                    if (child.type == 'lesson' && child.data.mode == "assessment") {
                        var isPlacement = child.data.placement ? " (Placement)" : "";
                        jQuery('<div/>', {
                            class: "lesson",
                            text: child.data.title + isPlacement
                        }).appendTo(currentToc);
                    } else if (child.type == 'toc' && nextChildren.length) {
                       var tocElem = jQuery('<div/>', {
                          class: "toc"
                       });
                       jQuery('<div/>', {
                          class: "toc-name",
                          text: child.data.title 
                       }).appendTo(tocElem);
                       currentToc = tocElem.appendTo(currentToc);
                   }
                    this.renderLessons(currentToc, nextChildren);
                }
            }

        }, {type: 'previewAssessmentsDialogView'});
        return previewAssessmentsDialogView;
    });