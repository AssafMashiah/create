define(["jquery", "lodash", "FileUpload", "mustache",
	'text!common/fileUpload/iconAndFileUploadTemplate.html'],
	function($, _, FileUpload, Mustache, _template) {
	
	//**params**
	//itemId: item id in dom in which you put the icon and file upload.
	//repoItemName: name of the item in repo, to check if it exists and update the icon state
	//type: narration/ sound (for css purposes)
	//callback: function to handle the file upload
	//context: context of file upload callback function
	//itemId, repoItemName, type, callback, context, recordId, srcAttr, enableAssetManager
	function IconAndFileUpload(config) {
        var isOrder = _.where(config.context.record.data.assetManager, { state : false , srcAttr : config.srcAttr}).length,
			disableClass =  '';

		if(config.isMultiNarration){
			var locale = config.srcAttr.split('.')[1];
			if(!config.context.record.data.multiNarrations[locale]){
				disableClass= 'disabled';
			}

		}else{
			if(!config.context.record.data[config.repoItemName] || _.isEmpty(config.context.record.data[config.repoItemName])) {
				disableClass= 'disabled';
			}
		}


		
		this.data = {	initiator: config.context,
						callback: config.callback,
						iconClass: config.type + "_icon",
                        iconId: "icon_" + config.repoItemName,
						ButtonId: "Button_upload_" + config.repoItemName,
						iconDisabledClass:disableClass,
						iconOrderClass : isOrder? 'ordered': '',
						srcAttr: config.srcAttr
					};
		if (!(config.itemId instanceof $)) {
			config.itemId = $(config.itemId);
		}
		this.itemId = config.itemId;

		//append item to scrren
		config.itemId.append(Mustache.render(_template, this));

		var options = {};
		switch(config.type) {
			case 'sound':
			case 'narration':
				options = FileUpload.params.audio;
				break;
			case 'video':
				options = FileUpload.params.video;
				break;
		}

		//init file upload button
		new FileUpload({
			activator: config.itemId.find("." + this.data.ButtonId),
			options: options,
			callback: this.afterFileUpload,
			context: this,
			recordId: config.recordId,
			srcAttr: config.srcAttr,
			enableAssetManager: config.enableAssetManager,
			enableDelete: config.enableDelete,
			enableEdit: config.enableEdit,
			isNarration: config.isNarration,
			isMultiNarration: config.isMultiNarration
		});
	}

	IconAndFileUpload.prototype = {
		//after file upload function handler
		afterFileUpload: function(response, originalName, fileBlob, enableAssetManager){
			if(response) {
				response = require("assets").serverPath(response);
				var hasOrder =  enableAssetManager &&
					_.where(this.data.initiator.record.data.assetManager, {srcAttr :this.data.srcAttr ,  state : false});

				this.itemId.find("#" + this.data.iconId).removeClass(this.data.iconDisabledClass)
					[!!(hasOrder && hasOrder.length) ? 'addClass' : 'removeClass']('ordered');
			}
			else { // If no response (file was deleted) - disable icon
				this.data.iconDisabledClass = 'disabled';
				this.itemId.find("#" + this.data.iconId).addClass(this.data.iconDisabledClass).removeClass('ordered');;
			} 

			this.data.callback && this.data.callback.call(this.data.initiator || window, response);
		}	
	};
	
	return IconAndFileUpload;
});