define(['jquery', 'BaseView', 'repo', 'editMode',
	'text!modules/LessonsTableComponent/templates/LessonsTableComponentView.html', "events",'CGSTooltipUtil'],
	function($, BaseView, repo, editMode, template, events, CGSTooltipUtil) {

		var LessonsTableComponentView = BaseView.extend({

			el: '#lessons_table_base',
			clearOnRender: false,
			_placeholder_removed: false,

			initialize: function(options) {
				this._super(options);
			},

			setEvents: function f835() {
				$(this.el).on('click','#new_lesson_component:not(.readOnlyMode) .new_lesson', this.newLesson.bind(this));
				$(this.el).on('click','#new_lesson_component:not(.readOnlyMode) .new_ebook', this.newLesson.bind(this));
				$(this.el).on('click','#new_lesson_component:not(.readOnlyMode) .new_assessment', this.newAssessment.bind(this));
				

				$(this.el).on('hover','#new_lesson_component:not(.readOnlyMode) .new_lesson', this.initTooltip.bind(this));
				$(this.el).on('hover','#new_lesson_component:not(.readOnlyMode) .new_ebook', this.initTooltip.bind(this));
				$(this.el).on('hover','#new_lesson_component:not(.readOnlyMode) .new_assessment', this.initTooltip.bind(this));
			},
			initTooltip: function (e) {
				if (e.type != "mouseenter") {
					CGSTooltipUtil.empty();
				} else {
					var target = $(e.currentTarget);

					var type = target.hasClass('new_ebook')? 'bookalive' : target.hasClass('new_assessment')? 'assessment' : 'borndigital';
					CGSTooltipUtil.render({
						target: e.currentTarget,
						title: "course.lessons.tooltip.new." + type, 
						position: "bottom-middle"
					});
				}

			},
			newLesson: function(event) {
				if(this.controller.editableLesson() || editMode.readOnlyMode) { //prevent editing number of lessons
					return false;
				}
				var target = $(event.currentTarget);
				var isEbook = target.hasClass('new_ebook');
				logger.audit(logger.category.COURSE, 'Add new ' + (isEbook? 'ebook': 'lesson') + ' to toc ' + this.controller.config.id);

				if (!this._placeholder_removed) {
					$('.empty-placeholder').remove();
					this._placeholder_removed = true;
				}
				repo.startTransaction();
				this.controller.newLesson(isEbook);
				this.resortTable();
				repo.endTransaction();

				events.fire("init-cgs-hints");
			},

			disabledCreateLesson: function f836() {
				this.$el.find(".dropdown-toggle, .new_lesson").addClass('disabled');
				$(this.el).undelegate('.new_lesson', 'click');
				$(this.el).undelegate('#new_assessment', 'click');
			},

            newAssessment: function() {
            	if(this.controller.editableLesson() || editMode.readOnlyMode) { //prevent editing number of lessons
			        return false;
		        }

		        logger.audit(logger.category.COURSE, 'Add new assessment to toc ' + this.controller.config.id);
		        
                if (!this._placeholder_removed) {
                    $('.empty-placeholder').remove();
                    this._placeholder_removed = true;
                }
                repo.startTransaction();
                this.controller.newAssessment();
                this.resortTable();
                repo.endTransaction();
            },
            addEmptyPlaceHolder: function (){
				this.$el.find('#lessons_list').append(('<div class="empty-placeholder">'+
					'<img src="media/empty_folder.png"><br/>' +
					require('translate').tran('course.lessons.table.empty.placeholder')+'</div>'));
				this._placeholder_removed= false;

            },


            fixHelper:function f837(e, ui) {
            	var dragged =  ui.clone();
				dragged.addClass('inDrag');
				return dragged;
			},

			resortTable:function f839() {
				var i = 1, id = 0, td_elem, lessons_order = '';

				repo.startTransaction();

				$("#lessons_table #lessons_list .row-item").each(function f840(index, element) {
					td_elem = $(".index", element);

					if (!!td_elem.length) {
						td_elem.text((i++) +".");

						id = td_elem.attr('id').split("_")[1];
						
						lessons_order += id + ',';
					}
				});

				if(lessons_order.length > 1) lessons_order = lessons_order.slice(0, lessons_order.length - 1);

				repo.updateChildrenOrder(id, 'lesson', lessons_order);

				repo.endTransaction();

			},

			setClassOnCut:function f841(record, eventType) {
				var idAttr;
				$("#lessons_table #lessons_list .row-item").each(function f842(index, element) {
					idAttr = $(element).attr('id');
					if (idAttr) {
						if (idAttr == record.id) {
							$(element).addClass(eventType + '-cut');
						} else {
							$(element).removeClass(eventType + '-cut');
						}
					}
				});

			},

			render: function() {
				this._super(template);

				if (!editMode.readOnlyMode) {

					$("#lessons_table #lessons_list").sortable({
						placeholder: "sortable-placeholder",
						helper:this.fixHelper,
						containment:$("#lessons_table #lessons_list"),
						cursor:"move",
						forceHelperSize:true,
						forcePlaceholderSize:true,
						items:".row-item.is_sortable",
						tolerance:'pointer',
						revert:true,
						stop:this.resortTable
					});
				}

				this.setEvents();

				events.fire("checkPermissions", "lesson_table_component", this);


			},

			disableButtons: function(disable) {
				this.$('#new_lesson_component .addNew').attr('disabled', !!disable || editMode.readOnlyMode);
			},

			clearLessons: function() {
				$('#lessons_list').empty();
			}

		}, {type: 'LessonsTableComponentView'});

		return LessonsTableComponentView;

	});