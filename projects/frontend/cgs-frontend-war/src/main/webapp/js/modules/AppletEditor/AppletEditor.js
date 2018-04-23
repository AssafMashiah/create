define(['repo', 'appletFilesManager', 'PostMessageManager', 'localeModel', 'validate', 'BaseContentEditor', './config', './AppletStageView' , './AppletConfig'],
function(repo, appletFilesManager, PostMessageManager, localeModel, validate, BaseContentEditor, config, AppletStageView, appletConfig) {

	var cgsEventListner = {
		
		ready: function( config ) {
			this.apiVersion = _.isObject(config) ? (config.apiVersion || '1.0') : '1.0';
			var currentConfig = _.extend(_.clone(appletConfig[this.apiVersion].init), {locale : localeModel.getConfig('applet').locale.toLowerCase()});
			currentConfig.path = (parent.location.origin + parent.location.pathname);
			if( this.record.data.appletData){
				currentConfig.data = this.record.data.appletData;
			}
			this.supportedMethods = config && config.options && config.options.supportedMethods;
			this.messageManager.send( 'init', currentConfig, cgsEventListner.rendered );
		},
		
		rendered: function( config ) {
			if(config){
				$(document).find('iframe').width(config.width).height(config.height).removeClass('hidden');
			}
		},

		getAsset: function(config, callback) {
			appletFilesManager.getAsset(this.record.id, config.fileType, config.allowFiles, callback);
		},

		getZipAsset: function(config, callback) {
			appletFilesManager.getZipAsset(this.record.id, callback);
		},

		getAssetUrl: function(config, callback) {
			if (typeof callback == 'function')
				callback(appletFilesManager.getAssetUrl(this.record.id, config.assetId));
		},

		deleteAsset: function(config) {
			appletFilesManager.deleteAsset(this.record.id, config.assetId);
		},

		setAsset: function(config, callback) {
			appletFilesManager.setAsset(this.record.id, config.asset, config.assetName, callback);
		}
		
	} ;

	var AppletEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: AppletStageView,
				normal: AppletStageView
			});

			this._super(config, configOverrides);
			
			this.startStageEditing();

			this.messageManager = new PostMessageManager( window, this.stage_view.$frame[0].contentWindow, cgsEventListner, this ) ;
		},
		
		startStageEditing: function(){

			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},

		beforeClose: function( callback ) {
			
			thi$ = this ;
						
			
			this.messageManager.send( 'validate', null, function( data ) {
				
				var isValid = ( data === true ) || ( typeof data == "undefined" ) ;
				
				if( isValid ) {
					
					thi$.messageManager.send( 'getData', null, function( data ) {

						repo.startTransaction(!thi$.record.data.hasOwnProperty('appletData') ? { appendToPrevious: true } : null);
						
						repo.updateProperty( thi$.record.id, 'appletData', data ) ;
						
						thi$.messageManager.send( 'isDataCheckable', null, function( isDataCheckable ) {
							
							repo.updateProperty( thi$.record.id, 'isCheckable', !!isDataCheckable ) ;

							//update progress bar text if the applet is checkble in answer area
							var appletTask= repo.getAncestorRecordByType(thi$.record.id, 'appletTask') || repo.getAncestorRecordByType(thi$.record.id, 'livePageAppletTask');
							var appletAnswer = repo.getAncestorRecordByType(thi$.record.id , 'appletAnswer');
							if(appletTask && appletAnswer){
								var appletTaskProgress = repo.getChildrenByTypeRecursive(appletTask.id, 'progress');
								if(appletTaskProgress.length){
									appletTaskProgress = appletTaskProgress[0];
									repo.updateProperty(appletTaskProgress.id, 'button_label', !!isDataCheckable ? 'Check': 'Continue');
								}
							}
							

							var continueAppletPrepareClose = function(){
								// Get play size for api 1.1 or greater
								if (appletConfig[thi$.apiVersion].getPlaySize) {
									thi$.messageManager.send('getPlaySize', null, function(size) {
										repo.updateProperty(this.record.id, 'playSize', size);
										repo.endTransaction();
										callback();
									});
								}
								else {
									repo.endTransaction();
									callback();
								}
							};
							
							// method for plugin purpose
							if(thi$.supportedMethods && thi$.supportedMethods.indexOf('getCustomData') > -1){
								thi$.messageManager.send('getCustomData', null, function(customData){
									repo.updateProperty(thi$.record.id, 'customData', customData, false, true);
									continueAppletPrepareClose();
								});
							}else{
								continueAppletPrepareClose();
							}
						} ) ;
						
						
					} ) ;
					
				} else {
					
					var invalidations = null ;
					
					if( data instanceof Array ) {
						
						invalidations = data.join( '<br/>' ) ;
						
					} else {
						
						invalidations = [ "invalid data, no description given by applet" ] ;
						
					}
					
					$( '#errorArea' ).html( invalidations ) ;
				}
				
			});
		},

		dispose: function() {
			
			if (this.messageManager) {
				this.messageManager.destroy() ;
				this.messageManager = null ;
			}
			
			this._super() ;
			
		}

	}, { 
		type: 'AppletEditor',

		/**
		 * invalid if feeding include checking when the applet is placed in the Question or Shared Area
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid : function f34(elem_repo){
			//if parent is question or parent is shared area 
			//content can not include checking 
			var item = elem_repo;
			if( elem_repo.data.isCheckable &&
				(repo.getAncestorRecordByType(elem_repo.id,'question') ||
								repo.getAncestorRecordByType(elem_repo.id,'help') ||
								repo.getAncestorRecordByType(elem_repo.id,'sharedContent'))) {

					validate.uploadInvalidImg(elem_repo.id ,'media/not_valid_Applet.jpg', {width:126, height:126});
					return {
						valid : false,
						report : [validate.setReportRecord(elem_repo,'The applet cannot be set as checkable in the Question or Shared Content areas.')]
					};
			}
			return {valid : true,report : []};
		},
		getParentToValidate: function(elem_repo){
			var parent = repo.getAncestorRecordByType(elem_repo.id, 'appletAnswer');
			if(!parent){
				parent = repo.getAncestorRecordByType(elem_repo.id, 'appletWrapper') || repo.getAncestorRecordByType(elem_repo.id, 'livePageAppletWrapper');
			}
			return parent.id;

		}
	}) ;

	return AppletEditor ;

} ) ;
