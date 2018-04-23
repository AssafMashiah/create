define(["./models/multiNarrationConfigModel"], function(multiNarrationConfigModel) {

	function ConfigModel() {
		// get configuration params from index.html
		this.getConfig();
	}

	ConfigModel.prototype = {

		chromeVersion : 33,
		notSuttortedVersions : [32],

		setConfig: function (configuration) {
			this.configuration = configuration;
		},
		getConfig: function() { 
			return this.configuration;
		},
		getVersion: function () {
			return this.configuration.version;
		},
		getLocaleData: function (locale) {
			return _.find(multiNarrationConfigModel, function (item) {
				return item.locale === locale;
			});
		},
		getMultiNarrationsLocales: function () {
            var repo = require("repo"),
                courseLocale = repo.get(repo._courseId).data.contentLocales[0];
            
            
			return _.filter(multiNarrationConfigModel, 
                            function (item) { 
                                return item.locale !== courseLocale;
                            });
		},
		checkChromeVersion: function(callback){
			var openDialog = false;
			try{

				var chromeVersionString =_.where(navigator.appVersion.split(' '), function(versionString){
					return versionString.indexOf('Chrome')!== -1 ;
				});
				if(chromeVersionString.length){
					chromeVersion = parseInt( chromeVersionString[0].split('/')[1].split('.')[0]);
					if(this.notSuttortedVersions.indexOf(chromeVersion) !== -1 ){ //show mwssage if the user's installed version is on of the unsupported versions
						openDialog = true;
						var dialogConfig = {
							title: "Warning",
							content:{
								text: require('translate').tran("unsupported Chrome Version")+
									". </br>"+ require('translate').tran("you can find the installation")+
									" <a href='http://chrome.google.com'>"+require('translate').tran("here")+"</a>"	,
								icon:'warn'
							},
							buttons:{
								'yes': { label:'OK', value: true }
							},
							closeOutside: false
						};

						require('events').once('onUserDialogClose', function(val) {
							callback();
						}, this);

						require('dialogs').create('simple', dialogConfig, 'onUserDialogClose');
							
					}
					
				}
				if(!openDialog){
					callback();
				}

			} catch(err) {
				logger.error(logger.category.GENERAL, { message: 'Check google version failed',error: err });
				var dialogConfig = {
					title: "error",
					content:{
						text: "An error occurred when checking your Google Chrome browser version.",
						icon:'warn'
					},
					buttons:{
						'yes': { label:'OK', value: true }
					}
				};

				require('events').once('onUserDialogClose', function(val) {
					callback();
				}, this);

				require('dialogs').create('simple', dialogConfig, 'onUserDialogClose');
				
			}



		}

	};

	return new ConfigModel();

});
