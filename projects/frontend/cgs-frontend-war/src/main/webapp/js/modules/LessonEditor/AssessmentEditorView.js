define(['jquery', 'BasePropertiesView', 'text!modules/LessonEditor/templates/AssessmentEditor.html','repo', 'StandardsList', 
    'standardsModel', 'BaseContentEditor', 'learningPathModel'],
    function f794($, BasePropertiesView, template,repo, StandardsList, standardsModel, BaseContentEditor, learningPathModel) {

        var AssessmentEditorView = BasePropertiesView.extend({

            initialize: function f795(options) {
            	var record = this.options.controller.record;
                record.learningpath = _.find(repo.get(repo._courseId).data.learningPaths,{'assessmentCid' : record.id});
                this.template = template;
                this._super(options);
               
            },
            render: function() {

                this.totalScore = require("lessonModel").getAssessmentTotalScore();

                //set up extra data for display
                repo.startTransaction({ ignore: true });
                repo.updateProperty(this.controller.record.id, 'diffLevelRecommendation', true, false, true);
                repo.updateProperty(this.controller.record.id, 'includeOverview', _.any(repo.getChildren(this.controller.record),function(item){
                    return item.data.sq_type == "overview"
                }), false, true);
                repo.endTransaction();

                this._super();
	            if (this.controller.enableStandards) {
		            this.standardsList = new StandardsList(
			            {
				            itemId: '#standards_list',
				            repoId: this.controller.config.id,
				            getStandardsFunc: _.bind(function () {
					            return standardsModel.getStandards(this.controller.config.id);
				            }, this)
			            });
	            }
	            $("#edit-ending").click(_.bind(this.controller.editAssessmentSequences, this.controller, "ending"));
	            $("#setlearningpath").click(_.bind(this.controller.setLearningPath, this.controller));
	            $("#edit-overview").click(_.bind(this.controller.editAssessmentSequences, this.controller, "overview"));
	            $("#field_learningPathCheck").change(_.bind(this.controller.learningpathChanged, this.controller));
	            $("#field_placement").change(_.bind(this.controller.placementChanged, this.controller));
                $("#show_all_assessments").click(this.showPreviewAssessmentsDialog);

                var record = this.options.controller.record;
                record.canBePlacement = this.options.controller.changeablePlacementAssessment

                if (record.data.pedagogicalLessonType == "auto" && record.data.startByType == "student") {
                    $(this.el).find("#field_pedagogicalLessonType").attr("cantBeEnabled", 'true');
                    $(this.el).find("#field_pedagogicalLessonType").attr("disabled", 'disabled');
                }
                
                if (!record.canBePlacement) {
                	$(this.el).find("#fields_learningPath").addClass('hide');
                	$(this.el).find("#field_placement").attr("disabled", 'disabled');
                	$(this.el).find("#field_placement").attr("cantBeEnabled", 'true');
                } else if (!record.data.placement || record.data.placement == 'false') {
                	$(this.el).find("#fields_learningPath").addClass('hide');
                } else {
                	$(this.el).find("#field_placement").val('true');
                }
               
                if (record.learningpath) {
                	$(this.el).find("#field_learningPathCheck").attr('checked','checked');
                } else {
                	$(this.el).find("#setlearningpath").attr('disabled','disabled');
                }

                $(this.el).find("[rel=tooltip]").tooltip({
                    'content': function(){
                        return $(this).attr('title');
                    }
                })
            },
            showPreviewAssessmentsDialog : function() {
                var dialogConfig = {
                    title: 'All course assessments',
                    closeIcon: true,
                    content: {
                        icon: 'warn'
                    },
                    closeOutside: true,
                    buttons: {
                        cancel: {
                            label: 'Close'
                        }
                    }
                };
                require('dialogs').create('previewAssessmentsDialog', dialogConfig);
            }

        }, {type: 'AssessmentEditorView'});

        return AssessmentEditorView;

    });
