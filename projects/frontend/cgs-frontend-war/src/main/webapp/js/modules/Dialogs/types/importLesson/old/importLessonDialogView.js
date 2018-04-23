// define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'repo', 'clipboardManager', '../../../BaseDialogView',
//     'text!modules/Dialogs/types/importLesson/importLessonDialog.html',
//     'text!modules/Dialogs/types/importLesson/courseItems.html'],
//     function f639(_, $, BaseView, Mustache, events, repo, clipboardManager, BaseDialogView, template, courseItemsTemplate) {

        // var importLessonDialogView = BaseDialogView.extend({
        //
        //     tagName: 'div',
        //     className: 'css-dialog',
        //     events:{
        //         'click #import_lesson_container a.lesson-link': 'lessonSelected',
        //         'dblclick #import_lesson_container a.lesson-link': 'submitLesson',
        //         'click #import_lesson_container div.course-list.treeNode': 'toggleCourse',
        //         'click #import_lesson_container li.toc-item.treeNode': 'toggleToc',
        //         'input #import_lesson_container div.search-container input': 'searchHandler',
        //         'change #import_lesson_container div.search-container input': 'searchHandler'
        //     },
        //
        //     initialize: function f640(options) {
        //         this.customTemplate = template;
        //         this._super(options);
        //         this.courseData = {};
        //         this.openItems = {};
        //     },
        //
        //     isLessonFocused: function () {
        //         var focusItem = clipboardManager.focusItem && repo.get(clipboardManager.focusItem);
        //
        //         return focusItem && focusItem.type === 'lesson' ? true : false;
        //     },
        //
        //     render: function f641($parent) {
        //         this.showReplaceNotification = this.isLessonFocused();
        //         this.placeholder = require('translate').tran("import.lesson.search.placeholder");
        //         this.options.config.structure = _.filter(this.options.config.structure, function (item) {
        //             return item.courseId !== require("courseModel").courseId;
        //         });
        //
        //         this._super($parent, this.customTemplate);
        //         this.$el.find('div#yes').addClass('disabled');
        //     },
        //
        //     beforeTermination: function(event) {
        //         if ($(event.target).hasClass('disabled'))
        //             return 'cancel_terminate';
        //     },
        //
        //     toggleCourse: function(event) {
        //         if (event.target == event.currentTarget) { // Make sure we're not clicking children
        //             var courseDiv = $(event.target);
        //             var courseId = courseDiv.attr('courseId');
        //             if (courseDiv.hasClass('opened')) {
        //
        //                 // animations and css
        //                 courseDiv.children('ul').slideUp('fast');
        //                 courseDiv.removeClass('opened');
        //                 this.openItems[courseId] = false;
        //             }
        //             else { // !courseDiv.hasClass('opened')
        //
        //                 // animations and css
        //                 courseDiv.children('ul').slideDown('fast');
        //                 courseDiv.addClass('opened');
        //
        //                 // On first open, get tocItems and lessons
        //                 if (courseDiv.is(':not(.loadedChildren)')) {
        //                     this.fillCourseItems(courseDiv);
        //                 } else {
        //                     this.openItems[courseId] = true;
        //                 }
        //             }
        //
        //         }
        //     },
        //
        //     fillCourseItems: function(courseDiv, callback) {
        //         var self = this;
        //         var courseId = courseDiv.attr('courseId');
        //
        //
        //         var daoConfig = {
        //             path: require('restDictionary').paths.GET_COURSE_TOC_TREE,
        //             pathParams: {
        //                 publisherId: require('userModel').getPublisherId(),
        //                 courseId: courseId
        //             },
        //             data: {}
        //         }
        //
        //         // If lesson is selected send the lesson type
        //         if (this.showReplaceNotification) {
        //             var focusItem = clipboardManager.focusItem && repo.get(clipboardManager.focusItem);
        //             var tocItemContentType = (focusItem.data.mode === 'assessment') ? 'assessment' : 'lesson';
        //             daoConfig.data.tocItemContentType = tocItemContentType;
        //         }
        //
        //         require('dao').remote(daoConfig, function(receivedJson) {
        //             courseDiv.addClass('loadedChildren');
        //
        //             var courseJson = _.find(receivedJson, { courseId: courseDiv.attr('courseId') });
        //             self.courseData[courseId] = courseJson;
        //             self.addCourseChildren(courseDiv, _.cloneDeep(courseJson));
        //         });
        //     },
        //
        //     addCourseChildren: function(courseDiv, courseJson) {
        //         var self = this;
        //         var searchExpr = this.searchExpr;
        //         //visible means at least one child is visible, isVisible means all children should be visible.
        //         var visible = false, isVisible = false;
        //         var nestedPluck = function (baseTocItems, result, isVisible) {
        //
        //             if (_.isArray(baseTocItems)) {
        //                 for (var i = 0; i < baseTocItems.length; i++) {
        //                     if (baseTocItems[i]) {
        //                         var innerResult = [];
        //                         var innerTocItems = baseTocItems[i]['tocItems'];
        //                         delete baseTocItems[i]['tocItems'];
        //
        //                         baseTocItems[i]['tocItemsContent'] = _.compact(baseTocItems[i]['tocItemsContent']);
        //                         if (!isVisible && !!searchExpr && baseTocItems[i]['tocItemsContent'].length) {
        //                             isVisible = baseTocItems[i].title.toLowerCase().indexOf(searchExpr) >= 0;
        //                         }
        //                         visible = self.filterCourseItems(baseTocItems[i]['tocItemsContent'],isVisible) || visible || isVisible;
        //                         innerResult.push(baseTocItems[i]);
        //                         if (innerTocItems) {
        //                             innerResult = innerResult.concat(nestedPluck(innerTocItems, []));
        //                         } else {
        //                             return innerResult;
        //                         }
        //                         result = result.concat(innerResult);
        //                     }
        //                 }
        //             }
        //             return result;
        //         }
        //         if (!!searchExpr) {
        //             isVisible = visible = courseJson.title.toLowerCase().indexOf(searchExpr) >= 0;
        //         }
        //         var tocItems = nestedPluck(courseJson['toc']['tocItems'], [], isVisible);
        //
        //         tocItems = _.filter(tocItems, function(tocItem) {
        //            return (tocItem.tocItemsContent.length > 0) && _.filter(tocItem.tocItemsContent,function (lesson) { return !!lesson.visible}).length;
        //         });
        //
        //         var courseItemsData = {
        //             tocs: tocItems,
        //             tocItemsContent: _.compact(courseJson['toc']['tocItemsContent'])
        //         };
        //         courseItemsData.hasChildren = (courseItemsData.tocs.length || courseItemsData.tocItemsContent.length);
        //         visible = self.filterCourseItems(courseItemsData.tocItemsContent, isVisible) || visible;
        //         courseDiv.addClass('hasChildren');
        //         if (visible) {
        //             courseDiv.show();
        //         } else {
        //             courseDiv.hide();
        //         }
        //         self.renderCourseItems(courseDiv,courseItemsData);
        //     },
        //     filterCourseItems: function (items,isVisible) {
        //          var searchExpr = this.searchExpr;
        //          var visible = !searchExpr;
        //          _.forEach(items,function (item) {
        //                 item.itemtype = "borndigital";
        //                 item.visible = true;
        //                 if (!isVisible && !!searchExpr) {
        //                     item.visible = item.title.toLowerCase().indexOf(searchExpr) >= 0;
        //                     visible = visible || item.visible;
        //                 }
        //                 if (item.type == "assessment") {
        //                     item.itemtype = "assessment";
        //                 } else if (item.format == "EBOOK") {
        //                     item.itemtype = "bookalive";
        //                 }
        //
        //             });
        //           return visible;
        //     },
        //     renderCourseItems: function (courseDiv,courseItemsData) {
        //             var courseItemsHtml = Mustache.render(courseItemsTemplate, courseItemsData);
        //             var courseId = courseDiv.attr('courseId');
        //             var inProgress = courseDiv.children('.inProgress');
        //             if (inProgress.length) {
        //                 inProgress.replaceWith(courseItemsHtml);
        //                 this.openItems[courseId] = true;
        //                 courseDiv.addClass('opened');
        //                 courseDiv.children('ul:has(li)')
        //                             .addClass('opened')
        //                             .show();
        //
        //             } else {
        //                courseDiv.children('.toc-list').remove();
        //                courseDiv.children('.lessons-list').remove();
        //                courseDiv.append(courseItemsHtml);
        //                if (this.openItems[courseId] != false) {
        //                    courseDiv.children('ul:has(li)')
        //                             .addClass('opened')
        //                             .show();
        //                }
        //
        //
        //             }
        //             var self = this;
        //             courseDiv.find('.toc-item').each(function (i,item) {
        //                item = $(item);
        //                var tocId = item.attr('tocId');
        //                if (!!self.searchExpr && self.openItems[tocId] != false) {
        //                     item.addClass('opened');
        //                     item.find('.lessons-list').show();
        //                }
        //             })
        //     },
        //
        //     toggleToc: function(event) {
        //         var tocDiv = $(event.target);
        //         var tocId = tocDiv.attr('tocId');
        //         if (tocDiv.hasClass('opened')) {
        //             tocDiv.children("ul").slideUp('fast');
        //             tocDiv.removeClass('opened');
        //             this.openItems[tocId] = false;
        //         }
        //         else {
        //             tocDiv.children("ul").slideDown('fast');
        //             tocDiv.addClass('opened');
        //             this.openItems[tocId] = true;
        //         }
        //     },
        //
        //     lessonSelected: function(event) {
        //         var lessonLink = $(event.target);
        //
        //         this.$el.find('#import_lesson_container a.lesson-link').removeClass('selected');
        //         lessonLink.addClass('selected');
        //
        //         this.controller.setReturnValue('yes', {
        //             courseId: lessonLink.closest('[courseId]').attr('courseId'),
        //             lessonId: lessonLink.attr('lessonId'),
        //             lessonType: lessonLink.attr('lessonType')
        //         });
        //         this.$el.find('div#yes').removeClass('disabled');
        //     },
        //
        //     submitLesson: function(event) {
        //         this.lessonSelected(event);
        //         this.controller.onDialogTerminated('yes');
        //     },
        //     searchHandler: _.debounce(function (event) {
        //         this.triggerChange(event)
        //     }, 300),
        //     triggerChange: function (event) {
        //         this.oldSearchExp = this.searchExpr;
        //         this.searchExpr = event.currentTarget.value.toLowerCase();
        //         this.filterLessons();
        //     },
        //     filterLessons: function () {
        //         var self = this;
        //         _.forEach(this.courseData,function (courseData,key) {
        //             var courseDiv = self.$el.find('[courseId="'+key+'"]');
        //             self.addCourseChildren(courseDiv,_.cloneDeep(courseData));
        //         })
        //
        //         self.$el.find('.courses-list .course-list:has(.inProgress)').each(function (i,courseDiv) {
        //             self.fillCourseItems($(courseDiv));
        //         })
        //     }
        //
        // }, {type: 'importLessonDialogView'});
        //
        // return importLessonDialogView;

    // });