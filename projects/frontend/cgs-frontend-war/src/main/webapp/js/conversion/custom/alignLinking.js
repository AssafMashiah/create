define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {
		var progress, progressType, mtq = json[data.parent];
		_.each(mtq.children, function(child, idx){
			if(json[child].type == "progress"){
				progress = json[child];
			}
		});
		if(progress){
			data.checkingMode = progress.data.feedback_type;
			data.hasCheckingMode = true;
		}

		// Reorganize linking children
		var repo = require('repo');
		var linkingArea = json[_.find(json[data.id].children, function(child) { return json[child].type == 'linking_area' })];
		var linkingBank = json[_.find(json[data.id].children, function(child) { return json[child].type == 'distructors' })];
		
		data.isLinking = true;
		data.linkingMode = linkingArea.data.hasMultiSubAnswers ? "oneToMany" : "oneToOne";

		var pairs = _.map(linkingArea.children, function(child) { return json[child] });

		var check = { id: repo.genId(), parent: data.id, children: [], type: 'check', data: {} },
			sets1 = { id: repo.genId(), parent: check.id, children: [], type: 'sets', data: { type: 'correct'} },
			lists = { id: repo.genId(), parent: data.id, children: [], type: 'lists', data: { randomize: false } },
			list1 = { id: repo.genId(), parent: lists.id, children: [], type: 'list', data: { randomize: data.random == 'b_and_a', title: 'List A' } },
			list2 = { id: repo.genId(), parent: lists.id, children: [], type: 'list', data: { randomize: true, title: 'List B' } },
			addToJson = [check, sets1, lists, list1, list2];

		check.children = [sets1.id];
		lists.children = [list1.id, list2.id];

		//get all the part B children
		_.each(pairs, function(pair) {
			if (!repo.get(pair.data.definitionTypeId)) return;
			var link_item2_children = [];
			var pairAnswer = repo.get(pair.data.answerTypeId);
			if(pair.data.oneToManyMode){
				//get all linking sub answer children,
				//dont get all children recursivly becaue it can have children of the wanted type inside info baloon
				var answerChildren = repo.get(pair.data.answerTypeId).children;
				link_item2_children = [];
				_.each(answerChildren, function(linkingSubAnswerId){
					var childrenOfType = _.map(repo.getChildrenRecordsByType(linkingSubAnswerId, pairAnswer.data.answerType),
						function(item){
							return item.id;
						});
					link_item2_children = link_item2_children.concat(childrenOfType);
				});
				
			}else{
				link_item2_children = [pair.data.answerTypeId];
			}

			var link_item1 = { id: repo.genId(), parent: list1.id, children: [pair.data.definitionTypeId], type: 'link_item', data: {} },
				link_items2 =[];
				linkItems2Ids = []
				//create link item to each part B child 
				_.each(link_item2_children, function(linkItemChildId){
					if (!repo.get(linkItemChildId)) return;
					var linkItem2 = {	id: repo.genId(),
										parent: list2.id,
										children: [linkItemChildId],
										type: 'link_item',
										data: {}
									};
					link_items2.push(linkItem2);
					linkItems2Ids.push(linkItem2.id);
				});

			list1.children.push(link_item1.id);
			list2.children = list2.children.concat(linkItems2Ids);

			//create sets of matches : definition-answer, to every correct combination 
			_.each(linkItems2Ids, function(answerItemId){
				var set = { id: repo.genId(), parent: sets1.id, children: [], type: 'set', data: {} };
				var set_item1 = {	id: repo.genId(),
									parent: set.id,
									children: [],
									type: 'item',
									data: { content: link_item1.id }
								},
				set_item2 = {	id: repo.genId(),
								parent: set.id,
								children: [],
								type: 'item',
								data: { content: answerItemId}
							};

				set.children = [set_item1.id, set_item2.id];
				sets1.children.push(set.id);
				addToJson = addToJson.concat([set, set_item1, set_item2]);

			});

			addToJson.push(link_item1);
			addToJson = addToJson.concat(link_items2);
		});
	
		//add bank items to the part b list
		if (linkingBank && data.useBank) {
			_.each(linkingBank.children, function(distructor) {
				var bankItem = { id: repo.genId(), parent: list2.id, children: [distructor], type: 'link_item', data: {} }
				list2.children.push(bankItem.id);
				addToJson.push(bankItem);
			});
		}

		json[data.id].children = _.without(json[data.id].children, linkingArea.id);

		if (linkingBank && linkingBank.id) {
			json[data.id].children = _.without(json[data.id].children, linkingBank.id);			
		}

		json[data.id].children.splice(json[data.id].children.length, 0, check.id, lists.id);

		_.each(addToJson, function(elem) { json[elem.id] = elem });
	}
    return alignTask;
});