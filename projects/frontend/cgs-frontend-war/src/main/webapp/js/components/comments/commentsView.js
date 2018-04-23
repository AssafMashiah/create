define(['jquery', 'BaseView', 'mustache', 'editMode', 'userModel', 'moment', 'text!components/comments/templates/commentsTemplate.html'],
    function f1403($, BaseView, mustache, editMode, userModel, moment, template) {

        var commentsView = Backbone.View.extend({

            events: {
                "blur .commentArea": "saveComment",
                "blur .comment": "minimizedComment",
                "mousedown #addStamp": "addStamp"
            },

            initialize: function f1404(config) {
                this.data = config.data;
                this.data.id = config.id;
                this.data.commentEditble = !editMode.readOnlyMode;
                this.onChange = config.onChange;
                this.onDelete = config.onDelete;
                this.render(this.data);

                this.clickHandler = this.onClickOutsideComment.bind(this);

                //on click outside of the comment area need to trrigger an event to minimize the comment
                $('.screen-content:not(.commentsArea, #minimizedComment, #menu-button-add-comment .icon-th-list, #icon-remove-comment)').click(this.clickHandler);
                //click inside the comment should not minimize the comment (we want to be able to write inside it)
                $('.screen-content .commentsArea').click(function f1405(e) {
                    e.stopPropagation();
                });
            },

            render: function f1406(data) {
                this.$el.html(mustache.render(template, data));
                //mousedown precedes blur event on commentsArea
                this.$("#icon-remove-comment:not(.disable)").on("mousedown",_.bind(this.deleteComment, this));
                this.$("#minimizedComment").click(_.bind(this.minimizedComment, this));
                this.$("#closeComment").click(_.bind(this.minimizedComment, this));
                this.$('[contenteditable]').on('paste', function f1407(e) {

                    e.preventDefault();

                    plainText = e.originalEvent.clipboardData.getData('text/plain');
                    if (plainText) {
                        document.execCommand("insertHTML", false, plainText.split('\r\n').join('<br>'));
                    }

                });

              if (this.$('[contenteditable]').length) {
                    var range = document.createRange();
                    range.selectNodeContents(this.$('[contenteditable]').get(0));
                    range.collapse(false);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

            },
            dispose: function f1408() {
                $('.screen-content').unbind('click', this.clickHandler);
                this.$el.find('*').addBack().unbind();
                this.remove();
            },

            addStamp: function(e) {

                e.stopPropagation();
                e.preventDefault();
                this.isMinimized = false;

                if (!$(e.target).hasClass('disable')) {
                    var stamp = $('<div><br></div>'),
                        datetime = moment().format('DD MMM YYYY  HH:mm'),
                        user = userModel.user.username,
                        dashed = new Array(41).join("-");

                    stamp.append('<div>' + user + ' ' + datetime + '<br>' + dashed + '</div><br>');

                    var sel = document.getSelection();
                    this.range = sel && sel.baseNode && sel.getRangeAt(0);
                    if (this.range) {
                        document.execCommand('insertHTML', false, stamp[0].outerHTML);
                    }
                }
            },

            //on change text inside comment (blur)
            saveComment: function f1409(e) {
                this.isMinimized = true;
                if (_.isFunction(this.onChange)) {
                    setTimeout(function() {
                        this.onChange({data: $(e.target).html(), id: this.data.id, isMinimized: this.isMinimized});
                        this.setLessonCommentsButtonState();
                    }.bind(this), 100);
                }
            },

            //on delete comment
            deleteComment: function f1410(e) {
                if (_.isFunction(this.onDelete)) {
                    this.onDelete(this.data.id);
                    this.setLessonCommentsButtonState();
                }
            },

            //on minimize comment
            minimizedComment: function f1411(e) {

                if (_.isFunction(this.onChange)) {
                    this.onChange({
                        isMinimized: !this.data.isMinimized,
                        id: this.data.id
                    });
                }

            },
            //on click outdide the comment, minimize the comment (if its not minimized)
            onClickOutsideComment: function f1412(e) {
                if (!this.data.isMinimized) {
                    this.minimizedComment();
                }
            },

            setLessonCommentsButtonState: function() {
                require('events').fire('setMenuButtonState', 'menu-button-lesson-comments', require('lessonModel').hasComments() ? 'enable' : 'disable');
            }

        });

        return commentsView;
    });