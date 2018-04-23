define(['BaseContentEditor', 'repo', 'dialogs',
	'./AnswerLinkingStageView','./AnswerLinkingSmallStageView',
	'./AnswerLinkingPropsView','events'],
function(BaseContentEditor, repo, dialogs,AnswerLinkingStageView, AnswerLinkingViewLinkingSmallStageView,
	AnswerLinkingPropsView, events) {

	var AnswerLinkingEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: AnswerLinkingViewLinkingSmallStageView,
				normal: AnswerLinkingStageView
			});

			this._super({}, configOverrides);

			this.answerTypeBeforeChange = this.record.data.answerType;
			this.definitionTypeBeforeChange = this.record.data.definitionType;

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},
		registerEvents: function() {
			var changes = {
				interaction_type:  this.propagateChanges(this.record, 'interaction_type', true),
				answerType: this.propagateChanges(this.record, 'answerType', true),
				definitionType: this.propagateChanges(this.record, 'definitionType', true),
				random: this.propagateChanges(this.record, 'random', true),
				useBank: this.propagateChanges(this.record, 'useBank', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $(".linking_editor"));

			this.model.on('change:interaction_type', this.onInteractionTypeChange.bind(this));
			this.model.on("change:definitionType", this.changeTypeNotification.bind(this, "definitionType", 'Part A'));
			this.model.on("change:answerType", this.changeTypeNotification.bind(this, "answerType", 'Part B'));
			this.model.on("change:useBank", this.onSetDistructors.bind(this));


		},
		onSetDistructors: function f26() {
			var _is_bank_enabled = this.record.data.useBank;
            var _distructor_item;

			repo.startTransaction({ appendToPrevious: true });
			if (_is_bank_enabled) {

				_distructor_item = this.createItem({
					parentId: this.record.id,
					type: "distructors",
					data: { disableDelete: true, answerType: this.record.data.answerType, stageReadOnlyMode: true },
					children: []
				});

                //create the distructor child
                var childData = this.buildChildData(this.record.data.answerType);

				this.createItem({
					parentId: _distructor_item,
					type: this.record.data.answerType,
					data: childData
				});

				this.renderChildren();
			} else {
				_distructor_item = repo.getChildrenRecordsByType(this.record.id, "distructors");

				_distructor_item &&
					_distructor_item.length &&
						repo.remove(_distructor_item[0].id);

				this.renderChildren();
			}
            require('router').startEditingActiveEditor();
			repo.endTransaction();
		},
		changeTypeNotification : function(type, displayName) {
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

			if (require("cgsUtil").validate_content(this.record.id)) {
				var eventName = 'on'+displayName+'TypeChange';
				events.once( eventName , function( response ) {
					if (response === "yes") {
						this.changeLinkingType(type) ;
					} else {
						repo.revert();
						repo.startTransaction({ ignore: true });
						repo.updateProperty(this.record.id, type, this[type.concat("BeforeChange")]);
						repo.endTransaction();

						this.view.refresh();
						this.registerEvents();
					}
				}, this );
				dialogs.create( 'simple', dialogConfig, eventName ) ;
			} else {
				this.changeLinkingType(type) ;
			}
		},
		replaceItem : function(elementToReplaceId, type){

            var childData = this.buildChildData(type);

            var _object_id = this.createItem({
				parentId: repo.get(elementToReplaceId).parent,
				type: type,
				children: [],
				data: childData
			});

			repo.remove(elementToReplaceId);
			return _object_id;
		},

		changeDistructorType: function f27(type) {
			var childData = this.buildChildData(type);
			var distructor_element = repo.getChildrenRecordsByType(this.record.id, "distructors");

			if (distructor_element.length) {
				distructor_element = distructor_element[0];
				repo.updateProperty(distructor_element.id, 'answerType', type, false, true);

				_.each(distructor_element.children, function f28(item) {
					this.replaceItem(item,type);
				}, this);

				//set the delete button to the distructors if there are more then one distructor
				var distructorController = require("repo_controllers").get(distructor_element.id);
				distructorController.setDeletionState && distructorController.setDeletionState();
			}
		},

		/*change the children types of the definition or answer */
		/*@type- string, definition/ answer*/
		changeLinkingType: function f29(type) {
			var self = this;
			var _linking_pairs = repo.getChildrenRecordsByTypeRecursieve(this.record.id, "linking_pair");

			repo.startTransaction({ appendToPrevious: true });
			//function that replaces the child with a new element in the new type

			//loop over linking pairs and change the linking part A/B children type
			_.each(_linking_pairs, function f30(item) {

				var itemToReplace = repo.get(item.data[type.concat("Id")]);
				//in case of one-to-many linking (in sorting) we will change the inner elements
				if(itemToReplace.type ==  "mtqMultiSubAnswer"){
					var subAnswers = repo.getChildrenRecordsByTypeRecursieve(item.id, "linkingSubAnswer");
					_.each(subAnswers, function(subAnswer){
						self.replaceItem(subAnswer.children[0], self.record.data[type]);
					});
					repo.updateProperty(itemToReplace.id, "answerType",this.record.data[type]);
				}else{
					//case of one-to-one linking (matching) we'll replace the first child of the linking pair
					var _object_id = self.replaceItem(itemToReplace.id, this.record.data[type]);
					repo.updateProperty(item.id, type.concat("Id"), _object_id);
				}

				this[type.concat("BeforeChange")] = this.record.data[type];

			}, this);

			if (this.record.data.useBank && type !== "definitionType") {
				this.changeDistructorType(this.record.data[type]);
			}
			repo.endTransaction();
			require('repo_controllers').get(this.record.id).renderChildren();

			this.router.startEditingActiveEditor();

		},
		onInteractionTypeChange: function f31() {
			repo.startTransaction({ appendToPrevious: true });

			var parentType = repo.get(this.record.parent).type;
			require("cgsUtil").convertRepo(this.record.id, parentType =="sorting"? "sortingAnswer" : "matchingAnswer");

			var instructionTextViewerId = repo.getChildrenRecordsByType(this.record.parent, 'instruction')[0].children[0],
				instructionNewText = JSON.parse('"'+ require('localeModel').getConfig('stringData').repo[parentType == 'sorting' ? 'sortingInstruction' : 'matchingInstruction'] +'"');
            repo.updateProperty(instructionTextViewerId, 'title' , instructionNewText);
            //reset TEV properties
			repo.updateProperty(instructionTextViewerId, 'assetManager', null);
			repo.updateProperty(instructionTextViewerId, 'narration', null);
			repo.updateProperty(instructionTextViewerId, 'generalNarration', null);
			repo.updateProperty(instructionTextViewerId, 'narrationType', "0");



            repo._runAlignDataFunction(instructionTextViewerId, 'textViewer', function(){
				require("router").load(this.record.parent);
            }.bind(this));
            repo.endTransaction();

		},
		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new AnswerLinkingPropsView(config);

			this.registerEvents();
		}

	},{
		type: 'AnswerLinkingEditor', stageReadOnlyMode: true
	});

	return AnswerLinkingEditor;

});
