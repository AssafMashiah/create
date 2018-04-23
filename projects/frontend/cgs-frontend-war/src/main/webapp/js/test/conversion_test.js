define([ 
	'conversionUtil', 
	'lodash', 
	'jquery',
	'jsonpath'
], 
function(conversionUtil, _, $, jsonpath) {
	module('conversionUtil.js')

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

	function createObjectValidation(dataObject){

		var pathsArray = jsonPath(sortOnDemand(dataObject), "$.[*]", {resultType:"PATH"}),
			tmpData = {};

		for (var i = 0; i < pathsArray.length; i++) {
			tmpData[pathsArray[i]] = {"isRequered":true};
		};

		return tmpData;
	}

	var path = 'js/test/validationData/',
		remoteData = loadFile(path + 'remote.json'),
		repoData = loadFile(path + 'repo.json'),
		sequnsesData = loadFile(path + 'sequnses.json');

	function sortOnDemand(item) {

		function SortBySpecificKey (x,y) {

			var tmpIndex = 0,
				propertiesArray = ["cid","href","id"];

			for (var i = propertiesArray.length - 1; i >= 0; i--) {
				if(x[propertiesArray[i]] && y[propertiesArray[i]]){ 
					tmpIndex = ((x[propertiesArray[i]] == y[propertiesArray[i]]) ? 0 : ((x[propertiesArray[i]] > y[propertiesArray[i]]) ? 1 : -1 ));
				}
			};

	      	return tmpIndex;
	    }

		if(_.isArray(item)){

			if($.isPlainObject(item[0])){// an array of objects (without a keys)
				item.sort(SortBySpecificKey);// sort jsonObj by specific key/value
			} else { // array standard
				item.sort();
			}
			// Recursion for children
			for (var i = item.length - 1; i >= 0; i--) {
				sortOnDemand(item[i]);
			};
		}

		if($.isPlainObject(item)){// sort object by keys
			var tmpKeys = (_.keys(item)).sort(),
				tmpItem = {};

			for (var i = tmpKeys.length - 1; i >= 0; i--) {
				tmpItem[tmpKeys[i]] = item[tmpKeys[i]];
				// Recursion for children
				sortOnDemand(tmpItem[tmpKeys[i]]);
			};

			item = tmpItem;
		}

		return item;
	}

	/**
	* Used for more accurate debugging or validate JSON schema 
	*/
	function objCompare(obj_1, obj_2, pathsObj){
		var res_1, 
			res_2, 
			isEq;

		_.each(pathsObj, function(value, key){
			// to compare JSON objects, order of child-nodes and structure must be identical
			res_1 = sortOnDemand(jsonPath(obj_1, key));
			res_2 = sortOnDemand(jsonPath(obj_2, key));

			// compare JSON objects
			isEq = _.isEqual(res_1, res_2);

			// write errors object
			if(!isEq){
				console.error(key);
				console.log("remote res :",res_1);
				console.log("remote :",obj_1);
				console.log("conversion res:",res_2);
				console.log("conversion :",obj_2);
			}

			// schema validation
			strictEqual(isEq, true, key+': '+ isEq);
		});
	}

	function restoreResourse (conversedRepo, remoteData){
		
		_.each(conversedRepo, function(value, key){
			if (value.type === 'lesson') {
				if (remoteData.lessonsData && remoteData.lessonsData[key] && remoteData.lessonsData[key]["resources"]) {
					value.data["resources"] = remoteData.lessonsData[key]["resources"];
				}
			}
		});

		return conversedRepo;

	}

	test('repo to remote conversion. comparing start/final files', function() {
		deepEqual(
			sortOnDemand(remoteData), 
			sortOnDemand(conversionUtil.repoToDataRemote(repoData)), 
			"default remoteData and data after manipulations must be completely identical" 
		);

		/*objCompare(
			sortOnDemand(remoteData), 
			sortOnDemand(conversionUtil.repoToDataRemote(repoData)), 
			createObjectValidation(sortOnDemand(remoteData))
		);*/

	})

	test('remote to repo conversion. comparing start/final files', function() {

		var conversedRepo = sortOnDemand(conversionUtil.dataRemoteToRepo(conversionUtil.repoToDataRemote(repoData)));
		var objectValidation = createObjectValidation(sortOnDemand(conversedRepo));

	/*	conversedRepo = restoreResourse(conversedRepo, remoteData);
		$.extend(true, conversedRepo, sequnsesData);*/

		/*deepEqual(
			sortOnDemand(repoData),
			sortOnDemand(conversedRepo),
			"default repo and repoData after manipulations must be completely identical"
		);*/

		objCompare(
			sortOnDemand(repoData),
			sortOnDemand(conversedRepo),
			objectValidation
		);
	})

})
