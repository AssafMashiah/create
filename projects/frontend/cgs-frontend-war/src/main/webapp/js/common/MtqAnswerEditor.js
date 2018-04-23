define(['jquery', 'lodash','repo', 'repo_controllers', 'dialogs', 'events', 'BaseContentEditor'],
function($, _, repo, repo_controllers, dialogs, events,  BaseContentEditor) {

	var MtqAnswerEditor = BaseContentEditor.extend({

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		startEditing: function(){},

		changeUseBank: function(flag) {
			repo.updateChildrenProperty(this.record.id, "useBank", flag);
			if (flag) {
				this.createBank();
			} else {
				this.removeBank();
			}
			this.reloadStage();
		},

		createBank: function(){
			// create bank
			var bankCfg = {
				"type":"mtqBank",
				"parentId":this.record.id,
				"children": [],
				"data":{"title": "MtqBank", "disableDelete":true, "width":"100%",
						"answerType": this.record.data.answerType //answer type=  img/text/sound
					}
			};
			this.createNewItem(bankCfg, false);
		},

		removeBank: function(){
			var bank = repo.getChildrenRecordsByType(this.record.id, 'mtqBank');
			if (bank.length > 0){
				bank = bank[0];
				//remove from repo, and repo controllers
				repo.remove(bank.id);
			}
		},
		/*
		 function to open dialog that asks if the user is sure to cahnge definition/answer type
		 @param value - value user chose, editor type . {String}
		 @param options -  {rivets object}, after change in repo
		 */
		verifyChange: function(value, options){

			if(!!this.dontShowDialog) {
				return;
			}

			var commit_changes = true;

			if (value != this.model.previous(options.field)) {
				this.previousValue = this.model.previous(options.field);
				commit_changes = false;
				var callback = options.field == "answerType" ? this.changeAnswerType : this.changeDefinitionType;
				var displayName = options.field == "answerType" ? "Answer": "Definition";
				
				if (this.record.type === "matchingAnswer") {
					if (require("cgsUtil").validate_content(this.record.id)) {
						this.changeTypeNotification(callback, options, displayName);
					} else {
						this.onAnswerOrDefinitionTypeChange("yes", callback, options);
					}
				} else {
					this.changeTypeNotification(callback, options, displayName);
				}
			}

			if(commit_changes) { //commit repo changes
				options.commit();
			}

		},

		changeTypeNotification : function(continueCallback, options, displayName) {
			var dialogConfig = {

				title: "change "+ displayName+ " type",

				content: {
					text: "You have asked to change the "+displayName+" type. Changing the type will lose all current content. Are you sure you want to change the "+displayName+" type?",
					icon: 'warn'
				},

				buttons: {
					yes:		{ label: 'yes' },
					cancel:		{ label: 'cancel' }
				}

			};
			var eventName = 'on'+displayName+'TypeChange';
			events.once( eventName , function( response ) {
				this.onAnswerOrDefinitionTypeChange(response, continueCallback, options) ;
			}, this );

			var dialog = dialogs.create( 'simple', dialogConfig, eventName ) ;
		},

		onAnswerOrDefinitionTypeChange:function (response, continueCallback, options) {
			switch (response) {
				case 'cancel' :
					this.view.setType("#field_"+ options.field, this.record.data[options.field]); //return prev options type
					break;

				case 'yes' :
					repo.startTransaction();
					options.commit();  //perform repo update
					continueCallback.call(this);
					repo.endTransaction();

					require('validate').isEditorContentValid(this.record.id);
					break;
			}
		},

		changeAnswerType: function(){
			// create subAnswer child data to be changed to 
			var childData = this.buildChildData(this.record.data.answerType);
			var child = {
				"type":		this.record.data.answerType,
				"children": [],
				"data":		childData
			};
			repo.changeChildrenRecordsByTypeRecursively(this.elementId, 'mtqSubAnswer', this.previousValue, child);
			repo.updateChildrenProperty(this.elementId, 'answerType', this.record.data.answerType);
			// update answerType in the mtqMultiSubAnswers - if exists
			var multiAnswersArr = repo.getChildrenRecordsByTypeRecursieve(this.elementId, 'mtqMultiSubAnswer');
			_.each(multiAnswersArr, _.bind(function(child){
				repo.updateProperty(child.id, 'answerType', this.record.data.answerType);
			}, this));

			this.onChildrenUpdated();
		},

		changeDefinitionType: function(){
			// create subAnswer child data to be changed to 
			var childData = this.buildChildData(this.record.data.definitionType, {
														'type' : 'textViewer',
														'data' : {"styleOverride": "definition"}
												});
			var child = {
				"type":		this.record.data.definitionType,
				"children": [],
				"data":		childData
			};
			repo.changeChildrenRecordsByTypeRecursively(this.elementId, 'definition', this.previousValue, child);
			repo.updateChildrenProperty(this.elementId, 'definitionType', this.record.data.definitionType);
			this.onChildrenUpdated();
		},

		updateChildrenProps: function(){
			// need to be override
		},

		onChildrenUpdated: function(){
			this.updateChildrenProps();
			this.renderChildren();
			require('router').startEditingActiveEditor();
		},
		reloadStage: function () {
			this.stage_view.render();
			this.onChildrenUpdated();
		}

	},{	type: 'MtqAnswerEditor', stageReadOnlyMode: true});

	return MtqAnswerEditor;

});
