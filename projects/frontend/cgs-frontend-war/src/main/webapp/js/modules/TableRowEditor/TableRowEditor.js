define(['BaseContentEditor', 'repo', 'repo_controllers', './config', './TableRowStageView', './TableRowSmallStageView'],
function(BaseContentEditor, repo, repo_controllers, config, TableRowStageView, TableRowSmallStageView) {

	var TableRowEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: TableRowSmallStageView,
				normal: TableRowStageView
			});

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
			}
		},

		/*
		** @param position - position to add cells to [optional, default=last]
		** @param numOfCells - number of cells to add [optional, default=1]
		*/
		addCells: function(options) {
			options = _.extend({numOfCells: 1, className: ''}, options || {});
			options.position = options.position >= 0 ? options.position : this.record.children.length

			for (var i = 0; i < options.numOfCells; i++) {
				var cellId = repo.set({
					parent: this.record.id,
					type: 'tableCell',
					children: [],
					data: {
						disableDelete: true,
						childType: 'None'
					}
				});
				var newChildren = require('cgsUtil').cloneObject(this.record.children);
				newChildren.splice(options.position, 0, cellId);
				repo.updateProperty(this.record.id, 'children', newChildren, true);
			}
		},

		/*
		** @param position - position to delete cells from [mandatory]
		** @param numOfCells - number of cells to delete [optional, default=1]
		*/
		removeCells: function(options) {
			options = _.extend({numOfCells: 1}, options || {});

			var cells = this.record.children.slice(options.position,options.position + options.numOfCells);
			_.each(cells, function(cellId) {
				repo.remove(cellId);
			});
		}

	}, {type: 'TableRowEditor',
		valid:function f1117(elem_repo) {
			// Validation
			if (elem_repo.children.length > 0)
				return { valid: true, report: [] };
			else
				return {
					valid: false,
					report:[
						{
							editorId: elem_repo.id,
							editorType: elem_repo.type,
							editorGroup: require('types')[elem_repo.type].group,
							msg: 'Table row without cells is not valid'
						}
					]
				}
		}
	});

	return TableRowEditor;

});
