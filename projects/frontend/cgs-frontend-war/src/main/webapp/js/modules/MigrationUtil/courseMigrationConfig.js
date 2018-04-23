define(['lodash', 'jquery'], function(_, $) {

	// course migration config includes:

	// options : [
	//				{
	//					version: { Int },
	//					func   : { function }
	//				},
	//				.
	//				.
	//				.
	//			 ]

	function setSchemaVersion_course_lesson_assessment(json, upgradedVersion){
		upgradedVersion = upgradedVersion.toString();
		json.schema = 'course_v' + upgradedVersion;
		return json;
	}

	return {

				options : [

					/*{
						version: 2,

						fnc: function(json){


							var lessonsRef_to_tocItemRefs = function(j){
								// increase internal array
								j.tocItemRefs = j.lessonsRef;
								delete j.lessonsRef;

								_.each(j.tocItemRefs, function(item){
									item.type = 'lesson';
								});

								return j;
							}

							function migrateTocItems(toc_items){

								_.each(toc_items, function(item){
									item = lessonsRef_to_tocItemRefs(item);
									migrateTocItems(item.tocItems);
								});
							}

							// migrate course lessons
							json.toc = lessonsRef_to_tocItemRefs(json.toc);

							// migrate course toc items
							migrateTocItems(json.toc.tocItems);

							return json;
						}

					}*/

				],

				setSchemaVersion: setSchemaVersion_course_lesson_assessment

			}

});