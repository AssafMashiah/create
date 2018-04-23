define(['BaseContentEditor','repo', 'repo_controllers',  './config', './MathfieldStageView', './MathfieldPropsView' ],
function(BaseContentEditor,repo, repo_controllers, config, MathfieldStageView, MathfieldPropsView) {

	var MathfieldEditor = BaseContentEditor.extend({

		initialize: function(configOverrides, inherited) {
			if (!inherited) {
				this.setStageViews({
					small: MathfieldStageView,
					normal: MathfieldStageView
				});
			}

			this._super(config, configOverrides);
			//init defaults
			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.record.id, 'italicVariables', 'true', false, true);
			repo.updateProperty(this.record.id, 'validate', 'false', false, true);
			repo.endTransaction();
		},
		startPropsEditing: function(view){
			this._super();
			this.view = view ? new view({controller:this}) : new MathfieldPropsView({controller:this});

			// If addParentProps is true, render parent's props into current props view
			// It's required for table cell props rendering
			var record = this.record;
			if (record && record.data && record.data.addParentProps) {
				this.view.$el.find('#properties').wrapInner('<div id="original-props" />');
				this.view.$el.find('#properties').prepend('<div id="parent_properties" />');

				var parentController = repo_controllers.get(record.parent);
				if (parentController) {
					parentController.startPropsEditing({
						'clearOnRender': false,
						'hideHeader': true,
						'contentSelector': '.tab-content #properties',
						'appendToSelector': '.tab-content #parent_properties'
					});
				}
				this.registerEvents('.tab-content #original-props');
			}
			else {
				this.registerEvents();
			}
		},

		registerEvents: function(propsContainer) {

			var changes = {
				colorShapes: this.propagateChanges(this.record, 'colorShapes', true),				
				maxHeight: this.propagateChanges(this.record, 'maxHeight', true),
				editMode: this.propagateChanges(this.record, 'editMode', true)
			};

			var model = this.screen.components.props.startEditing(this.record, changes, propsContainer ? $(propsContainer) : null);

		}

	}, {
		type: 'MathfieldEditor',
		defaultRepoData: function() {
			return {
				keyboardPreset:'contentEditorMathField',
				editMode:'on',
				fontLocale: require("localeModel").getConfig("mfConfig").fontLocale,
				autoComma:'false',
				validate:'false',
				devMode:'false',
				italicVariables: 'true',
				maxHeight: 'secondLevel'
			};
		},
		valid : function(elem_repo){
			if(_.isEmpty(elem_repo.data.markup)){
				return {
					valid: false,
					report: [require('validate').setReportRecord(elem_repo,'The Mathfield object does not have any content. Return to the editor and enter content.')],

				};
			}
			return  {valid : true,report:[]};
		}
	});

	return MathfieldEditor;

});
