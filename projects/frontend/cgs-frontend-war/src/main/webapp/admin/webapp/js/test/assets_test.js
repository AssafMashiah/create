define(['lodash', 'files', 'repo', 'assets'], function(_, files, repo, assets) {
	module('assets.js');

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

	stop();
	files.allocate(function() {
		start();
	}, this);

	require('userModel').account = {};
	require('userModel').init();

	var courseId = '7d2da367-32bd-48f3-ab57-23d3bf242b1c';
	var path1 = '/testPath/123/test.jpg',
		path2 = 'testPath/123/test.jpg';

	asyncTest('Create course directories', function() {
		assets.makeDirs(courseId, function() {
			ok(true, 'Direcory was created');
			start();
		});
	});

	asyncTest('Test paths', function() {
		strictEqual(assets.absPath(path1, false, courseId), assets.absPath(path2, false, courseId), 'Check local path with or without slash');
		strictEqual(assets.absPath(path1, true, courseId), assets.absPath(path2, true, courseId), 'Check remote path with or without slash');
		notEqual(assets.absPath(path1, false, courseId), assets.absPath(path1, true, courseId), 'Local and remote paths aren\'t equal');
		start();
	});
	
});