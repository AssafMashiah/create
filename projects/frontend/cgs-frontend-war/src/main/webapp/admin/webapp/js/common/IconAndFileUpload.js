define(["jquery", "lodash", "FileUpload", "mustache"], function($, _, FileUpload, Mustache) {

	// internals
	var _template = "<div class='{{data.iconClass}} {{data.iconDisabledClass}}  inline-block' id='{{data.iconId}}'>\
	</div><button id='{{data.ButtonId}}' class='btn btn-small btn-position'>...</button>";
	
	
	//**params**
	//itemId: item id in dom in which you put the icon and file upload.
	//repoItemName: name of the item in repo, to check if it exists and update the icon state
	//type: narration/ sound (for css purposes)
	//callback: function to handle the file upload
	//context: context of file upload callback function
	//itemId, repoItemName, type, callback, context, recordId, srcAttr, enableAssetManager
	function IconAndFileUpload(config) {
		
		this.data = {	initiator: config.context,
						callback: config.callback,
						iconClass: config.type + "_icon",
                        iconId: "icon_" + config.repoItemName,
						ButtonId: "Button_upload_" + config.repoItemName,
						iconDisabledClass: config.context.record.data[config.repoItemName]? '' : 'disabled'
					};
		if (!(config.itemId instanceof $)) {
			config.itemId = $(config.itemId);
		}

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
			activator: "#" + this.data.ButtonId,
			options: options,
			callback: this.afterFileUpload,
			context: this,
			recordId: config.recordId,
			srcAttr: config.srcAttr,
			enableAssetManager: config.enableAssetManager
		});
	}

	IconAndFileUpload.prototype = {
		//after file upload function hendler
		afterFileUpload: function(response){
			if(response){
				$("#" + this.data.iconId).removeClass(this.data.iconDisabledClass);
				this.data.callback && this.data.callback.call(this.data.initiator || window, response);
			}
		}	
	};
	
	return IconAndFileUpload;
});
