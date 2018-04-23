define(['modules/AssetsManagerEditor/AssetsManagerEditor', 'repo', 'events', 'lessonModel', 'editMode', 'translate',
	'./config', './NarrationsManagerStageView', './NarrationsManagerSmallStageView', './NarrationRowView'],
	function(AssetsManagerEditor, repo, events, lessonModel, editMode, tran,
		config, NarrationsManagerStageView, NarrationsManagerSmallStageView, NarrationRowView ) {

		var NarrationsManagerEditor = AssetsManagerEditor.extend({

			initialize: function(configOverrides) {

				this.isNarration = true;

				this.setStageViews({
					normal: NarrationsManagerStageView
				});

                this._super(configOverrides);
			},
			
			tableToCsv : function f948(){
				if(_.isFunction(this.stage_view.tableToCsv)){
					this.stage_view.tableToCsv(tran.tran('Narrations Report') + ' - ' + repo.get(lessonModel.lessonId).data.title + '.csv');
				}
			},

			fillAssetsTable: function() {
				$('#stage_base').find('#assets-table tbody').empty();

				_.each(this.assets, function(asset) {
					new NarrationRowView({
						controller: this,
						obj: asset
					});
				}, this);
			}

		}, {type: 'NarrationsManagerEditor',
			setScreenLabel: 'NarrationsManager Content',
			showTaskSettingsButton: false,
			displayTaskDropdown: false});

		return NarrationsManagerEditor;

	});