define(['lodash', 'zip_js', 'files', 'repo', 'events', 'assets', 'translate'],
    function(_, zip, files, repo, events, assets, translate){
    //@TODO maybe it is a good idea to add up validation on a sequence(to check also if all parents exists)
    var ImportSequenceUtil = function  (){
        this.init();
    };

    _.extend(ImportSequenceUtil.prototype,{

        init : function (){
            zip.workerScriptsPath = 'js/libs/zipjs/';
            _.bindAll(this);
        },

        process : function(filepath){
            this.deferred = new $.Deferred;
            if(filepath){
                while (filepath && filepath[0] == '/') filepath = filepath.substr(1);
                this.filepath = filepath;
                this.filepath = files.coursePath(undefined,undefined,this.filepath);
                files.loadObject(this.filepath,"blob_hack",this._unzip);
            }
            return this.deferred.promise();
        },

        _unzip : function (data){
            var blobReader = new zip.BlobReader(new Blob([new DataView(data)]));
            zip.createReader(blobReader,this._parseZipReader);
        },

        _parseZipReader : function (reader){
            this.reader = reader;
            this.reader.getEntries(this._parseFileEntries);
        },

        _parseFileEntries : function (entries){
            if(!entries.length) {
                return ;
            }
            //the correct order is manifest , sequence , assets
            //so we call the functions with order
            var sequenceFile = _.find(entries, function (item) { return item.filename == 'sequence.json'; }),
                mediaFiles = _.filter(entries, function (item) {

                    return (!item.filename.indexOf('media/') || !item.filename.indexOf('media\\')) &&
                            !item.directory &&
                            //check that the entry is not an empty media folder
                            item.filename !== "media/" &&
                            item.filename !== "media\\";
                });

            if(!sequenceFile){
                this._processFailed("zip must contain sequence.json file");
            }else{

                // List of processes to run
                this.processes = [
                    this._processEntryItem.bind(this, { filename: 'media' }, mediaFiles),
                    this._processEntryItem.bind(this, sequenceFile),
                    this._checkProcessResult.bind(this)
                ];

                this._runProcess();
            }
        },

        _runProcess: function() {
            if (this.processes.length) {
                $.when(this.processes.shift().apply(this, arguments)).always(this._runProcess.bind(this));
            }
        },

        _processEntryItem : function (item){
            var deffered = new jQuery.Deferred();
            if (arguments.length && arguments[arguments.length - 1] && arguments[arguments.length - 1].type == 'error') {
                return deffered.reject(arguments[arguments.length - 1]);
            }
            if(!item){
                return deffered.resolve();
            }
            var name = '_process' + item.filename.replace(/.json|.js|\//,'').capitalize();
            if(this[name]){
                this[name].bind(this, deffered).apply(this, arguments);
                return deffered.promise();
            }
            return deffered.resolve();
        },

        _processMedia : function (deffered, item, mediaFiles){
            function processFile(entry) {
                if (!entry) {
                    deffered.resolve();
                    return;
                }

                var self = this,
                    originalFileName = entry.filename.replace(/\\/g, '/'),
                    entryPath = files.coursePath(undefined, undefined, originalFileName);

                files.fileExists(entryPath, function(exists){
                    var needTranscode= require("cgsUtil").isMediaNeedTranscode(entry.filename);
                    //media file need to be transcoded at server and then the transcoded file should be uploaded to the sequence
                    if(needTranscode){
                        var ext = entry.filename.substr(entry.filename.lastIndexOf('.') + 1);
                        entry.filename = "media/xxx."+ext;
                    }
                    //upload file to the server
                    if (!exists || (exists && needTranscode) ) {

                        //if the file need transcoding, we will also want to generate sha1 to its name.
                        //otehrwise, we will want to keep its original name
                        var url = assets.uploadAbsPath(entry.filename);
                        url += "?isSha1="+ needTranscode;

                        entry.getData(new zip.BlobWriter(), function (blob) {
                            blob.name = entry.filename;
                            assets.uploadAssetToServer({
                                file: blob,
                                url: url,
                                successCallback: function(result){
                                    //if the file was transcoded we don't need to upload it to local file system
                                    //we need to change the path reference in the converted xml file
                                    if(result.isTranscoded){
                                        if(!self.mediaToChange){
                                            self.mediaToChange = [];
                                        }
                                        self.mediaToChange.push({
                                            "originalFilePath": originalFileName,
                                            "transcodedFilePath": result.filePath
                                        });

                                        processFile.call(self, mediaFiles.shift());

                                    }else{

                                        //need to upload file to local file system
                                        var index = 0,
                                            paths = [],
                                            filename = entryPath.substr(entryPath.lastIndexOf('/') + 1),
                                            filePath = entryPath.substr(0, entryPath.lastIndexOf('/'));

                                        while ((index = entryPath.indexOf('/', index + 1)) != -1) {
                                            paths.push(entryPath.substr(0, index));
                                        }

                                        files._makeDirs(paths, function() {
                                            files._saveFile(filename, 'xxx', blob, filePath, function() {
                                                processFile.call(self, mediaFiles.shift());
                                            });
                                        });
                                    }
                                }
                            });
                        });
                    }
                    else {
                        processFile.call(self, mediaFiles.shift());
                    }
                });
            }

            processFile.call(this, mediaFiles.shift());
        },

        _processManifest : function (deffered, item) {
            item.getData(new zip.TextWriter(),this._importManifest.bind(this, deffered));
        },

        _processSequence : function (deffered, item) {
            item.getData(new zip.TextWriter(),this._importSequence.bind(this, deffered));
        },

        _clear : function (){
            this.sequence = undefined;
            this.manifest = undefined;
            if(this.reader){
                this.reader.close();
            }
            files.deleteFile(this.filepath);
        },

        _checkProcessResult: function(arg) {
            this._clear();
            if (arg && arg.type == 'error') {
                this._processFailed(arg.message);
            }
            else {
                this._processDone(arg);
            }
        },

        _processDone : function (item){
            if(this.deferred){
                this.deferred.resolve();
            }
            if(item && repo._data[item]){
                events.fire('repo_changed', item);
                require('router').load(item);
            }
        },

        _processFailed : function (message){
            if(this.deferred){
                this.deferred.reject(message);
            }
        },

        _importManifest : function (deffered, data){
            try {
                if(data){
                    this.manifest = JSON.parse(data);
                }
                deffered.resolve();
            }
            catch(e){
                deffered.reject({ type: 'error', message: translate.tran('import.sequence.error.invalidManifest') });
            }
        },

        _importSequence : function (deffered, data){

            var sequences = undefined;
            try
            {
                if(this.mediaToChange && this.mediaToChange.length){
                    //json replace paths of media that were changed (because that they were transcoded)
                    _.each(this.mediaToChange, function(item){
                        var originalFilePath = item.originalFilePath.substr(item.originalFilePath.indexOf("media"), item.originalFilePath.length);
                        var regex = new RegExp(originalFilePath, 'g');

                        data = data.replace(regex, item.transcodedFilePath);
                    });
                }
                if(typeof data == 'object'){
                    this.sequence = data;
                }
                else{
                    this.sequence = JSON.parse(data);
                }

                this.sequenceIdsList = _.map(this.sequence,function (value,key){
                    return key;
                });

                if(this.manifest && this.manifest.sequence){
                    //order the sequences according to the order in the sequence
                    sequences  = _.map(this.manifest.sequence,function (item){
                        return this.sequence[item];
                    },this);
                }else{
                     sequences = _.where(this.sequence,{type:"sequence"});
                }

                var jsonString = JSON.stringify(this.sequence),
                    newIds = [];
                _.each(sequences, function(seq, ind) {
                    var newId = repo.genId();
                    jsonString = jsonString.replace(new RegExp(seq.id, 'g'),newId);
                    newIds.push(newId);
                });
                this.sequence = JSON.parse(jsonString);
                sequences = _.map(newIds, function(id) { return this.sequence[id] }, this);

                if (_.any(this.sequence, function(item) { return repo.get(item.id) })) {
                    throw { message: translate.tran('import.sequence.error.duplicate')};
                }

                repo.startTransaction();
                var result = _.map(sequences,function (item){
                    var isValid = this._validate(item.id);
                    if(isValid ){
                        this._injectToLesson(item.id);
                        return true;
                    }
                    else{
                        return false;
                    }
                },this);
                repo.endTransaction();

                if(result.indexOf(false) === -1){
                    deffered.resolve(sequences[0].id);
                }else{
                    throw { message : translate.tran("import.sequence.error.missingData") };
                }

            }
            catch (ex){
                _.each(sequences, function(item) {
                        repo.remove(item.id)
                }, this);
                deffered.reject({ 'type': 'error', 'message': ex.message});
            }
        },

        /**
         * Recursive iterates through all the children in the sequence checks that
         * all the children are exists in the sequence if one children is missing then returns false
         * @param  {string} id -> the parent element id
         * @return {boolean}  true if all children exists otherwise returns false
         */
        _validate : function(id) {
            var children = this.sequence[id].children;

            if(!children.length ) {
                return true;
            }

            var results = _.map(this.sequence[id].children,function(item){
                if(this.sequenceIdsList.indexOf(item) >= 0){
                    return this._validate(item);
                }
                return false;
            },this);

            return _.every(results,function (item){return item;});
        },

        _injectToLesson : function (id){
            var item = this.sequence[id],
                children = item.children;
            if(item.type == 'sequence'){
                var parent = this._getSequenceParent(),
                    newChildren = require('cgsUtil').cloneObject(parent.children);
                item.parent = parent.id;
                newChildren.push(item.id);
                repo.updateProperty(parent.id, 'children', newChildren, true);
            }
            repo.addImportedItem(item);
            _.each(children,this._injectToLesson,this)
        },

        _getSequenceParent : function (){
            var currentEditorRecord = require('router').activeEditor.record;

            var parentType = repo.get(require('courseModel').courseId).data.includeLo ? 'lo' : 'lesson';

            if(currentEditorRecord.type !== parentType){
                return repo.get(currentEditorRecord.parent);
            }else{
                //When includeLo is true then this option is disabled from the lesson screen
                return currentEditorRecord;
            }
        }
    });

    return new ImportSequenceUtil();
});