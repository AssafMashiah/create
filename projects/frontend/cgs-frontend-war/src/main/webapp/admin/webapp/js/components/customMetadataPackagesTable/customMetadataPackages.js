define(['backbone','common/utils', 'components/customMetadataPackagesTable/customMetadataPackagesRowModel', 'components/customMetadataPackagesTable/customMetadataPackagesView'],
	function (Backbone, utils, customMetadataPackagesRowModel, customMetadataPackagesView) {


	var customMetaDataPackagesController = Backbone.Router.extend({
		
		/**
		* initialize
		* @param cfg: el: $, data: {}, updateCallback: fnc()
		*/
		initialize: function(cfg){

			this.updateCallback = cfg.updateCallback;
			
			this.view = new customMetadataPackagesView({
				el: cfg.el,
				data: cfg.data,
				controller : this
			});
			
			this.collection = new Backbone.Collection([], {model: customMetadataPackagesRowModel});

            this.collection.on('add remove', this.onCollectionAddRemove.bind(this));
			
			this.setModels(cfg.data);
		},

        onCollectionAddRemove: function() {
            var hideOrShow = (this.collection.length == 0);
            this.view.hideTable(hideOrShow);
        },

		setModels: function(data){
			_.each(data, this.addMetadataPackageModel, this);
		},

        readPackageFile: function (file) {
            this.fileReader = new FileReader();
            this.fileReader.onload = function() {
                this.processPackageFile(file);
            }.bind(this);

            try {
                this.fileReader.readAsText(file);
            } catch (e) {
                console.log('Reading metadata package file failed:', file.name);
                this.showErrorDialog("Reading metadata package file failed");
            }
        },

        processPackageFile: function (file) {
            var metadataPackage;

            try {
                metadataPackage = JSON.parse(this.fileReader.result);
                console.log('Parsed "%s" successfully, contents:', file.name, metadataPackage);
            } catch (e) {
                console.log('Error parsing metadata package file:', file.name);
                this.showErrorDialog("Error parsing metadata package file");
            }

            if (metadataPackage) {
                var validatePackage = this.validateMetadataPackage(metadataPackage);
                if (validatePackage.isValid) {
                    metadataPackage.packageName = metadataPackage.packageName || file.name;
                    this.addMetadataPackageModel(metadataPackage);
                    this.updateCallback(this.collection.toJSON());
                } else { // package not valid
                    this.showErrorDialog(validatePackage.message);
                }
            }
        },

        validateMetadataPackage: function (metadataPackage) {
            var key;
            var metadataKey = 'customMetadata';
            var currentData = this.collection.toJSON();

            // Validate root properties of metadataPackage
            var validRootKeys = [
                'id',
                'packageName',
                'packageDescription',
                'type',
                'target',
                'requiredTargetFields',
                metadataKey
            ];
            for (key in metadataPackage) {
                if(validRootKeys.indexOf(key) == -1) {
                    console.log('Metadata package validation failed: "{0}" is not a valid key'.format(key));
                    return {'isValid': false, 'message' : 'Metadata package validation failed: "{0}" is not a valid key'.format(key)};
                }
                //check that the id of package to upload dont already exists.
                if(key == 'id' && _.filter(currentData, {'id': metadataPackage[key]}).length ){
                    console.log('Metadata package validation failed: duplicate package id');
                    return {'isValid': false, 'message' :'Metadata package validation failed: duplicate package id'} ;
                }
            }

            // Validate target property
            var validTargetOptions = [
                'course',
                'lesson'
            ];

            if(validTargetOptions.indexOf(metadataPackage.target) == -1) {
                console.log('Metadata package validation failed: "{0}" is not a valid target'.format(metadataPackage.target));
                return {'isValid': false, 'message':'Metadata package validation failed: "{0}" is not a valid target'.format(metadataPackage.target)};
            }

            // Validate custom metadata existence
            if (!(metadataKey in metadataPackage) || !_.isArray(metadataPackage[metadataKey])) {
                console.log('Metadata package validation failed: {0} array is required'.format(metadataKey));
                return {'isValid': false, 'message': 'Metadata package validation failed: {0} array is required'.format(metadataKey)};
            }

            // Validate custom metadata array items properties
            var metadataItem;
            var validMetadataKeys = [
                'id',
                'name',
                'type',
                'value',
                'value_format',
                'value_from',
                'value_includeSeconds',
                'value_to',
                'required',
                'courseValue',
                'maxLength'
            ];

            var validMetadataTypes = [
                'text',
                'integer',
                'freeText',
                'tags',
                'url',
                'date',
                'time',
                'list',
                'boolean',
                'packageName',
                'multiselect',
                'multiselect_large'
            ];

            for (key in metadataPackage[metadataKey]) {
                metadataItem = metadataPackage[metadataKey][key];
                for (key in metadataItem) {
                    if(validMetadataKeys.indexOf(key) == -1) {
                        console.log('Metadata package validation failed: "{0}" is not a valid key in metadata object'.format(key), metadataItem);
                        return {'isValid': false, 'message': 'Metadata package validation failed: "{0}" is not a valid key in metadata object'.format(key)};
                    }
                }

                if ('type' in metadataItem) {
                    if (validMetadataTypes.indexOf(metadataItem.type) == -1) {
                        console.log('Metadata package validation failed: type "{0}" is not a valid in metadata object'.format(metadataItem.type), metadataItem);
                        return {'isValid': false, 'message': 'Metadata package validation failed: type "{0}" is not a valid in metadata object'.format(metadataItem.type)};
                    }
                } else { // !('type' in metadataItem)
                    console.log('Metadata package validation failed: "type" is missing in metadata object', metadataItem);
                    return {'isValid': false, 'message': 'Metadata package validation failed: "type" is missing in metadata object'};
                }
                if(this.checkDuplicateMetadataItemId(metadataItem.id, metadataKey, currentData)){
                    console.log('Metadata package validation failed: "type" is missing in metadata object', metadataItem);
                    return {'isValid': false, 'message': 'Metadata package validation failed: duplicate id value in customMetadata array'};
                }
                
            }

            if (_.isArray(metadataPackage[metadataKey])) {
                _.each(metadataPackage[metadataKey], function(metadataObj) {
                    if (_.isArray(metadataObj.value) && metadataObj.value[0].hasOwnProperty('key')) {
                        metadataObj.value = _.unique(metadataObj.value, 'key');
                    }
                });
            }

            console.log('Metadata package validation successful');
            return {'isValid': true};
        },
        checkDuplicateMetadataItemId: function(id, metadataKey, currentData){

            for (var i=0; i< currentData.length; i++) {
                var metadataPackage = currentData[i];
                for (var j = 0; j < metadataPackage[metadataKey].length; j++) {
                var metadataItem = metadataPackage[metadataKey][j];
                    if(metadataItem.id == id){
                        return true;
                    }
                }
            }
            return false;

        },

        addMetadataPackageModel: function(metadataPackage) {
            var id = metadataPackage.id || utils.genId();
            var $newRow = this.view.addMetadataPackageRow();

            // Make sure all metadata fields have an id
            _.each(metadataPackage.customMetadata, function (customMetadataItem) {
                customMetadataItem.id = customMetadataItem.id || utils.genId();
            });

            var rowModel = new customMetadataPackagesRowModel(_.extend({
                packageId : id,
                packageName: metadataPackage.packageName,
                packageDescription: metadataPackage.packageDescription || "",
                el: $newRow,
                onRemoveModel: _.bind(function(model){
                    this.collection.remove(model);
                    this.updateCallback(this.collection.toJSON());
                }, this)
            }, metadataPackage));

            this.collection.add(rowModel);
        },

        showErrorDialog: function (text) {
            var dialogConfig = {
                title: "Custom Metadata Package Error",
                content:{
                    text: text,
                    icon:'warn'
                },
                buttons:{
                    'yes': { label:'OK', value: true }
                }
            };

            require('dialogs').create('simple', dialogConfig, '');
        }

    });
	return customMetaDataPackagesController;

});