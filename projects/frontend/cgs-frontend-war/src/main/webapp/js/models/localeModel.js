define(['lodash', 'jquery', 'assets', 'files', 'zip_js', 'busyIndicator' , 'events', 'models/themingConfig'],
	function (_, $, assets, files, ZipJS, busy, events, DefaultThemingData) {

		var _defaultLocale = 'en_US',
			_locale = null,
			_customizationPackOverride = null,
			_dlDefaultStrings = null,
			_dlStrings = null,
			_dlStringsOverride = null,
			_fontListOverride = null,
			_defaultStylesAndEffects = null,
			_defaultConfig = null,
			_stylesAndEffects = null,
			_themingOverride = null;

		function addStyle(fileName) {
			var style = $('<link rel="stylesheet" data="localeCSS" type="text/css" />');
			style.attr('href', fileName);
			$('head').append(style);
		}

		function removeLocaleStyle() {
			$('link[data="localeCSS"]').remove();
		}

		function insertLocaleStyle() {
			removeLocaleStyle();
			window.cusomizationPackintervals = {};
			_.each(_locale && _locale.cssFiles, function (cssFile) {
				(function() {
					var intervalID = setInterval(function() {
						window.cusomizationPackintervals[intervalID] = true;
						var basePath = [
							'publishers', require('userModel').getPublisherId(),
							'courses', require('repo')._courseId, localeModel.baseDir
						].join('/');

						files.fileExists([basePath, cssFile].join('/'), function(exists) {
							if (exists) {
								addStyle(assets.absPath([localeModel.baseDir, cssFile].join('/')));
								clearInterval(intervalID);
								window.cusomizationPackintervals[intervalID] = false;
							}
						})
					}, 1000);
				})();
				
				// addStyle(assets.absPath([localeModel.baseDir, cssFile].join('/')));
			});
			_.each(localeModel.generatedCssFiles, addStyle);
		}

		function clearCustomizationPackOverride() {
			_customizationPackOverride = null;
			_fontListOverride = null;
			_themingOverride = null;
			require('styleAndEffectsUtil').clearModel();
			if (_stylesAndEffects) {
				_stylesAndEffects.hasChanges = false;
			}

		}

		function generateCssFiles(data) {
			var blob,
				styleAndEffectsUtil = require('styleAndEffectsUtil');

			localeModel.generatedCssFiles = [];

			if (!data) {
				styleAndEffectsUtil.dataToModel();
				data = {
					styleCssFile: styleAndEffectsUtil.createCssFile(styleAndEffectsUtil.model.styles, true),
					effectCssFile: styleAndEffectsUtil.createCssFile(styleAndEffectsUtil.model.effects, false),
					fontsCssFile: styleAndEffectsUtil.createFontsCssFile()
				};
			}

			blob = new Blob([data.styleCssFile], { type: 'text/css' });
			localeModel.generatedCssFiles.push(URL.createObjectURL(blob));

			blob = new Blob([data.effectCssFile], { type: 'text/css' });
			localeModel.generatedCssFiles.push(URL.createObjectURL(blob));

			blob = new Blob([data.fontsCssFile], { type: 'text/css' });
			localeModel.generatedCssFiles.push(URL.createObjectURL(blob));
		}

		function setCustomizationPack(callback) {
			loadDlStylesFile(function (stylesGenerated) {

				loadDlStringFile(function (stringsGenerated) {

					function continueSet() {
						loadConfigFile(function() {

							clearCustomizationPackOverride();
							generateCssFiles();
							insertLocaleStyle();
							if (_locale && _locale['direction']) {
								$('body').removeClass('rtl ltr').addClass(_locale['direction']);
							}
							checkForNewStrings(callback);

						});
					}

					if (stylesGenerated || stringsGenerated) {
						var manifest = require('repo').get(require('courseModel').getCourseId()).data.customizationPackManifest;
						files.saveObject(manifest, localeModel.manifestFile, [files.coursePath(), localeModel.baseDir].join('/'), continueSet);
					}
					else {
						continueSet();
					}


				});
			});
		}

		function loadConfigFile(callback) {
			var defaultsFilePath = [files.coursePath(), localeModel.baseDir, localeModel.defaultConfigPath].join('/'),
				overridesFilePath = [files.coursePath(), localeModel.baseDir, localeModel.overrideConfigPath].join('/'),
				overridesFile;

			// Merge srcJson (defaults) with overrJson (overrides)
			function mergeConfig(srcJson, overrJson) {
				// For each key/value in overrides
				_.each(overrJson, function(val, key) {
					if (_.isUndefined(srcJson[key])) {
						srcJson[key] = val;
						return;
					}
					// If overrides value is an array with length
					if(_.isArray(val) && val.length > 0) {
						// If overrides value array structure is [{key: ..., name: ...}]
						if ('key' in val[0] && 'name' in val[0]) {
							// Create a union of overrides and defaults and then filter out items with duplicated keys
							srcJson[key] = _.uniq(_.union(overrJson[key], srcJson[key]), 'key');
						} else if ('id' in val[0]) { // deals with the menu section in the config.
							srcJson[key] = _.uniq(_.union(overrJson[key], srcJson[key]), 'id');
						// if overrides value array structure is other
						} else {
							// Union overrides array with defaults array
							srcJson[key] = _.union(srcJson[key], overrJson[key]);
						}
					}
					// If overrides value is an object and not an array
					else if (_.isObject(val) && !_.isArray(val)) {
						// Merge overides value with defaults value
						mergeConfig(srcJson[key], val);
					}
					else { // If overrides value is either not an object, or an array
						// Override defaults value with overrides value
						srcJson[key] = val;
					}
				});
			}

			function loadDefaults() {
				files.fileExists(defaultsFilePath, function (defaultsResponse) {
					if (defaultsResponse) {
						files.loadObject(defaultsFilePath, function (configFile) {
							_defaultConfig = require('cgsUtil').cloneObject(configFile);
							_locale = configFile;
							mergeConfig(_locale, overridesFile);
							callback();
						});
					}
					else {
						callback();
					}
				});
			}

			// Load styles and effects overrides
			files.fileExists(overridesFilePath, function (overridesResponse) {
				if (overridesResponse) {
					files.loadObject(overridesFilePath, function (configFile) {
						overridesFile = configFile;
						loadDefaults();
					});
				}
				else {
					loadDefaults();
				}
			});
		}

		function loadDlStringFile(callback) {
			var defaultsFilePath = [files.coursePath(), localeModel.baseDir, localeModel.defaultDlStringsPath].join('/'),
				overridesFilePath = [files.coursePath(), localeModel.baseDir, localeModel.overrideDlStringsPath].join('/'),
				mergedFileName = localeModel.mergedDlStringsPath.substr(localeModel.mergedDlStringsPath.lastIndexOf('/') + 1),
				mergedPath = [files.coursePath(), localeModel.baseDir, localeModel.mergedDlStringsPath.substr(0, localeModel.mergedDlStringsPath.lastIndexOf('/'))].join('/'),
				overridesFile;

			function mergeStrings(srcFile, overrFile) {
				if (!_.isString(overrFile) || !overrFile) return srcFile;

				var srcStrings = srcFile.split('\n');
				var strings = overrFile.split('\n');
				_.each(strings, function(str) {
					if (str.indexOf('=') > -1) {
						var key = str.split('=')[0].trim();
						var index = _.findIndex(srcStrings, function(s) {
							return s.indexOf('=') > -1 && s.split('=')[0].trim() == key;
						});

						if (index > -1) {
							srcStrings[index] = str;
						}
					}
				});

				return srcStrings.join('\n');
			}

			function loadDefaults() {
				files.fileExists(defaultsFilePath, function (defaultsResponse) {
					if (defaultsResponse) {
						files.loadObject(defaultsFilePath, true, function (dlStrings) {
							_dlDefaultStrings = dlStrings;
							_dlStringsOverride = null;
							_dlStrings = mergeStrings(_dlDefaultStrings, overridesFile);
							files.saveObject(_dlStrings, mergedFileName, mergedPath, function() {
								var course = require('repo').get(require('courseModel').getCourseId()),
									manifest = course.data.customizationPackManifest,
									manifestUpdated = false;
								if (manifest.files.indexOf(localeModel.mergedDlStringsPath) == -1) {
									manifest = require('cgsUtil').cloneObject(manifest);
									manifest.files.push(localeModel.mergedDlStringsPath);
									require('repo').startTransaction({ ignore: true });
									require('repo').updateProperty(course.id, 'customizationPackManifest', manifest, false,true);
									require('repo').endTransaction();
									manifestUpdated = true;
								}
								callback(manifestUpdated);
							}, true);
						});
					}
					else {
						callback();
					}
				});
			}

			files.fileExists(overridesFilePath, function (overridesResponse) {
				if (overridesResponse) {
					files.loadObject(overridesFilePath, true, function (stringsFile) {
						overridesFile = stringsFile;
						loadDefaults();
					});
				}
				else {
					loadDefaults();
				}
			});
		}

		function loadDlStylesFile(callback) {
			var defaultsFilePath = [files.coursePath(), localeModel.baseDir, localeModel.defaultStylesPath].join('/'),
				overridesFilePath = [files.coursePath(), localeModel.baseDir, localeModel.overrideStylesPath].join('/'),
				mergedFileName = localeModel.mergedStylesPath.substr(localeModel.mergedStylesPath.lastIndexOf('/') + 1),
				mergedPath = [files.coursePath(), localeModel.baseDir, localeModel.mergedStylesPath.substr(0, localeModel.mergedStylesPath.lastIndexOf('/'))].join('/'),
				overridesFile;

			function mergeStyles(srcJson, overrJson) {
				srcJson = srcJson || {};
				_.each(overrJson, function(entity, eName) {
					if (!srcJson[eName]) {
						srcJson[eName] = require('cgsUtil').cloneObject(entity);
					}
					else {
						// Run over entity
						_.each(entity, function(rulesBlock) {
							var defaultBlock = _.find(srcJson[eName], { key: rulesBlock.key });
							// Run over css rules
							if (defaultBlock) {
								var index = 0,
									prevName = null;

								_.each(rulesBlock.cssArray, function(cssRule) {
									var defaultRule = _.where(defaultBlock.cssArray, { name: cssRule.name });

									index = prevName == cssRule.name ? (index + 1) : 0;

									if (defaultRule.length) {
										//override the default value if its not font-weight
										if (cssRule.value != 'inherit' || cssRule.name == "font-weight") {
											defaultRule[index].value = require('cgsUtil').cloneObject(cssRule.value);
										}
									}
									else {
										defaultBlock.cssArray.push(require('cgsUtil').cloneObject(cssRule));
									}
									prevName = cssRule.name;
								});

								if(rulesBlock.cssArray == null) {
									defaultBlock = _.merge(defaultBlock, rulesBlock);
								}
							}
							else {
								srcJson[eName].push(require('cgsUtil').cloneObject(rulesBlock));
							}
						});
					}
				});
			}

			function loadDefaults() {
				files.fileExists(defaultsFilePath, function (defaultsResponse) {
					if (defaultsResponse) {
						files.loadObject(defaultsFilePath, function (stylesFile) {
							_defaultStylesAndEffects = stylesFile;
							_stylesAndEffects = require('cgsUtil').cloneObject(_defaultStylesAndEffects);
							mergeStyles(_stylesAndEffects, overridesFile);
							files.saveObject(_stylesAndEffects, mergedFileName, mergedPath, function() {
								var course = require('repo').get(require('courseModel').getCourseId()),
									manifest = course.data.customizationPackManifest,
									manifestUpdated = false;
								if (manifest.files.indexOf(localeModel.mergedStylesPath) == -1) {
									manifest = require('cgsUtil').cloneObject(manifest);
									manifest.files.push(localeModel.mergedStylesPath);
									require('repo').startTransaction({ ignore: true });
									require('repo').updateProperty(course.id, 'customizationPackManifest', manifest,false,true);
									require('repo').endTransaction();
									manifestUpdated = true;
								}
								callback(manifestUpdated);
							}, true);
						});
					} else {
						callback();
					}
				});
			}

			// Load styles and effects overrides
			files.fileExists(overridesFilePath, function (overridesResponse) {
				if (overridesResponse) {
					files.loadObject(overridesFilePath, function (stylesFile) {
						overridesFile = stylesFile;
						loadDefaults();
					});
				}
				else {
					loadDefaults();
				}
			});
		}

		function checkForNewStrings(callback) {
			var url = location.origin + location.pathname;

			url = [url.substr(0, url.lastIndexOf('/')), 'locales', 'stringData.json'].join('/');

			var req = new XMLHttpRequest();

			req.responseType = 'blob'

			req.onload = function (XHRProgressEvent) {
				var blob = XHRProgressEvent.target.response;
				var fr = new FileReader();

				fr.onload = function () {
					var json = JSON.parse(fr.result);
					var localeConfig = localeModel.getConfig('stringData');

					function extendConfig(source, target) {
						_.each(source, function (val, key) {
							if (!target[key]) {
								target[key] = val;
							}
							else if (_.isObject(val)) {
								extendConfig(val, target[key]);
							}
						});

						_.each(_.difference(_.keys(target), _.keys(source)), function (key) {
							delete target[key];
						})

					}

					extendConfig(json, localeConfig);

					localeModel.setConfig('stringData', localeConfig);

					if (typeof callback == 'function') callback();

				};

				fr.readAsText(blob);
			};

			req.open('get', url);
			req.send();
		}

		function loadManifest(entry, callback) {
			entry.getData(new ZipJS.BlobWriter(), function (blob) {
				var fr = new FileReader();
				fr.onload = function () {
					var data = JSON.parse(fr.result),
						repo = require('repo'),
						courseId = require('courseModel').getCourseId(),
						oldManifest;
					localeModel.baseDir = data.baseDir = [localeModel.storageFolder, data.name, data.version].join('/');

					repo.updateProperty(courseId, 'customizationPackManifest', data);

					if (!window.customizationPackLoading) {
						require('events').fire('repo_changed');
					}
					if (typeof callback == 'function') callback();

				};

				fr.readAsText(blob);
			});
		}

		function getZipEntries(zipBlob, callback) {
			if (zipBlob instanceof ArrayBuffer) {
				zipBlob = new Blob([new DataView(zipBlob)]);
			}

			ZipJS.createReader(new ZipJS.BlobReader(zipBlob), function f1976(reader) {
				//get the files entries from the zip
				reader.getEntries(function f1977(entries) {
					callback(reader, entries);
				});
			});
		}

		// Upgrade customization pack structure
		function upgradePackStructure(manifest, callback) {
			var structureUpdates = [
					{
						version: '1.0',
						upgradeFunction: null
					},
					{
						version: '2.0',
						upgradeFunction: upgradeToVersion2
					}
				],
				isUpgraded = false,
				currentVersion = manifest.structureVersion || '1.0';

			(function update(index) {
				if (index < structureUpdates.length) {
					if (typeof structureUpdates[index].upgradeFunction == 'function') {
						isUpgraded = true;
						structureUpdates[index].upgradeFunction(manifest, function(newManifest) {
							manifest = newManifest
							update(index + 1);
						});
					}
					else {
						update(index + 1);
					}
				}
				else {
					if (isUpgraded) {
						require('repo').updateProperty(require('courseModel').getCourseId(), 'customizationPackManifest', manifest);
						callback(manifest, true);
					}
					else {
						updatePackDefault(manifest, function(newManifest) {
							if (newManifest && newManifest.version != manifest.version) {
								require('repo').updateProperty(require('courseModel').getCourseId(), 'customizationPackManifest', newManifest);
								callback(newManifest, true);
							}
							else {
								callback(manifest);
							}
						});
					}
				}
			})(_.findIndex(structureUpdates, { version: currentVersion }) + 1);
		}

		function upgradeToVersion2(manifest, callback) {

			var url = location.origin + location.pathname;
			url = [url.substr(0, url.lastIndexOf('/')), 'locales', manifest.name + '.zip?' + Date.now()].join('/');

			busy.start();

			function upgradeCallback(newManifest) {
				busy.stop();
				if (typeof callback == 'function') callback(newManifest);
			}

			function performUpgrade(oldManifest, newManifest) {
				/*
				1. Copy cgs/media to the new folder
				2. Copy dl/fonts to the new folder
				3. Extract config changes and save it in overrides/config.json
				4. Extract dl strings changes and save it in overrides/stringsOverrides.js
				5. Extract dl styles changes and save it in overrides/stylesOverrides.json
				6. Update files list in new manifest file and save it
				*/

				var oldCPFolder = [files.coursePath(), localeModel.storageFolder, oldManifest.name, oldManifest.version].join('/'),
					newCPFolder = [files.coursePath(), newManifest.baseDir].join('/');

				function extractChanges(originalPath, modifiedPath, isText, overridePath, compareFunction, extractCallback) {
					var overrideName = overridePath.substr(overridePath.lastIndexOf('/') + 1);

					overridePath = [newCPFolder, overridePath.substr(0, overridePath.lastIndexOf('/'))].join('/'),

					files.loadObject(originalPath, isText, function(originalObj) {
						files.fileExists(modifiedPath, function(f) {
							if (f) {
								files.loadObject(modifiedPath, isText, function(modifiedObj) {
									var changes = compareFunction(originalObj, modifiedObj);
									if (!_.isEmpty(changes)) {
										files.saveObject(changes, overrideName, overridePath, extractCallback, true);
									}
									else if (typeof extractCallback == 'function') {
										extractCallback();
									}
								});
							}
							else {
								extractCallback();
							}
						});
					});
				}

				function updateManifest(updateManifestCallback) {
					files.getFilesList(newCPFolder, function(filesList) {
						newManifest.files = filesList;
						newManifest.files.push(localeModel.manifestFile)
						files.saveObject(newManifest, localeModel.manifestFile, newCPFolder, updateManifestCallback.bind(this, newManifest));
					});
				}

				// -- 1 --
				var oldMediaPath = [oldCPFolder, 'cgs/media'].join('/'),
					newMediaPathParent = [newCPFolder, 'cgs/media'].join('/');
				files.copyFiles(oldMediaPath, newMediaPathParent, function() {
					// -- 2 --
					var oldFontsPath = [oldCPFolder, 'dl/fonts'].join('/'),
						newFontsPathParent = [newCPFolder, 'dl/fonts'].join('/');
					files.copyFiles(oldFontsPath, newFontsPathParent, function() {
						// -- 3 --
						var originalPath = [newCPFolder, localeModel.defaultConfigPath].join('/'),
							modifiedPath = [oldCPFolder, localeModel.defaultConfigPath].join('/');
						extractChanges(originalPath, modifiedPath, false, localeModel.overrideConfigPath, extractConfigChanges, function() {
							// -- 4 --
							originalPath = [newCPFolder, localeModel.defaultDlStringsPath].join('/'),
							modifiedPath = [oldCPFolder, localeModel.mergedDlStringsPath].join('/');
							extractChanges(originalPath, modifiedPath, true, localeModel.overrideDlStringsPath, extractStringsChanges, function() {
								// -- 5 --
								originalPath = [newCPFolder, localeModel.defaultStylesPath].join('/'),
								modifiedPath = [oldCPFolder, localeModel.mergedStylesPath].join('/');
								extractChanges(originalPath, modifiedPath, false, localeModel.overrideStylesPath, extractStylesChanges, function() {
									// -- 6 --
									updateManifest(upgradeCallback);
								});
							});
						});
					});
				});
			}

			function convertStructure(manifest) {
				/*
				1. Delete folders from cgs folder
				2. Delete styles.css, fonts.css, effects.css, system-font.css from cgs folder
				3. Copy dl/strings.js, dl/styles.json to Defaults folder
				4. Remove css files from config file
				5. Update files list and other data in new manifest file
				6. Upgrade customization pack version
				*/

				var packPath = [files.coursePath(), localeModel.storageFolder, manifest.name, manifest.version].join('/'),
					foldersToDelete = [
						'cgs/fonts',
						'cgs/systemFonts'
					],
					filesToDelete = [
						'cgs/effects.css',
						'cgs/fonts.css',
						'cgs/styles.css',
						'cgs/system-font.css'
					];

				function deleteEntities(paths, isFolders, deleteCallback) {
					var name = paths.shift();
					if (name) {
						if (isFolders) {
							files.removeDirectoryRecursive([packPath, name].join('/'), deleteEntities.bind(this, paths, isFolders, deleteCallback));
						}
						else {
							files.deleteFile([packPath, name].join('/'), deleteEntities.bind(this, paths, isFolders, deleteCallback));
						}
					}
					else if (typeof deleteCallback == 'function') {
						deleteCallback();
					}
				};

				// -- 1 --
				deleteEntities(foldersToDelete, true, function() {
					// -- 2 --
					deleteEntities(require('cgsUtil').cloneObject(filesToDelete), false, function() {
						var stringsPath = [packPath, localeModel.defaultDlStringsPath.substr(0, localeModel.defaultDlStringsPath.lastIndexOf('/'))].join('/'),
							stringsName = localeModel.defaultDlStringsPath.substr(localeModel.defaultDlStringsPath.lastIndexOf('/') + 1),
							stylesPath = [packPath, localeModel.defaultStylesPath.substr(0, localeModel.defaultStylesPath.lastIndexOf('/'))].join('/'),
							stylesName = localeModel.defaultStylesPath.substr(localeModel.defaultStylesPath.lastIndexOf('/') + 1);

						files._makeDirs([stringsPath, stylesPath], function() {
							// -- 3 --
							files.copyFileAndRename([packPath, localeModel.mergedDlStringsPath].join('/'), stringsPath, stringsName, function() {
								files.copyFileAndRename([packPath, localeModel.mergedStylesPath].join('/'), stylesPath, stylesName, function() {

									var cfgFile = [packPath, localeModel.defaultConfigPath].join('/'),
										cfgFilename = cfgFile.substr(cfgFile.lastIndexOf('/') + 1),
										cfgPath = cfgFile.substr(0, cfgFile.lastIndexOf('/'));
									// -- 4 --
									files.loadObject(cfgFile, function(cfg) {
										cfg.cssFiles = _.difference(cfg.cssFiles, filesToDelete);
										files.saveObject(cfg, cfgFilename, cfgPath, function() {
											// -- 5 --
											files.getFilesList(packPath, function(filesList) {
												manifest.files = filesList;
												manifest.version = (parseFloat(manifest.version) + 0.0001).toFixed(4);
												manifest.structureVersion = '2.0';
												manifest.baseDir = [localeModel.storageFolder, manifest.name, manifest.version].join('/');;
												files.saveObject(manifest, localeModel.manifestFile, packPath, function() {
													// -- 6 --
													var parentFolder = packPath.substr(0, packPath.lastIndexOf('/')),
														oldName = packPath.substr(packPath.lastIndexOf('/') + 1);

													files.rename(parentFolder, oldName, manifest.version, function() {
														upgradeCallback(manifest);
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});

			}

			files._makeDirs([files.coursePath()], function () {
				files.downloadFile({
					url: url,
					filename: manifest.name + '.zip',
					callback: function (file) {
						file.file(function (f) {
							getZipEntries(f, function(reader, entries) {

								var manifestEntry = _.find(entries, { filename: localeModel.manifestFile });

								if (!manifestEntry || !_.any(entries, { filename: localeModel.defaultConfigPath })) {
									if (typeof callback == 'function') callback();
									throw new Error('The course pack doesn\'t include config file!');
								}

								entries = _.without(entries, manifestEntry);

								manifestEntry.getData(new ZipJS.BlobWriter(), function (blob) {
									var fr = new FileReader();
									fr.onload = function () {
										var data = JSON.parse(fr.result);

										data.version = (parseFloat(data.version) + 0.0001).toFixed(4);
										data.baseDir = [localeModel.storageFolder, data.name, data.version].join('/');

										localeModel.uploadFiles(entries, reader, data.baseDir, performUpgrade.bind(this, manifest, data));
									};

									fr.readAsText(blob);
								});
							});
						});
					},
					failCallback: function() {
						convertStructure(manifest);
					}
				});
			});
		}

		function extractConfigChanges(originalJson, modifiedJson, isRecursion) {
			var propsToOverride = ['mediaFiles', 'stringData', 'menu', 'styleAndEffectMapping', 'loTypes'],
				res = {};
			if (!isRecursion) {
				modifiedJson = _.pick(modifiedJson, propsToOverride);
			}
			_.each(modifiedJson, function(v, k) {
				if (!originalJson[k]) {
					res[k] = require('cgsUtil').cloneObject(v);
				}
				else if (originalJson[k] != v) {
					if (_.isArray(v)) {
						var a = _.sortBy(originalJson[k], function(item) { return JSON.stringify(item); }),
							b = _.sortBy(v, function(item) { return JSON.stringify(item); });
						if (!_.isEqual(a, b)) {
							res[k] = require('cgsUtil').cloneObject(v);
						}
					}
					else if (_.isObject(v)) {
						var changes = extractConfigChanges(originalJson[k], v, true);
						if (changes) {
							res[k] = changes;
						}
					}
					else {
						res[k] = require('cgsUtil').cloneObject(v);
					}
				}
			});
			if (!_.isEmpty(res)) {
				return res;
			}
		}

		function extractStringsChanges(originalStrings, modifiedStrings) {
			if (!_.isString(modifiedStrings)) return null;

			var defaultStrings = originalStrings.split('\n'),
				strings = modifiedStrings.split('\n'),
				result = [];
			_.each(strings, function(str) {
				if (str.indexOf('=') > -1) {
					var key = str.substr(0, str.indexOf('=')).trim(),
						val = str.substr(str.indexOf('=') + 1).trim();

					while ([' ', ';'].indexOf(val[val.length - 1]) > -1) val = val.substr(0, val.length - 1);

					var original = _.find(defaultStrings, function(s) {
						return s.indexOf('=') > -1 && s.substr(0, s.indexOf('=')).trim() == key;
					});

					if (original) {
						var originalValue = original.substr(original.indexOf('=') + 1).trim();

						while ([' ', ';'].indexOf(originalValue[originalValue.length - 1]) > -1) originalValue = originalValue.substr(0, originalValue.length - 1);

						if (val != originalValue) {
							result.push(str);
						}
					}
				}
			});

			return result.join('\n');
		}

		function extractStylesChanges(originalJson, modifiedJson) {
			var result = {},
				cgsUtil = require('cgsUtil');
			_.each(modifiedJson, function(entity, name) {
				// Entity not found in original styles file - copy whole entity
				if (!originalJson[name]) {
					result[name] = cgsUtil.cloneObject(entity);
				}
				else {
					_.each(entity, function(rulesBlock) {
						if (!rulesBlock) return;
						var originalBlock = _.find(originalJson[name], { key: rulesBlock.key });
						// Rules block not found in original styles file - copy whole block (new style / effect)
						if (!originalBlock) {
							result[name] = result[name] || [];
							result[name].push(cgsUtil.cloneObject(rulesBlock));
						}
						else if(originalBlock.cssArray == null) {
							result[name] = result[name] || [];
							result[name].push(_.merge(originalBlock, rulesBlock));
						}
						else {
							// Search for missing rules - these rules were deleted from original style / effect, insert 'inherit' value for them
							_.each(originalBlock.cssArray, function(rule) {
								var newRule = _.find(rulesBlock.cssArray, { name: rule.name });
								if (!newRule) {
									result[name] = result[name] || [];
									if (!_.find(result[name], { key: originalBlock.key })) {
										result[name].push({
											key: originalBlock.key,
											cssArray: []
										});
									}
									newRule = cgsUtil.cloneObject(rule);
									newRule.value = 'inherit';
									_.find(result[name], { key: originalBlock.key }).cssArray.push(newRule);
								}
							});

							var index = 0,
								lastName = null;

							// Search for new / updated rules
							_.each(rulesBlock.cssArray, function(rule) {
								var originalRule = _.where(originalBlock.cssArray, { name: rule.name });

								index = rule.name == lastName ? (index + 1) : 0;

								// New rule - copy the whole rule
								if (!originalRule.length) {
									result[name] = result[name] || [];
									if (!_.find(result[name], { key: rulesBlock.key })) {
										result[name].push({
											key: rulesBlock.key,
											cssArray: []
										});
									}
									_.find(result[name], { key: rulesBlock.key }).cssArray.push(cgsUtil.cloneObject(rule));
								}
								// Rule value changed - copy all rules with same name
								else if (JSON.stringify(rule.value) != JSON.stringify(originalRule[index].value)) {
									result[name] = result[name] || [];
									if (!_.find(result[name], { key: rulesBlock.key })) {
										result[name].push({
											key: rulesBlock.key,
											cssArray: []
										});
									}
									var block = _.find(result[name], { key: rulesBlock.key });
									if (!_.any(block.cssArray, { name: rule.name })) {
										_.each(_.where(rulesBlock.cssArray, { name: rule.name }), function(newRule) {
											block.cssArray.push(cgsUtil.cloneObject(newRule));
										});
									}
								}
								lastName = rule.name;
							});
						}
					});
				}
			});

			return result;
		}

		function updatePackDefault(manifest, callback) {

			var url = location.origin + location.pathname;

			url = [url.substr(0, url.lastIndexOf('/')), 'locales'].join('/');

			function getLatestVersion(name, onVersionReceived) {
				files.downloadFile({
					url: [url, 'versions.json?' + Date.now()].join('/'),
					filename: 'versions.json',
					callback: function(file) {
						file.file(function (f) {
							var fr = new FileReader;

							fr.onload = function(e) {
								try {
									var versions = JSON.parse(e.target.result);
									if (typeof onVersionReceived == 'function') {
										onVersionReceived(versions[name]);
									}
								}
								catch (e) {
									if (typeof onVersionReceived == 'function') {
										onVersionReceived();
									}
								}
							}

							fr.onerror = function() {
								if (typeof onVersionReceived == 'function') {
									onVersionReceived();
								}
							}

							fr.readAsText(f);
						});
					}
				});
			}

			getLatestVersion(manifest.name, function(lastVersion) {

				var currentVersion = manifest.version.split('.'),
					packPath = [files.coursePath(), localeModel.storageFolder, manifest.name, manifest.version].join('/');
				var update = false;
				lastVersion = lastVersion.split('.');
				while (currentVersion[1].length < 4) currentVersion[1] += "0";
				while (lastVersion[1].length < 4) lastVersion[1] += "0";
				
				for (var i in lastVersion) {
					if (!lastVersion[i] || parseInt(lastVersion[i]) < parseInt(currentVersion[i])) {
					    break;
					} else if (lastVersion[i] && parseInt(lastVersion[i]) > parseInt(currentVersion[i])) {
						update = true;
						break;
					}
				}

				if (!update) {
					if (typeof callback == 'function') {
						callback(manifest);
						return;
					}
				}

				/*
				1. Download pack
				2. Copy files into customization pack folder
				3. Update files list in manifest and save it
				4. Rename cp folder to new version
				5. Save course with new manifest
				*/

				// -- 1 --
				files._makeDirs([files.coursePath()], function () {
					files.downloadFile({
						url: [url, manifest.name + '.zip?' + Date.now()].join('/'),
						filename: manifest.name + '.zip',
						callback: function (file) {
							file.file(function (f) {
								getZipEntries(f, function(reader, entries) {
									// -- 2 --
									localeModel.uploadFiles(entries, reader, [localeModel.storageFolder, manifest.name, manifest.version].join('/'), function() {
										// -- 3 --
										files.loadObject([packPath, localeModel.manifestFile].join('/'), function(newManifest) {
											files.getFilesList(packPath, function(filesList) {
												newManifest.files = filesList;
												newManifest.baseDir = [localeModel.storageFolder, newManifest.name, newManifest.version].join('/')
												files.saveObject(newManifest, localeModel.manifestFile, packPath, function() {
													// -- 4 --
													var parentFolder = packPath.substr(0, packPath.lastIndexOf('/')),
														oldName = packPath.substr(packPath.lastIndexOf('/') + 1);
													files.rename(parentFolder, oldName, newManifest.version, function() {
														callback(newManifest);
													});
												});
											});
										});
									});
								});
							});
						}
					});
				});
			});
		}

		function LocaleModel() {
			ZipJS.workerScriptsPath = 'js/libs/zipjs/';

			this.storageFolder = 'customizationPack';
			this.manifestFile = 'manifest.json';

			this.defaultConfigPath = 'cgs/config.json';
			this.overrideConfigPath = 'overrides/config.json';

			this.defaultDlStringsPath = 'defaults/stringsDefaults.js';
			this.overrideDlStringsPath = 'overrides/stringsOverrides.js';
			this.mergedDlStringsPath = 'dl/strings.js';

			this.defaultStylesPath = 'defaults/stylesDefaults.json';
			this.overrideStylesPath = 'overrides/stylesOverrides.json';
			this.mergedStylesPath = 'dl/styles.json';

		}

		_.extend(LocaleModel.prototype, {

			setLocale: function (localeName, clearLocale, callback) {

				if (typeof clearLocale == 'function') {
					callback = clearLocale;
					clearLocale = false;
				}

				if (clearLocale || !localeName) {
					_locale = null;
					_dlStrings = null;
					this.baseDir = "";
					require('styleAndEffectsUtil').clearModel();
					_stylesAndEffects = null;
					_themingOverride = null;
				}

				var course = require('repo').get(require('courseModel').getCourseId()),
					self = this;

				if (course.data.customizationPackManifest && !clearLocale) {
					var manifest = course.data.customizationPackManifest;
					upgradePackStructure(manifest, function(newManifest, needSave) {
						this.baseDir = newManifest.baseDir;
						if (needSave) {
							setCustomizationPack(function() {
								require('repo').reset();
								require('courseModel').saveCourse(callback, true);
							});
						}
						else {
							setCustomizationPack(callback);
						}
					}.bind(this));
				}
				else if (localeName) {
					var url = location.origin + location.pathname,
						path = files.coursePath() + '/',
						index,
						paths = [];

					url = [url.substr(0, url.lastIndexOf('/')), 'locales', localeName + '.zip?' + Date.now()].join('/');

					busy.start();

					while ((index = path.indexOf('/', index + 1)) != -1) {
						paths.push(path.substr(0, index));
					}

					files._makeDirs(paths, function () {
						files.downloadFile({
							url: url,
							filename: localeName + '.zip',
							callback: function (file) {
								file.file(function (f) {
									self.loadCustomizationPack(f, function () {
										busy.stop();
										if (typeof callback == 'function') callback();
									});
								})
							}
						});
					})

				}
				else {
					insertLocaleStyle();
					if (typeof callback == 'function') callback();
				}
			},

			setDefault: function () {
				this.setLocale(_defaultLocale);
			},
			setNewVersion: function (newVersion) {
				var customizationPackDirs = this.baseDir.split('/');
				customizationPackDirs.splice(customizationPackDirs.length - 1, 1);
				this.baseDir = customizationPackDirs.concat([newVersion]).join('/');

				insertLocaleStyle();
			},

			getCustomizationPackName: function () {
				return this.getLocale().name + '.zip';
			},

			getLocale: function () {
				if (_customizationPackOverride) {
					return require('cgsUtil').cloneObject(_customizationPackOverride);
				}
				return require('cgsUtil').cloneObject(_locale);
			},
			updateCustomizationOverride: function (data) {

				_customizationPackOverride = data;
				require('courseModel').setDirtyFlag(true);
			},

			getConfig: function (configName) {
				if (_customizationPackOverride) {
					return require('cgsUtil').cloneObject(_customizationPackOverride[configName]);
				}
				return _locale && require('cgsUtil').cloneObject(_locale[configName]);
			},

			setConfig: function (configName, configValue) {
				if (_customizationPackOverride) {
					_customizationPackOverride[configName] = configValue;
				}
				else if (_locale) {
					_locale[configName] = configValue;
				}
			},

			getCSSLinks: function (fileName) {

				//put cgsStyles.css the first of the array. so that the other css will always ovverride the data if there are conflicts
				if (_locale.cssFiles.splice(_locale.cssFiles.indexOf("cgs/cgsStyles.css"), 1).length) {
					_locale.cssFiles.unshift("cgs/cgsStyles.css");
				}
				var links = _.map(_locale.cssFiles,function (fileName) {
					return '<link rel="stylesheet" data="localeCSS" type="text/css" href="' + assets.absPath([localeModel.baseDir, fileName].join('/')) + '?' + Date.now() + '" />';
				}).join('');
				links += _.map(this.generatedCssFiles, function(cssUrl) {
					return '<link rel="stylesheet" data="localeCSS" type="text/css" href="' + cssUrl + '" />';
				}).join('');

				return links;
			},
			getDLStrings: function () {
				if (_dlStringsOverride) {
					return require('cgsUtil').cloneObject(_dlStringsOverride);
				}
				return require('cgsUtil').cloneObject(_dlStrings);
			},
			updateDLStringsFile: function (string) {
				_dlStringsOverride = string;
				require('courseModel').setDirtyFlag(true);
			},

			uploadLocale: function (callback) {
				var dialogConfig = {
					title: "Upload Locale File",
					buttons: {
						yes: { label: 'Done' }
					},
					closeOutside: false,

				};

				callback = callback || function () {
				};
				events.once('afterUploadLocale', callback, this);

				require('dialogs').create('localeUpload', dialogConfig, 'afterUploadLocale');
			},

			loadCustomizationPack: function (zipBlob, callback, dontOverrideStringData) {
				var self = this,
					originalBaseDir = this.baseDir;

				getZipEntries(zipBlob, function(reader, entries) {
					if (dontOverrideStringData) {
						// get config.json + system fonts files
						var entriesToUpload = _.filter(entries, function (entry) {
							return	entry.filename.indexOf('DL-Iconfont_normal') > -1 ||
								entry.filename.indexOf('Text-Editor-Iconfont_normal') > -1 ||
								entry.filename.indexOf('dl/config.json') > -1;
						});

						self.uploadFiles(entriesToUpload, reader, null, function () {
							var configEntry = _.where(entries, {'filename': 'cgs/config.json'});
							if (configEntry.length) {
								configEntry[0].getData(new ZipJS.BlobWriter(), function (blob) {
									var fr = new FileReader();
									fr.onload = function () {
										var data = JSON.parse(fr.result);
										var locale = self.getLocale();
										if (data['loTypes'])
											locale['loTypes'] = data['loTypes'];
										if (data['name']) {
											locale['name'] = data['name'];
										}

										self.updateCustomizationOverride(locale);
										if (typeof callback == 'function') callback();

									};

									fr.readAsText(blob);
								});
							} else {
								callback();
							}
						});
					} else {

						var manifestEntry = _.find(entries, function (entry) {
							return entry.filename == self.manifestFile;
						});

						if (!manifestEntry || !_.where(entries, { filename: self.defaultConfigPath }).length) {
							if (typeof callback == 'function') callback();
							throw new Error('The course pack doesn\'t include config file!');
						}
						loadManifest(manifestEntry, function () {
							files.emptyDir(files.coursePath(undefined, undefined, self.storageFolder), self.uploadFiles.bind(self, entries, reader, null, setCustomizationPack.bind(self, callback)));
						});
					}
				});
			},

			uploadFiles: function (entries, reader, basePath, callback) {
				var self = this,
					total = entries.length;

				basePath = basePath || this.baseDir;

				(function uploadItem(item) {
					if (!item) {
						reader.close();

						callback();
						return;
					}
					busy.setData('((Loading course pack))...', (total - entries.length) / total * 100);
					if (!item.directory) {
						item.getData(new ZipJS.BlobWriter(), function f1978(blob) {
							var path = [files.coursePath(), basePath, item.filename].join('/'),
								filename = item.filename.substr(item.filename.lastIndexOf('/') + 1),
								index,
								paths = [];

							while ((index = path.indexOf('/', index + 1)) != -1) {
								paths.push(path.substr(0, index));
							}
							path = path.substr(0, path.lastIndexOf('/'));

							//save the blob content as real file
							files._makeDirs(paths, function () {
								files._saveFile(filename, 'xxx', blob, path, function (file) {
									uploadItem(entries.shift());
								});
							});
						});
					}
					else {
						uploadItem(entries.shift());
					}
				})(entries.shift());

			},

			//read a font family zip and save its files in file system
			loadFontFamily: function (zipBlob, callback) {
				var self = this,
					originalBaseDir = this.baseDir;

				if (zipBlob instanceof ArrayBuffer) {
					zipBlob = new Blob([new DataView(zipBlob)]);
				}

				ZipJS.createReader(new ZipJS.BlobReader(zipBlob), function f1976(reader) {
					//get the files entries from the zip
					reader.getEntries(function f1977(entries) {

						//filter files in zip to font files
						var fontFiles = _.filter(entries, function (entry) {
							var extension = entry.filename.substring(entry.filename.lastIndexOf('.') + 1, entry.filename.length);
							return ['eot', 'ttf', 'woff', 'svg'].indexOf(extension) > -1;
						});
						//if no font files in the zip-show error
						if (!fontFiles.length) {
							if (typeof callback == 'function') callback();
							require('showMessage').clientError.show({'title': 'Embed Fonts',
								'message': 'The archive you uploaded does not include any of the supported font formats.'});
						}
						//check for font files that contains space in them- they are not valid
						var spaceFontFiles = _.map(_.filter(fontFiles, function (entry) {
							return entry.filename.indexOf(' ') != -1;
						}), function (fileSpaceEntry) {
							return fileSpaceEntry.filename;
						});
						if (spaceFontFiles.length) {
							fontFiles = _.filter(fontFiles, function (entry) {
								return entry.filename.indexOf(' ') == -1;
							});
						}

						var fontPaths = _.map(fontFiles, function (file) {
								return 'dl/fonts/' + file.filename.substring(file.filename.lastIndexOf('/') + 1, file.filename.length);
							}),
							cgsFontFolder = [files.coursePath(), self.baseDir, 'dl/fonts/'].join('/');

						if (!self.validateFontsFiles(fontPaths)) {
							require("busyIndicator").stop();
							require('showMessage').clientError.show({'title': 'Embed Fonts',
								'message': 'The archive you uploaded contains invalid fonts'});
							return;
						}
						//update the list of font files of the pack
						var currentFonts = localeModel.getFonts();
						localeModel.updateFontsFiles(_.union(currentFonts, fontPaths));
						self.updateFontsModel(fontFiles);
						var familiesAdded = _.keys(_.countBy(fontFiles, function (file) {
							return file.filename.substring(file.filename.lastIndexOf('/') + 1, file.filename.lastIndexOf('.'));
						})).length;

						//upload fonts to cgs font folder
						self.uploadFontFiles(fontFiles, reader, cgsFontFolder, function () {
							callback(familiesAdded, spaceFontFiles);

						});

					});
				});
			},

			updateFontsModel: function (fontFiles) {
				var model = require('styleAndEffectsUtil').getModel(),
					newFonts = [];
				if (!model) return;

				var fontFamilies = _.chain(fontFiles)
					.pluck('filename').
					map(function (name) {
						var startIndex = name.lastIndexOf('/');
						return name.substr(startIndex > -1 ? startIndex + 1 : 0, name.length);
					})
					.groupBy(function (name) {
						return name.substr(0, name.lastIndexOf('_'));
					})
					.mapValues(function (familyFonts) {
						return _.groupBy(familyFonts, function (name) {
							return name.substr(0, name.lastIndexOf('.'));
						});
					})
					.value();

				_.each(fontFamilies, function (fonts, familyName) {
					_.each(fonts, function (files, font) {
						var newFont = { key: font, cssArray: [] },
							src1 = '',
							src2 = [],
							weight = 'normal',
							style = 'normal';

						var effectDelimiter = (font.indexOf('+') > -1) ? '+' : ',';
						// Set additional font parameters (bold, italic)
						_.each(font.substr(font.lastIndexOf('_') + 1).split(effectDelimiter), function (effect) {
							switch (effect.toLowerCase()) {
								case 'italic':
									style = 'italic';
									break;
								case 'thin':
									weight = '100';
									break;
								case 'ultralight':
								case 'extralight':
									weight = '200';
									break;
								case 'light':
									weight = '300';
									break;
								case 'medium':
									weight = '500';
									break;
								case 'demibold':
								case 'semibold':
									weight = '600';
									break;
								case 'bold':
									weight = 'bold';
									break;
								case 'extrabold':
									weight = '800';
									break;
								case 'heavy':
								case 'black':
								case 'ultra':
								case 'ultrablack':
									weight = '900';
									break;
								case 'fat':
								case 'extrablack':
									weight = '1000';
									break;
							}
						});

						_.chain(files)
							.sortBy(function (filename) {
								var ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
								return ['eot', 'woff', 'ttf', 'svg', ext].indexOf(ext);
							})
							.each(function (filename) {
								var ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
								switch (ext) {
									case 'eot':
										src1 = [
											{
												url: 'fonts/' + filename,
												format: ''
											}
										];
										src2.push({
											url: 'fonts/' + filename + '?#iefix',
											format: 'embedded-opentype'
										});
										break;
									case 'woff':
										src2.push({
											url: 'fonts/' + filename,
											format: 'woff'
										});
										break;
									case 'ttf':
										src2.push({
											url: 'fonts/' + filename,
											format: 'truetype'
										});
										break;
									case 'svg':
										src2.push({
											url: 'fonts/' + filename,
											format: 'svg'
										});
										break;
								}
							});

						newFont.cssArray.push({ name: 'font-family', value: "'" + familyName + "'" });
						if (src1) {
							newFont.cssArray.push({ name: 'src', value: src1 });
						}
						newFont.cssArray.push({ name: 'src', value: src2 });
						newFont.cssArray.push({ name: 'font-weight', value: weight });
						newFont.cssArray.push({ name: 'font-style', value: style });

						newFonts.push(newFont);
					});
				});

				if (model.fonts instanceof Array) {
					model.fonts = _.union(model.fonts, newFonts);
				}
				else {
					model.fonts = newFonts;
				}
				_stylesAndEffects.hasChanges = true;
				//return newFonts;
			},

			//upload the font files to file system
			uploadFontFiles: function (entries, reader, basePath, callback) {
				var total = entries.length;

				(function uploadItem(item) {
					if (!item) {
						reader.close();
						callback();
						return;
					}
					busy.setData('((uploading font files))...', (total - entries.length) / total * 100);
					if (!item.directory) {
						item.getData(new ZipJS.BlobWriter(), function f1978(blob) {
							var path = basePath,
								filename = item.filename.substr(item.filename.lastIndexOf('/') + 1),
								index,
								paths = [];

							while ((index = path.indexOf('/', index + 1)) != -1) {
								paths.push(path.substr(0, index));
							}
							path = path.substr(0, path.lastIndexOf('/'));

							//save the blob content as real file
							files._makeDirs(paths, function () {
								files._saveFile(filename, 'xxx', blob, path, function (file) {
									uploadItem(entries.shift());
								});
							})
						});
					}
					else {
						uploadItem(entries.shift());
					}
				})(entries.shift());

			},

			getMediaFileData: function (fileId, callback) {
				var file = this.getConfig('mediaFiles')[fileId];
				if (file) {
					var filePath = [this.baseDir, 'cgs', file.name].join('/');

					files.getFile(undefined, undefined, filePath, function (file) {
						assets.uploadBlob(file, function _uploadBlob(f) {
							if (typeof callback == 'function') {
								callback($.extend(true, {}, file,
									{ path: files.removeCoursePath(undefined, undefined, f.filePath) }));
							}
						});
					})
				}
				else if (typeof callback == 'function') {
					callback();
				}
			},

			/*get a list of media paths that apears in the string data*/
			setMediaFilesForSave: function () {
				var media = {},
					paths = [],
					self = this;

				_.each(_customizationPackOverride.stringData.repo, function (value) {

					nameAndPath = self.getMediaNameAndPath(value);
					if (nameAndPath) {
						_.each(nameAndPath, function (item) {
							media[item.inlineName] = {'name': item.inlinePath};
							paths = _.union(paths, ['cgs/' + item.inlinePath]);
						});
					}
				});

				_.each(_customizationPackOverride.stringData.feedbacks, function (feefbackItem) {
					_.each(feefbackItem, function (feedback) {

						nameAndPath = self.getMediaNameAndPath(feedback.preliminary);
						if (nameAndPath) {
							_.each(nameAndPath, function (item) {
								media[item.inlineName] = {'name': item.inlinePath};
								paths = _.union(paths, ['cgs/' + item.inlinePath]);
							});
						}
						nameAndPath = self.getMediaNameAndPath(feedback.final);
						if (nameAndPath) {
							_.each(nameAndPath, function (item) {
								media[item.inlineName] = {'name': item.inlinePath};
								paths = _.union(paths, ['cgs/' + item.inlinePath]);
							});
						}
					});
				});

				return {'media': media, 'paths': paths};
			},

			getMediaNameAndPath: function (string) {
				var inline = $('<div>' + string + '</div>').find('inlinefile'), inlineName;
				if (inline.length) {
					var ans = [];
					_.each(inline, function (inlineItem) {
						inlineName = $(inlineItem).text();
						var inlinePath = _customizationPackOverride.mediaFiles[inlineName].name;
						ans.push({ 'inlineName': inlineName, 'inlinePath': inlinePath});
					});
					return ans;

				}
				return null;
			},

			//returns a new files array that contains all the files with only the media files that exists in string data
			updateMediaFilesInMenifest: function (customizationPackManifest, updetedMediaPaths) {

				var filesWithoutMedia = _.filter(customizationPackManifest.files, function (path) {
					var folders = path.split('/');
					return ( !_.contains(folders, 'media'))
				});

				return filesWithoutMedia.concat(updetedMediaPaths);
			},

			/*check if there is a local change in customization pack, and save changes with new pack version*/
			checkLocalCustomizationChanges: function (callback) {
				var course_id = require('courseModel').courseId,
					repo = require('repo'),
					customizationPackManifest = require('cgsUtil').cloneObject(repo.get(course_id).data.customizationPackManifest);

				this.checkStyleAndEffectChanges(customizationPackManifest, function (styleAndEffectResult) {
					this.checkDlStringsChanges(customizationPackManifest, function (dlResult) {
						this.checkCgsChanges(customizationPackManifest, function (cgsResult) {
							if (this.checkFontChanges(customizationPackManifest).hasChanges || styleAndEffectResult.hasChanges || cgsResult.hasChanges || dlResult.hasChanges) {
								this.updatecustomizationPackVersion(customizationPackManifest, function() {
									callback();
									generateCssFiles();
									insertLocaleStyle();
								});
							} else {
								callback();
							}
						}.bind(this));
					}.bind(this));
				}.bind(this));
			},
			checkStyleAndEffectChanges: function (manifest, callback) {
				var self = this;
				if (_stylesAndEffects && _stylesAndEffects.hasChanges) {
					var data = require('styleAndEffectsUtil').getDataForSave();

					//save dl/styles.json file
					if (_themingOverride) {
						data.dlStyleFile.theming = _themingOverride;
					} else {
						if (_stylesAndEffects.theming) {
							data.dlStyleFile.theming = _stylesAndEffects.theming;
						}
					}
					_stylesAndEffects = data.dlStyleFile;

					self.saveDLStylesFile(manifest, data.dlStyleFile, function () {
						if (_themingOverride) {
							_themingOverride = null;
						}
						_stylesAndEffects.hasChanges = false;
						callback({'hasChanges': true});
					});
				}
				else {
					if (_themingOverride) {
						var stylesFileData = this.getStylesAndEffects();
						stylesFileData.theming = _themingOverride;
						self.saveDLStylesFile(manifest, _.omit(stylesFileData, 'hasChanges'), function () {
							_themingOverride = null;
							_stylesAndEffects = stylesFileData;

							callback({'hasChanges': true});
						});
					} else {
						callback({'hasChanges': false});
					}
				}
			},

			saveDLStylesFile: function (manifest, data, callback) {
				var overrideFileName = this.overrideStylesPath.substr(this.overrideStylesPath.lastIndexOf('/') + 1),
					overridePath = [files.coursePath(), this.baseDir, this.overrideStylesPath.substr(0, this.overrideStylesPath.lastIndexOf('/'))].join('/'),
					mergedFileName = this.mergedStylesPath.substr(this.mergedStylesPath.lastIndexOf('/') + 1),
					mergedPath = [files.coursePath(), this.baseDir, this.mergedStylesPath.substr(0, this.mergedStylesPath.lastIndexOf('/'))].join('/');

				files.saveObject(extractStylesChanges(_defaultStylesAndEffects, data), overrideFileName, overridePath, function () {
					if (manifest.files.indexOf(this.overrideStylesPath) == -1) {
						manifest.files.push(this.overrideStylesPath);
					}
					files.saveObject(data, mergedFileName, mergedPath, function() {
						callback();
					}, true);
				}.bind(this), true);
			},

			hasFontChanges: function () {
				if (_fontListOverride) {

					var repo = require('repo');
					var fontFiles = _.filter(repo.get(require('courseModel').getCourseId()).data.customizationPackManifest.files,
						function (filePath) {
							return filePath.indexOf('dl/fonts/') > -1;
						});
					return _.groupBy(_.map(_.difference(_fontListOverride, fontFiles),
						function (path) {
							return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('_'));
						}));
				}
				return false;
			},

			//check if font files were changed
			checkFontChanges: function (manifest, callback) {

				if (_fontListOverride) {

					//get manifest files without the font  files
					var filesWithoutFonts = _.filter(manifest.files, function (filePath) {
							return filePath.indexOf('dl/fonts/') === -1;
						});

					//set in the manifest all the files and the new list of font files (from dl)
					manifest.files = filesWithoutFonts.concat(_fontListOverride);

					_fontListOverride = null;
					return {'hasChanges': true};

				} else {
					return {'hasChanges': false};
				}

			},

			//delete font files from file system
			deleteFonts: function (fontsPaths, callback) {

				//get full path of fonts to delete
				var fontsToDelete = _.map(fontsPaths, function (font) {
						return [files.coursePath(), localeModel.baseDir, font].join('/');
					}),

					total = fontsToDelete.length;

				(function deleteItem(item) {
					if (!item) {
						busy.stop();
						callback();
						return;
					}

					busy.setData('((deleting fonts))...', (total - fontsToDelete.length) / total * 100);
					files.deleteFile(item, function () {
						deleteItem(fontsToDelete.shift());
					});
				})(fontsToDelete.shift());
			},

			//check for changes in the strings.js file of the dl
			checkDlStringsChanges: function (manifest, callback) {
				var mergedFileName = this.mergedDlStringsPath.substr(this.mergedDlStringsPath.lastIndexOf('/') + 1),
					mergedPath = [files.coursePath(), this.baseDir, this.mergedDlStringsPath.substr(0, this.mergedDlStringsPath.lastIndexOf('/'))].join('/'),
					overrideFileName = this.overrideDlStringsPath.substr(this.overrideDlStringsPath.lastIndexOf('/') + 1),
					overridePath = [files.coursePath(), this.baseDir, this.overrideDlStringsPath.substr(0, this.overrideDlStringsPath.lastIndexOf('/'))].join('/');

				if (_dlStringsOverride) {
					//save dl/strings.js file
					files.saveObject(_dlStringsOverride, mergedFileName, mergedPath, function () {
						if (manifest.files.indexOf(localeModel.mergedDlStringsPath) == -1) {
							manifest.files.push(localeModel.mergedDlStringsPath);
						}
						//save overrides/overrideStrings.js file
						var changes = extractStringsChanges(_dlDefaultStrings, _dlStringsOverride);
						if (changes && changes.trim()) {
							files.saveObject(changes || '', overrideFileName, overridePath, function() {
								_dlStrings = _dlStringsOverride;
								_dlStringsOverride = null;
								if (manifest.files.indexOf(localeModel.overrideDlStringsPath) == -1) {
									manifest.files.push(localeModel.overrideDlStringsPath);
								}
								callback({ 'hasChanges': true});
							}, true);
						}
						else {
							callback({'hasChanges': false})
						}
					});
				}
				else {
					return callback({'hasChanges': false});
				}

			},
			//check if local changes were made in cgs config file
			checkCgsChanges: function (manifest, callback) {
				var course_id = require('courseModel').courseId,
					repo = require('repo'),
					customizationPackOverride = _customizationPackOverride;

				if (customizationPackOverride) {

					var updatedMediaFiles = this.setMediaFilesForSave();

					customizationPackOverride.mediaFiles = updatedMediaFiles.media;

					var fileName = this.overrideConfigPath.substr(this.overrideConfigPath.lastIndexOf('/') + 1),
						filePath = [files.coursePath(), manifest.baseDir, this.overrideConfigPath.substr(0, this.overrideConfigPath.lastIndexOf('/'))].join('/');

					//save cgs/config.json overrides file
					var changes = extractConfigChanges(_defaultConfig, customizationPackOverride);
					changes = _.isEmpty(changes) ? {} : changes;
					files.saveObject(changes, fileName, filePath, function() {
						manifest.files = this.updateMediaFilesInMenifest(manifest, updatedMediaFiles.paths);
						if (manifest.files.indexOf(this.overrideConfigPath) == -1) {
							manifest.files.push(this.overrideConfigPath);
						}
						//save new file list to repo in order to upload this list to the server
						repo.updateProperty(repo.get(course_id), 'customizationPackManifest', require('cgsUtil').cloneObject(manifest));
						_locale = customizationPackOverride;
						_customizationPackOverride = null;
						callback({ 'hasChanges': true});
					}.bind(this), true);
				} else {
					callback({'hasChanges': false});
				}
			},
			// update the version of the pack in manifest.json file & change the folder name to the new version
			updatecustomizationPackVersion: function (customizationPackManifest, callback) {
				logger.debug(logger.category.COURSE, 'Implement customization pack changes');

				var oldVersion = customizationPackManifest.version,
					oldBaseDir = customizationPackManifest.baseDir;

				customizationPackManifest.version = (parseFloat(customizationPackManifest.version) + 0.0001).toFixed(4);
				customizationPackManifest.baseDir = customizationPackManifest.baseDir.replace(oldVersion, customizationPackManifest.version);

				var filePath = [files.coursePath(), oldBaseDir].join('/');

				//save manifest.json file with the new version -and with other possible changes ( like media files in case of changes in cgs pack)
				files.saveObject(customizationPackManifest, this.manifestFile, filePath, _.bind(function () {

					require('repo').startTransaction({ ignore: true });
					require('repo').updateProperty(require('courseModel').courseId, 'customizationPackManifest', customizationPackManifest);
					require('repo').endTransaction();

					var customizationPackDirs = customizationPackManifest.baseDir.split('/');
					customizationPackDirs.splice(customizationPackDirs.length - 1, 1);

					parentDirectory = [files.coursePath()].concat(customizationPackDirs).join('/');

					//rename version folder to the updated version
					files.rename(parentDirectory, oldVersion, customizationPackManifest.version, _.bind(function () {
						localeModel.setNewVersion(customizationPackManifest.version);
						callback();
					}, this));

				}, this));

			},

			//{id: fileName, value : {"name": path}}
			addMediaFileToOverride: function (file) {
				if (!_customizationPackOverride.mediaFiles) {
					_customizationPackOverride.mediaFiles = {};

				}
				_customizationPackOverride.mediaFiles[file.id] = file.value;

			},
			validateFontsFiles: function (fonts) {
				var isValid = true;

				var fontsWithoutPrefix = _.map(fonts, function (fontPath) {
					return fontPath.replace('dl/fonts/', '');
				})

				_.each(fontsWithoutPrefix, function (font) {
					var parts = font.split("_");
					var familyName = parts[0];

					if (!familyName || parts.length < 2) {
						isValid = false;
					}
				})

				return isValid;
			},

			//get override font list (from the manifest)
			getFonts: function () {
				if (_fontListOverride) {
					return _fontListOverride;
				} else {
					var repo = require('repo');
					//return only the dl/fonts files
					var fontFiles = _.filter(repo.get(repo._courseId).data.customizationPackManifest.files,
						function (filePath) {
							return filePath.indexOf('dl/fonts/') > -1;
						});
					return fontFiles;
				}
			},

			//set an array of fonts paths- overides an older value if existed
			updateFontsFiles: function (fonts) {
				_fontListOverride = fonts;
				require('courseModel').setDirtyFlag(true);
			},

			setStyleChanges: function () {
				_stylesAndEffects.hasChanges = true;
				require('courseModel').setDirtyFlag(true);
			},

			//get the current state of the style and effeccts (including fonts and theming)- local saved changes
			getStylesAndEffects: function () {
				return require('cgsUtil').cloneObject(_stylesAndEffects);
			},

			//get the current state of the theming- local saved changes
			getThemingData: function () {
				return require('cgsUtil').cloneObject(_themingOverride);
			},

			//get the latest saved on course theming data
			getSavedTheming: function () {
				return (_stylesAndEffects.theming ? require('cgsUtil').cloneObject(_stylesAndEffects.theming) : null);
			},

			//get the default theming data and schema
			getThemingDefaults: function () {
				var repo = require('repo');
				var data = DefaultThemingData[repo.get(repo._courseId).data.contentLocales[0]];
				if (!data) {
					data = DefaultThemingData['default'];
				}
				return require('cgsUtil').cloneObject(data);
			},

			//update the theming data locallt saved
			//@theming : object - the new data
			//@playerChanged : string - the player in which the data was changed
			//@changedToDefault: boolean- true if "reset" happened on the player
			updateTheming: function (theming, playerChanged, changedToDefault) {

				//update the theming tp the new data
				_themingOverride = theming;

				//update the last modified property
				var date = new Date(),
					repo = require('repo'),
					courseThemingLastModified = require('cgsUtil').cloneObject(repo.get(repo._courseId).data.themingLastModified);

				//delete the tmp saved data
				if (changedToDefault && _stylesAndEffects.theming) {
					_stylesAndEffects.theming[playerChanged] = null;
				}

				if (!courseThemingLastModified) {
					courseThemingLastModified = {};
				}
				courseThemingLastModified[playerChanged] = changedToDefault ?
					require('translate').tran('course.props_area.tab_design.players_table.lastModified.defaultValue') :
					date.toDateString();

				repo.startTransaction({ ignore: true });
				repo.updateProperty(repo._courseId, 'themingLastModified', courseThemingLastModified);
				repo.endTransaction();
			},

			//copy the customization pack files, and update the theming to the current version, so the user can see applied changes
			setTmpCustomizationPack: function (themingData, callback) {
				var self = this;
				files.emptyDir([files.coursePath(), 'tmpCustomizationPack'].join('/'), function () {
					files.copyDirectory([files.coursePath(), self.baseDir].join('/'), files.coursePath(), 'tmpCustomizationPack', function () {

						var dataToSave = require('cgsUtil').cloneObject(_stylesAndEffects);
						dataToSave.theming = themingData;

						files.saveObject(dataToSave, 'styles.json', [files.coursePath(), 'tmpCustomizationPack/dl'].join('/'), function () {
							callback();
						});
					});
				});
			}

		});

		var localeModel = new LocaleModel();

		return localeModel;

	});
