define(['jquery', 'lodash','repo', 'repo_controllers','localeModel' ,'translate', 'dialogs', 'events', 'MtqAnswerEditor', './config', './SequencingAnswerPropsView','./SequencingAnswerStageView', './SequencingAnswerSmallStageView'],
function($, _, repo, repo_controllers,localeModel, i18n, dialogs, events,  MtqAnswerEditor, config, SequencingAnswerPropsView, SequencingAnswerStageView, SequencingAnswerSmallStageView) {

	var SequencingAnswerEditor = MtqAnswerEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: SequencingAnswerSmallStageView,
				normal: SequencingAnswerStageView
			});

			this._super(config, configOverrides);
		},

		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new SequencingAnswerPropsView(config);
			this.registerEvents();
		},

		registerEvents: function() {
			this.record = repo.get(this.config.id);
			var changes = {
				definitionType: this.propagateChanges(this.record, 'definitionType',  _.bind(this.verifyChange, this), true),
				answerType: this.propagateChanges(this.record, 'answerType',  _.bind(this.verifyChange, this), true),
				random: this.propagateChanges(this.record, 'random', true),
				useBank: this.propagateChanges(this.record, 'useBank', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $(".sequencingAnswer_editor"));

			this.model.on('change:useBank', function(m, value) {
				repo.startTransaction({ appendToPrevious: true });
				this.changeUseBank(value);
				//change the instruction acording to the sequence type 
				//(ordering/ sequencing - determined by the bank use)
				this.changeInstructionText(value);
				repo.endTransaction();
			}, this);

		},

		changeInstructionText: function(value){
			var mtq = repo.get(this.record.parent);
			var bank = repo.getChildrenRecordsByTypeRecursieve(mtq.id, 'mtqBank');

			//get the text to be written in the instruction
			var text = JSON.parse('"'+localeModel.getConfig('stringData').repo[config.instructions[bank.length]] +'"');

			var instruction = repo.getChildrenRecordsByTypeRecursieve(mtq.id, 'instruction');
			if(instruction.length){
				instruction = instruction[0];
				//get text viewer record from repo of instruction
				var instructionTextViewer = repo.getChildrenRecordsByTypeRecursieve(instruction.id, 'textViewer');
				if(instructionTextViewer.length){
					//set new instruction text
					instructionTextViewer = instructionTextViewer[0];
					repo.updateProperty(instructionTextViewer.id, 'title', text || "");
				}
				//reset TEV properties
				repo.updateProperty(instructionTextViewer.id, 'assetManager', null);
				repo.updateProperty(instructionTextViewer.id, 'narration', null);
				repo.updateProperty(instructionTextViewer.id, 'generalNarration', null);
				repo.updateProperty(instructionTextViewer.id, 'narrationType', "0");

				repo._runAlignDataFunction(instructionTextViewer.id, 'textViewer', function(){

					//reload instruction
					instructionController = repo_controllers.get(instruction.id);
					instructionController.onShowChange();
				});
			}
		}

	},{	type: 'SequencingAnswerEditor', stageReadOnlyMode: true});

	return SequencingAnswerEditor;

});
