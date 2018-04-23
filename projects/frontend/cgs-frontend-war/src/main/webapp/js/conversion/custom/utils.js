define( [ "require", "jquery", "mustache", "lodash", "repo"],
	function( require, $, mustache, _ ,repo) {
		

		var conversionUtils ={

			/*wrap an element with another element 
			@wrapper: obj with type and data json
			@childId: the child id we want to wrap
			@parentId: the parent id we want to add the wrapper to
			@json: array with all repo elements
			*/
			wrapAndPush: function(wrapper, childId, parentId, json) {

				var child = json[childId],
					parent = json[parentId],
					//original child parent
					childParent = json[child.parent],
					
					//generate a new id for the wrapper object
					wrapperObjId;
					do {
						wrapperObjId =repo.genId();
					}
					// Prevent possible id collision
					while (typeof json[wrapperObjId] !== 'undefined');

					//create the wrapper object, 
					//set its parent to be parentId, set his child to be childID
					var wrapperObj = {
						children: [childId],
						data: wrapper.data,
						id: wrapperObjId,
						parent: parentId,
						type: wrapper.type
					};
					//add wrapper to parent as a child 
					parent.children.push(wrapperObj.id);

					//set child parent to wrapper
					child.parent = wrapperObjId;

					//remove child from his previous parent
					childParent.children = _.filter(childParent.children, function(child){
						return child != childId;
					});

					//save the new wrapper element in repo array
					json[wrapperObjId] = wrapperObj;
			},

			/*returns a value that will identify the element in a uniq way
				used for combining duplicate answers in one to many mode
			*/
			getAnswerCompareKey : function(elem){

				switch(elem[0].tagName && elem[0].tagName.toLowerCase()){
					case 'textviewer':

						if (!elem.find('mathfield, inlineimage, inlinesound, mathobject, inlinenarration, textviewernarration').length &&
							!elem.find('mathfield, inlineimage, inlinesound, mathobject, inlinenarration, textviewernarration').length){
								return elem.text().trim();
						} else {
							var clonedElement = elem.clone();
							clonedElement.find('mathobject').replaceWith(function() { return $(this).html(); });
							return clonedElement.html().trim();
						}
					break;

					case 'mediaplayer':
					case 'imageviewer':
						return $(elem).attr('src');

					case 'mathfield':
						return $(elem).html();
					//in case of an empty TVE, the returned data is the invalid template of the TVE. 
					//in this case we wnt to return an empty string
					default:
						return ' ';
				}

			}
		};

		return conversionUtils;
	});