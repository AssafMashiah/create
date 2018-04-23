define(['lodash', 'recent', 'repo', 'files'], function(_, recent, repo, files) {
	module('recent.js');

	stop();
	files.allocate(function() {
		start();
	}, this);
	
	asyncTest('Simple add', function() {
		var testId = repo.genId();
		recent.addRecent(testId, function() {
			recent.getRecent(function(list) {
				ok(list instanceof Array, 'Recent list is array');
				strictEqual(_.filter(list, function(id) { return id == testId; }).length, 1, 'One instanse of id in recent list');
				start();
			}, this);
		});
	});

	asyncTest('Add same Id', function() {
		var testId2 = repo.genId();

		recent.addRecent(testId2, function() {
			recent.addRecent(testId2, function() {
				recent.getRecent(function(list) {
					strictEqual(_.filter(list, function(id) { return id == testId2; }).length, 1, 'One instanse of id in recent list');
					start();
				}, this);
			});
		});
	});

	asyncTest('Add more ids than recent list can store', function() {
		var ids = [];
		var ind = 0;

		_.times(11, function() { ids.push(repo.genId()); });

		addId();

		function addId() {
			recent.addRecent(ids[ind], function() {
				nextId();
			});
		}

		function nextId() {
			ind++;
			if(ind < ids.length) {
				addId();
			}
			else {
				recent.getRecent(function(list) {
					strictEqual(_.filter(list, function(id) { return id == ids[0]; }).length, 0, 'The first id not in the list');
					strictEqual(_.filter(list, function(id) { return id == ids[1]; }).length, 1, 'The second id is in the list');
					strictEqual(list[list.length - 1], ids[1], 'The second id is in the list in the last place');
					strictEqual(_.filter(list, function(id) { return id == ids[ids.length - 1]; }).length, 1, 'The last id is in the list');
					strictEqual(list[0], ids[ids.length - 1], 'The last id is in the list in the first place');
					start();
				}, this);
			}
		}
	});

});