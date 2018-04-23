define(
	['FileUpload', 'busyIndicator', 'events','modules/Dialogs/BaseDialogView','importSequenceUtil','text!modules/Dialogs/types/importSequence/importSequenceDialog.html'],
	function f643(FileUpload, busy, events, BaseDialogView, importSequenceUtil, template){
	
	var importSequenceDialogView = BaseDialogView.extend({
			
		render : function f644($parent){
			this._super( $parent,template );

			new FileUpload ({
				activator : "#import-sequence",
				options	: _.extend({
						is_ref: true,
						ignoreSizeLimit : true,
						uploadFileLocalyOnly : true
					},
					FileUpload.params.zip),
				callback : function f645(filepath){
					busy.start();
					$.when(importSequenceUtil.process(filepath))
					.fail(function(data){
					
					events.fire("terminateDialog");
						require('cgsUtil').createDialog('error.import.sequence.title',
						require('translate').tran('error.import.sequence.content') + "</br>" + data,'simple',{
						'cancel': {
							'label': 'Close'
						}
					},function(){});
					}).done(function(){
						events.fire("terminateDialog");

					})
					.always(function f646(){
						
						busy.stop();
						});
					}
				});
		}
	});

	return importSequenceDialogView;
});