define(['files', 'repo'], function(files, repo) {
	module('files.js');

	/*
	test('Initial value should be null', function() {
		strictEqual(files.fs, null, 'Initial value should be null');
	})
	*/

	function loadFile(url){		
		var tmpData = {};

		$.ajax({
			url: url,
			dataType: "json",
			async: false,
			cache: false,
			error: function(jqXhr, textStatus, error) {
            	throw new Error("ERROR:" + textStatus + ",\n " + error);
        	}
		}).done(function ( data ) {
			tmpData = data;
		});

        return tmpData;
	}

	asyncTest('FileSystem (allocate)', function() {
		files.allocate(function(fs) {
			ok(fs && fs.root, 'FileSystem object sanity check (1)');
			strictEqual(fs.root.fullPath, '/', 'FileSystem object sanity check (2)');

			start();
		})
	})

	var pid = 1,
		path = 'js/test/validationData/',
		obj = loadFile(path + 'repo.json');
		
	asyncTest('Save object', function() {
		var cid = repo.genId(),
			filename = cid + '.json';

		files.prepareDirs(pid, cid, function() {
			files.saveObject(obj, filename, files.coursePath(pid, cid), function() {
				files.fileExists(files.coursePath(pid, cid, filename), function(exists) {

					ok(exists, 'Object saved to file in new course directory');

					if(exists) {
						files.loadObject(files.coursePath(pid, cid, filename), false, function(data) {

							deepEqual(obj, data, 'The original and saved objects are equal (load with parsing)');

							files.loadObject(files.coursePath(pid, cid, filename), true, function(data) {
								deepEqual(obj, JSON.parse(data), 'The original and saved objects are equal (load without parsing)');
								start();
							});

						});
					}
					else {
						ok(false, 'File not found!');
						start();
					}

				});
			});
		});
	});

	asyncTest('File exists, delete file', function() {
		var cid = repo.genId(),
			filename = cid + '.json';
		
		files.fileExists(filename, function(exists) {
			ok(!exists, 'File ' + filename + ' doesn\'t exist');

			files.saveObject(obj, filename, '/', function() {
				files.fileExists(filename, function(exists) {
					if(exists) {
						ok(exists, 'File ' + filename + ' was created');
						files.deleteFile(filename, function() {
							files.fileExists(filename, function(exists) {
								ok(!exists, 'File ' + filename + ' was deleted');
								start();
							});
						});
					}
					else {
						ok(false, 'File not found!');
						start();
					}
				});
			});

		});
	});

	asyncTest('Download assets', function() {
		var basePath = require('configModel').configuration.basePath,
			// Exising course id
			cid = '6885f3eb-bdb7-4f8d-9d3e-84af4c5afe26',
			// Existing course resource
			assetName =  'media/aa/7c/8b9e5051b4be0ee700eaf8005d9f9112158c.jpg';

		files.prepareDirs(pid, cid, function() {
			files.downloadAsset(basePath, pid, cid, assetName, function() {
				ok(true, 'Downloaded');
				files.fileExists(files.coursePath(pid, cid, assetName), function(exists) {
					ok(exists, 'The file exists locally');
					start();
				})
			});
		});

	});
})