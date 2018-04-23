define(['modules/BaseTaskEditor/BaseTaskEditor', './config','./constants', 'events', 'repo', 'types', './ClozeNormalStageView', './ClozeSmallStageView', './TaskTemplate'],
function(BaseTaskEditor, config, constants,events, repo, types, ClozeNormalStageView, ClozeSmallStageView , taskTemplate) {

	var ClozeEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: ClozeSmallStageView,
				normal: ClozeNormalStageView
			});

			this._super(config, configOverrides);

			//register to menu events 
			this.bindEvents({
				'setDefaultBankValues': {'type':'register', 'unbind':'dispose'},
				'checking_enabled_Changed' : {'type':'register', 'func': this.handleCheckingEnabledChanges , 'ctx': this, 'unbind':'dispose'}
			});

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		handleCheckingEnabledChanges : function f110() {
			var checkingEnabled = repo.getChildrenRecordsByType(this.record.id,'advancedProgress')[0].data.checking_enabled;
			if(require('lessonModel').getAssessmentType() == 'mixed') {
				if(!checkingEnabled){
					this.showComponent('rubric' , true);
				}
				else{
					this.showComponent('rubric' , false);
				}
			}
            repo.updateProperty(this.record.id, 'task_check_type', checkingEnabled ? "auto" : "manual");

		},

	},{	
		type: 'ClozeEditor',
		template: taskTemplate.template,
		showProperties: true,
		displayTaskDropdown: true,
		components: constants.components,
		valid: function f111(elem_repo) {
			var ret, valid = false;

			// _.each(elem_repo.children, function f112(childId) {
			// 	var child = repo.get(childId);
			// 	if(child.type == "question") { //There must be at least one component in the Question Area
			// 		valid = !!child.children.length;
			// 	}
			// });

			// if (valid) {
				ret = { valid:true, report:[] };
			// } else {
			// 	ret = { valid:false, report:[
			// 		{
			// 			editorId:elem_repo.id,
			// 			editorType:elem_repo.type,
			// 			editorGroup:types[elem_repo.type].group,
			// 			msg:'There must be at least one component in the Question Area'
			// 		}
			// 	]};
			// }

			return ret;
		}
	});

	return ClozeEditor;

});
