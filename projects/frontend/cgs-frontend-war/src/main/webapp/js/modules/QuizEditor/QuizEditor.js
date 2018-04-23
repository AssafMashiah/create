define(['BaseEditor', "./QuizEditorView", "courseModel", "./QuizEditorStageView", "repo", "events", "validate", "./config"],
function(BaseEditor, QuizEditorView, courseModel, QuizEditorStageView, repo, events, validate, config) {


	var QuizEditor = BaseEditor.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);

			this.view = new QuizEditorView({controller: this});
			this.stage_view = new QuizEditorStageView({controller: this});

			repo.startTransaction({ ignore: true });
			this.setDefaultData();
			repo.endTransaction();

			this.setEvents();
			this.registerEvents();

			if (!repo.getChildrenByTypeRecursive(this.record.id, "progress").length && !repo.getChildrenByTypeRecursive(this.record.id, "advancedProgress").length) {
				this.view.setRelationState(true, true);
			}

			this.view.setRedoState(this.record.data.redoQuizEnabled);
		},

		startPropsEditing: function() {
            // prevent super start editing
        },
		
		//set the diff levels default critirias
		/**
		*structure: {				
						"feedback": "",
						"fromScore": null, //from and equal
						"toScoreNotEqual": null,	//to and not equal
						"score": null,
						"targetDiffLevelId" : null
					}
		**/
		setCritirias: function () {
			//get the course differentiation levels
			var differential_levels = courseModel.getDifferentiationLevels();

			//if doesn't exists stop the execution
			if (!differential_levels || !differential_levels.length) {
				this.view.setRelationState(true, true);
				return;
			}
			
			//result always save as percents, use this constant for calculate level score
			var totalScore = 100;
			//divide the total score in levels count
			var levScore =  100 / differential_levels.length;
			var from_score;
			var to_score


			//build the default structure for each level see #DIFFERENTIAL_CRITIRIA
			var recommendationCriteria = [];
			_.each(differential_levels, function (diffLevel, i) {
				from_score = Math.round(to_score ? to_score : 0);
				to_score = Math.round((i === (differential_levels.length - 1)) ? totalScore : from_score + levScore);


				recommendationCriteria.push({				
					"feedback": "",
					"fromScore": from_score, //from and equal
					"toScoreNotEqual": to_score,	//to and not equal
					"score": null,
					"targetDiffLevelId" : diffLevel.id
				});
			}, this);
			repo.updateProperty(this.record.id, 'recommendationCriteria', recommendationCriteria, false, true);
		},
		setEvents: function () {
			var changes = {
                title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
                typicalLearningTime: this.propagateChanges(this.record, 'typicalLearningTime', true),
                taskWeight: this.propagateChanges(this.record, 'taskWeight', true),
                scoreType: this.propagateChanges(this.record, 'scoreType', true),
                useForDifferentialRecommendation: this.propagateChanges(this.record, 'useForDifferentialRecommendation', true),
                maxScore: this.propagateChanges(this.record, 'maxScore', true),
                redoQuizEnabled: this.propagateChanges(this.record, 'redoQuizEnabled', true),   
                redoQuizTitle: this.propagateChanges(this.record, 'redoQuizTitle', true),   
            };

            this.model = this.screen.components.props.startEditing(this.record, changes);

            this.model.on("change:redoQuizEnabled", function (model, val) {
            	if (val) {
            		this.view.setRedoState(true);
            	} else {
            		this.view.setRedoState(false);
            	}
            }.bind(this));

            this.model.on('change:useForDifferentialRecommendation', function (model, val) {
            	this.view.setRelationState(!val)
            }.bind(this));

            this.model.on('change:taskWeight', function (model, val) {
            	this.setTaskScore(val);
            }.bind(this));

            this.model.on('change:scoreType', function (model, val) {
            	if (val === 'BADGES') {
            		repo.startTransaction({ appendToPrevious: true });
            		this.showBadges = true;
            		repo.updateProperty(this.record.id, 'maxScore', 1);

            		var recommendationCriteria = require('cgsUtil').cloneObject(this.record.data.recommendationCriteria);
            		_.each(recommendationCriteria, function (item) {
            			item.score = 1;
            		});
            		repo.updateProperty(this.record.id, 'recommendationCriteria', recommendationCriteria);
            		repo.endTransaction();
            		
            		this.view.setBadgesState(true);
            	} else {
            		this.showBadges = false;
            		this.view.setBadgesState(false)
            	}
            }.bind(this));
		},

		getOverallScore: function () {
			return this.record.data.taskWeight === 'equal' ? '100%' : require("lessonModel").getAssessmentTotalScore(this.record.id) + " Points";
		},

		setTaskScore: function (mode) {
			var progress = repo.getChildrenByTypeRecursive(this.record.id, "progress");
			var advancedProgress = repo.getChildrenByTypeRecursive(this.record.id, "advancedProgress");
			var unionTasks = _.union(progress, advancedProgress);

			repo.startTransaction({ appendToPrevious: true });

			_.each(unionTasks, function (item) {
				if (item.data.score) {
					repo.updateProperty(item.id, 'score', 1);
				}
			})

			this.setCritirias();

			repo.endTransaction();

			this.view.setOverallScore(this.getOverallScore());
		},

		update: function (key, data) {
			repo.updateProperty(this.record.id, key, data);
		},

		setDefaultData: function () {
			if (!this.record.data.recommendationCriteria) this.setCritirias();

			if (!this.record.data.useForDifferentialRecommendation) {
				repo.updateProperty(this.record.id, 'useForDifferentialRecommendation', false, false, true);
			}

			if (!this.record.data.taskWeight) {
				repo.updateProperty(this.record.id, 'taskWeight', 'equal', false, true);
			}

			repo.updateProperty(this.record.id, 'pedagogicalLoType', 'quiz', true, true);

			this.showBadges = this.record.data.scoreType && this.record.data.scoreType === 'badges';
			this.showRetest = this.record.data.redoQuizEnabled;
		},

		getCritirias: function () {
			return {
				recommendationCriteria: this.record.data.recommendationCriteria,
				scoreType: this.record.data.scoreType,
				showBadges: this.showBadges,
				taskWeight: this.record.data.taskWeight,
				maxScore: this.record.data.maxScore
			}	
		},

		registerEvents: function() {
			this.bindEvents({
				'new_lesson_item':{'type':'register', 'func':function(args){
					var parent = this.config.id;
					if(args.type =="lo"){
						parent = this.record.parent;
					}
					var itemConfig= _.extend({parentId: parent}, args);
					events.fire('createLessonItem', itemConfig);
					} , 'ctx':this, 'unbind':'dispose'},

				'new_differentiated_sequence':{'type':'register', 'func':function(){
					events.fire('createDifferentiatedSequence', this.config.id, this);
					} , 'ctx':this, 'unbind':'dispose'},

				'new_separator': { 'type': 'register', 'func': function (args) {
                    var itemConfig = _.extend({parentId: this.config.id}, args);
                    events.fire('createSeparator', itemConfig);
                }, 'ctx': this, 'unbind': 'dispose'},

				'menu_lesson_item_delete':{'type':'register', 'func':function(){
					events.fire('delete_lesson_item', this.config.id);
					} , 'ctx':this, 'unbind':'dispose'}

			});	
		} 

	}, {type: 'QuizEditor'});

	return QuizEditor;

});
