define(['jquery', 'cgsUtil', 'translate', 'modules/AssetsManagerEditor/AssetsManagerStageView',  'text!modules/NarrationsManagerEditor/templates/NarrationsManagerStage.html'],
function($,cgsUtil, tran, AssetsManagerStageView, template) {

	var NarrationsManagerStageView = AssetsManagerStageView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		
		tableToCsv : function(filename) {
		 	
			var el = $("#assets-table"),
				tmpRows = [];

			tmpRows.push([tran.tran('ID'), tran.tran('Type'), tran.tran('Narration Text'), tran.tran('assetToCsv.column.title.notes'), tran.tran('Status')]);
			$(el).find('tr:visible').each(function() {
				var tmpCols = [];

				$(this).find('td:visible').each(function(index) {
					if($(this).find('button, iframe').length > 0){
						return;
					}

					if($(this).find('select').length > 0 ){
						tmpCols.push($.trim($(this).find('select option:selected').text()));
					}
					else{
						var cell = $(this).clone();
						cell.find('.locale').remove();
						tmpCols.push($.trim(cell.text()));
					}
				});

				tmpRows.push(tmpCols)
			});

			cgsUtil.csv.download(filename,tmpRows);
		}
		
	}, {type: 'NarrationsManagerStageView'});

	return NarrationsManagerStageView;

});