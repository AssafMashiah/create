define(['modules/BaseTaskEditor/BaseTaskEditor', 'repo', 'events', 'lessonModel', 'types', 'files', './config',
	'./CommentsReportStageView', './CommentsReportSmallStageView', './CommentRowView'],
	function(BaseTaskEditor, repo, events, lessonModel, types, files, config, 
		CommentsReportStageView, CommentsReportSmallStageView, CommentRowView) {

		var CommentsReportEditor = BaseTaskEditor.extend({

			initialize: function(configOverrides) {
				this.setStageViews({
					small: CommentsReportSmallStageView,
					normal: CommentsReportStageView
				});

                this._super(/*config*/{
                    menuInitFocusId: config.menuInitFocusId,
                    menuItems: []
                }, configOverrides);

				this.comments = this.getLessonComments();
				this.lessonName = repo.get(lessonModel.getLessonId()).data.title;

				if (!this.config.previewMode) {
					this.startStageEditing();
				}

				if (this.comments.length > 0) {
					this.fillCommentsTable();
				}

				this.bindEvents(
				{
					'export_comments': { 'type': 'register', 'func': this.exportComments , 'ctx': this, 'unbind': 'dispose' },
					'print_comments': { 'type': 'register', 'func': $.noop , 'ctx': this, 'unbind': 'dispose' },
					'end_load_of_menu': { 'type': 'bind', 'func': this.createPrintVersion, 'ctx': this, 'unbind': 'dispose' }
				});
			},

			startStageEditing: function(){
				this.showStagePreview($('#stage_base'), {bindEvents: true});
			},

			getLessonComments: function() {
				var comments = [],
					sequncesArray = ['sequence', 'html_sequence', 'url_sequence', 'separator', 'differentiatedSequenceParent', 'page'];

				(function getData(parentId, id) {
					var record = repo.get(id);
					if (record) {
						if (record.data.comments && record.data.comments.length || (sequncesArray.indexOf(record.type) != -1 && _.find(repo.getSubtreeRecursive(record.id), function(item) { return item.data.comments && item.data.comments.length }))) {
							comment = _.pluck(record.data.comments, 'comment').join(' ');
							comments.push({
								id: record.id,
								parent: parentId,
								title: this.getItemNumber(record) + (sequncesArray.indexOf(record.type) != -1 ? record.data.title : types[record.type].fullName),
								type: record.type,
								comment: comment,
								isEmpty: record.data.comments && record.data.comments.length && !$.trim(comment)
							});
							parentId = record.id;
						}

						_.chain(record.children)
							.sortBy(function(childId) {
								switch (repo.get(childId).type) {
									case 'header':
										return -2;
									case 'sharedContent':
										return -1;
									default:
										return record.children.indexOf(childId);
								}
							})
							.map(getData.bind(this, parentId));
					}
				}).call(this, null, lessonModel.getLessonId());

				return comments;
			},

			getItemNumber: function(record) {
				var unnumberedTypes = ['header', 'help', 'sharedContent', 'narrative', 'pedagogicalStatement', 'selfCheck'],
					filteredChildren, parent,
					index = '';

				if (unnumberedTypes.indexOf(record.type) != -1) {
					return index;
				}
				
				if (types[record.type] && types[record.type].selectTaskType) {
					parent = repo.get(record.parent);
					
					filteredChildren = _.filter(parent.children, function(child) {
						return unnumberedTypes.indexOf(repo.get(child).type) == -1
					});

					index = (filteredChildren.indexOf(record.id) + 1) + '.';
				}
				else {
					var ancestors = repo.getAncestors(record.id);

					ancestors.unshift(record);
					// Skip all top levels (course, toc)
					while ((parent = ancestors.pop()) && parent.type != 'lesson');

					while (ancestors.length) {
						filteredChildren = _.filter(parent.children, function(child) {
							return 	unnumberedTypes.indexOf(repo.get(child).type) == -1 &&
									['ending', 'overview'].indexOf(repo.get(child).data.sq_type) == -1;
						});

						index += (filteredChildren.indexOf(ancestors[ancestors.length - 1].id) + 1) + '.';

						parent = ancestors.pop();
					}
				}

				return index ? index + ' ' : '';
			},

			fillCommentsTable: function() {
				$('#stage_base').find('#lesson-comments').empty();

				_.each(this.comments, function(comment) {
					if (!comment.parent) {
						this.renderComment($('#stage_base').find('#lesson-comments'), comment);
					}
				}, this);
				this.createPrintVersion();
			},

			renderComment: function(parent, comment) {
				var children = _.where(this.comments, {parent: comment.id});

				new CommentRowView({
					controller: this,
					obj: _.extend(comment, { children: !!children.length }),
					parent: parent
				});

				_.each(children, this.renderComment.bind(this, $('#subcomments_' + comment.id)));
			},

			refresh: function() {
				this.comments = this.getLessonComments();
				this.fillCommentsTable();
			},

			exportComments: function() {
				var html = this.stage_view.buildExportHtml(),
					savePath = files.coursePath(undefined, undefined, 'cgsData');

				files.saveObject(html, 'comments_export_' + lessonModel.getLessonId() + '.html', savePath, function f174(file) {
                    if (file) {
                    	var a = document.createElement("a");
                    	a.textContent = 'lesson comments';
                    	a.target = '_blank';
						a.href = file.toURL();

						var clickEvent = document.createEvent("MouseEvent");
						clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
						a.download = 'Comments - ' + this.lessonName + '.html';
						a.dispatchEvent(clickEvent);
                    }
                }.bind(this));

			},

			createPrintVersion: function() {
				var html = this.stage_view.buildExportHtml(true),
					savePath = files.coursePath(undefined, undefined, 'cgsData');

				files.saveObject(html, 'comments_print_' + lessonModel.getLessonId() + '.html', savePath, function f175(file) {
	                if (file) {
	                	$('#menu-button-print-comments').attr({
	                		'target': '_blank',
	                		'href': file.toURL()
	                	});
	                }
	            });
			},

			beforeClose: function() {
				this.router.load(this.router._static_data.id);
			}

		}, {type: 'CommentsReportEditor',
			setScreenLabel: 'CommentsReport Content',
			showTaskSettingsButton: false,
			displayTaskDropdown: false});

		return CommentsReportEditor;

	});