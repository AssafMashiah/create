define(['repo'], function(repo) {
	var buildRepoData =function(){
		repo.clear();

		var obj1,obj2,obj3,obj4,obj5,obj6;

		//create data to all objects
		obj1 = {"id":"thirdChild","type":"progress","parent":"firstParent","children":["secondGrandChild"],"data":{"title":"Progress","show_hint":true,"hint_timing":"1","feedback_type":"none","button_label":"Continue","disableDelete":true}};
		obj2 = {"id":"firstParent","type":"questionOnly","parent":"","children":["firstChild","secondChild","thirdChild"],"data":{"title":"New Question Only"}};
		obj3 = {"id":"firstChild","type":"instruction","parent":"firstParent","children":["firstGrandChild"],"data":{"title":"Instruction","show":"true","disableDelete":true}};
		obj4 = {"id":"secondGrandChild","type":"hint","parent":"thirdChild","children":[],"data":{"title":"Hint"}};
		obj5 = {"id":"secondChild","type":"question","parent":"firstParent","children":[],"data":{"title":"Question","disableDelete":true}};
		obj6 = {"id":"firstGrandChild","type":"textViewer","parent":"firstChild","children":[],"data":{"title":"","disableDelete":true,"disableSelect":false,"width":"100%","showNarrationType":true}};

		obj2.id = "";obj2.children=[];
		repo.set(obj2);

		obj1.parent = obj2.id;
		obj3.parent = obj2.id;
		obj5.parent = obj2.id;

		obj1.id="";obj3.id="";obj5.id="";
		obj1.children=[];obj3.children=[];obj5.children=[];

		repo.set(obj1);
		repo.set(obj3);
		repo.set(obj5);//obj5 is done
		repo.updateProperty(obj2.id,"children",[obj1.id,obj5.id,obj3.id],true);//obj2 is done

		obj6.parent = obj3.id;
		obj4.parent = obj1.id;

		obj4.id ="";obj6.id="";
		repo.set(obj4);//obj4 is done
		repo.set(obj6);// obj6 is done

		repo.updateProperty(obj3.id,"children",[obj6.id],true);//obj3 is done
		repo.updateProperty(obj1.id,"children",[obj4.id],true);//obj1 is done
		//data is ready for testing
		return [obj2.id, obj1.id, obj3.id, obj5.id, obj4.id,  obj6.id];
	};
	module('repo.js')

	test('Basic methods', function() {
		var obj1 = {name: 'foo'},
			id1 = repo.set(obj1)

		strictEqual(!!obj1.id, true, 'Object receives an id when passed to `set`')
		strictEqual(id1, obj1.id, "Method `set` returns new object's id")
		strictEqual(repo.get(obj1.id), obj1, 'Same object is returned by the `get` method')
		raises(function() {repo.set(obj1)}, Error, "Can't `set` an object with the same id")

		obj1['level'] = 80
		repo.update(obj1)

		strictEqual(id1, obj1.id, "Method `update` doesn't change object's id")
		strictEqual(repo.get(obj1.id).level, 80, 'Updated object is returned by the `get` method')

		var obj2 = {name: 'bar'},
			obj3 = {name: 'desu'}
		repo.set([obj2, obj3])

		strictEqual(!!obj2.id, true, 'Method `set` accepts an array of records (1)')
		strictEqual(!!obj3.id, true, 'Method `set` accepts an array of records (2)')
		strictEqual(repo.get(obj2.id), obj2, 'Same object is returned by the `get` method (1)')
		strictEqual(repo.get(obj3.id), obj3, 'Same object is returned by the `get` method (2)')

		obj2['level'] = 25
		obj3['level'] = 85
		repo.update([obj2, obj3])

		strictEqual(repo.get(obj2.id).level, 25, 'Updated object is returned by the `get` method (1)')
		strictEqual(repo.get(obj3.id).level, 85, 'Updated object is returned by the `get` method (2)')




		start()


	});
 test("test get children by type recursively", function(){
    var dataIdArr =  buildRepoData();
    //get child that dont exists
    var result = repo.getChildrenRecordsByTypeRecursieve(dataIdArr[0],"mc");
    var expected = [];
    deepEqual(expected, result, "get child dont exists");

    //get child from parent that dont exists
    result = repo.getChildrenRecordsByTypeRecursieve("fakeId","mc");
    expected = [];
    deepEqual(expected, result, "get child from parent that dont exists");


    //get child from first hierarchy level
    result = repo.getChildrenRecordsByTypeRecursieve(dataIdArr[0],"instruction");
    expected = [];
    expected.push(repo.get(dataIdArr[2]));
    deepEqual(expected, result, "get child first hierarchy level ");

    //get child from second hierarchy level
    result = repo.getChildrenRecordsByTypeRecursieve(dataIdArr[0],"textViewer");
    expected = [];
    expected.push(repo.get(dataIdArr[5]));
    deepEqual(expected, result, "get child second hierarchy level");
    start();

 });

	test("complex object and children test", function(){
		var objEqual = {name:'bar', level: 25, id:""};
		var obj2 = {name: 'bar', level:25},
			obj3 = {name: 'desu'};





		obj3['level'] = 85;

		repo.set([obj3,obj2]);
		objEqual.id = obj2.id;

		deepEqual(repo.get(obj2.id), objEqual, 'deep equal for simple object');

		obj2["data"]= {
			propOne : "",
			intProp : 5,
			booleanProp: true,
			level:25
		};

		objEqual.data = {};
		objEqual.data.propOne = "property one text";
		objEqual.data.intProp = 3;
		objEqual.data.booleanProp = true;
		objEqual.data.level = 25;

		repo.update(obj2);

		//update the properties
		repo.updateProperty(obj2.id,"propOne","property one text",false);
		repo.updateProperty(obj2.id,"intProp",3,false);
		repo.updateProperty(obj2.id,"booleanProp",true,false);
		deepEqual(repo.get(obj2.id), objEqual, 'deep equal for complex object');

		//change property form the root
		objEqual.level = 9;
		repo.updateProperty(obj2.id,"level", 9, true);
		deepEqual(repo.get(obj2.id), objEqual, 'deep equal for complex object after change root property');

		//adding children array to both objects
		objEqual["children"] = [obj3.id];
		repo.updateProperty(obj2.id,"children", [], true);
		repo.updateProperty(obj2.id,"children", [obj3.id], true);
		deepEqual(repo.get(obj2.id), objEqual, 'deep equal for complex object after add  children property');

		//adding property list to data to both objects
		objEqual.data["newList"] = [1,2,3];
		repo.updateProperty(obj2.id,"newList", [1,2], false);
		repo.updatePropertyList(obj2.id,"newList",3);
		deepEqual(repo.get(obj2.id), objEqual, 'deep equal for complex object after using updatePropertyList');

		//adding type for object3
		repo.updateProperty(obj3.id,"type", "testType", true);
		repo.updateProperty(obj3.id,"parent", obj2.id, true);

		//pulling out obj3 from repo by get children by type
		var obj3Result = repo.getChildrenRecordsByType(obj2.id, "testType");
		if(obj3Result.length> 0){
			strictEqual(obj3.id, obj3Result[0].id, 'strict equal for getChildrenRecordsByType ');
		}
		//create ne object with new type
		var obj4 ={name: "newObj", type:"newType", parent:obj2.id, children:[]};
		repo.set(obj4);
		//add to obj3 obj4
		obj2.children.push(obj4.id);
		var result = repo.getChildrenRecordsWithoutTypes(obj2.id, "newType");
		if(result.length > 0){
			strictEqual(obj3.id, result[0], 'strict equal for getChildrenRecordsWithoutTypes');

		}else{
			//todo: throw an error
		}


		objEqual.type = "parentType";
		repo.updateProperty(obj2.id, "type","parentType", true );
		//moving child obj4 from obj2 to obj3
		repo.updateProperty(obj2.id,"children" ,[obj3.id],true);
		repo.updateProperty(obj4.id ,"parent",obj3.id, true );
		repo.updateProperty(obj3.id,"children",[obj4.id], true);


		result = repo.getAncestorRecordByType(obj4.id, "parentType");
		strictEqual(obj2.id, result.id,"strict equal for getAncestorRecordByType");

		result = repo.getAncestors(obj4.id);
		strictEqual(2, result.length, "strict equal for getAncestor");


		result = repo.getSubtreeRecursive(obj2.id)
		strictEqual(3, result.length, "strict equal for getSubtreeRecursive");

		repo.removeItemAndSetChildrenToParent(obj3.id);
		result = repo.getSubtreeRecursive(obj2.id)
		strictEqual(2, result.length, "strict equal for getSubtreeRecursive");




		start()



	});

	test("complex object and children remove all various test", function(){

		var dataIdArr =  buildRepoData();

		strictEqual(repo.remove(dataIdArr[5]),dataIdArr[2],"simple remove ");

		dataIdArr =  buildRepoData();
		var result  = repo.removeChildren(dataIdArr[0]);

		strictEqual(repo.get(dataIdArr[0]).children.length,0, "removeChildren");

		dataIdArr =  buildRepoData();
		result  = repo.removeChildren(dataIdArr[1],"hint");
		strictEqual(repo.get(dataIdArr[1]).children.length,1, "removeChildren with type");

		dataIdArr =  buildRepoData();
		result = repo.updateChildrenProperty(dataIdArr[0],"title","notMe");
		result = repo.get(dataIdArr[1]).data.title &&
			repo.get(dataIdArr[2]).data.title &&
			repo.get(dataIdArr[3]).data.title? true: false;

		strictEqual(true, result, "updateChildrenProperty");

		dataIdArr = buildRepoData();
		var repoResult, repoLength=0, excludeList = [dataIdArr[2]];

		repo.removeItemAndChildrenWithExcludeList(dataIdArr[0],excludeList);
		for(var i=0;i< dataIdArr.length; i++){
			repoResult = repo.get(dataIdArr[i])
			if(repoResult){
				repoLength++;
			}
		}
		strictEqual(2, repoLength, "removeItemAndChildrenWithExcludeList");

		dataIdArr = buildRepoData();
		var newChildrenArray = dataIdArr[2]+","+dataIdArr[1]+","+dataIdArr[3];

		repo.updateProperty(dataIdArr[2],"type","justAType",true);
		repo.updateProperty(dataIdArr[1],"type","justAType",true);
		repo.updateProperty(dataIdArr[3],"type","justAType",true);

		repo.updateChildrenOrder(dataIdArr[2],"justAType",newChildrenArray);
		result = repo.get(dataIdArr[0]);
		result = result.children ;
		newChildrenArray = newChildrenArray.split(',');
		var test = false;
		if(result == newChildrenArray){

		}
		deepEqual(result, newChildrenArray,"updateChildrenOrder");

		start()


	});

	test("change Children Records By Type Recursively", function(){
		var dataIdArr =  buildRepoData();
		var childrenIdsBeforeChange = [],
			childrenIdsAfterChange = [],
			childrenRecordsBeforeChange = [],
			childrenRecordsAfterChange = [];
		repo.getChildrenRecordsByTypeRecursieve(dataIdArr[0],'textViewer',childrenRecordsBeforeChange);
		_.each(childrenRecordsBeforeChange, function(child, idx){
			childrenIdsBeforeChange.push(child.id);
		});

		var childData = {"title" : "", "width" : "100%", "disableDelete":true, "dontInputCaption" : true, "dontInputCopyrights" : true, "dontInputSound": true, "minimumReadable" : "50"};
		var child = {
			"type":	'imageViewer',
			"children":	[],
			"data":	childData
		};

		repo.changeChildrenRecordsByTypeRecursively(dataIdArr[0], 'instruction', 'textViewer', child);

		repo.getChildrenRecordsByTypeRecursieve(dataIdArr[0],'imageViewer',childrenRecordsAfterChange);
		_.each(childrenRecordsBeforeChange, function(child, idx){
			childrenIdsAfterChange.push(child.id);
		});

		deepEqual(childrenIdsAfterChange, childrenIdsBeforeChange,"changeChildrenRecordsByTypeRecursively");

		start();
	});

	asyncTest('Recursive', function() {
		repo.loadFile('js/test/repo_recur_test.json', function() {
			var records = repo.getSubtreeRecursive('item_1'),
				result = _.pluck(records, "ns").join()

			strictEqual(result, "#1,#2,#3,#8,#9", 'Records returned by `getSubtreeRecursive` are correct')

			start()
		})
	})

	test('UUID sanity', function() {
		var a = repo.genId(), b = repo.genId(), c = repo.genId(),
			UUIDv4re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

		ok(a != b && b != c && a != c, 'IDs produced by `genId` method are unique')
		ok(UUIDv4re.test(a), 'IDs produced by `genId` are formatted like UUID v4')
	})
})
