define(['jquery', 'lodash' , 'repo', 'repo_controllers', 'types', 'events','cgsUtil','localeModel'], function($, _, repo, repo_controllers, types, events,cgsUtil,localeModel) {

	var validate = {};
	validate.getInvalidReportString = function(report){
		if(report && report.report){
            var ans  = '';
            _.each(report.report, function(item){
                ans += "<div>"+item.msg+"</div>";
            });
            return ans;
        }
        return '';
	};

	validate.getInvalidReportSummery = function (report) {
		if (report && report.report) {
			var arr_report = _.indexBy(report.report, 'msg'), summery_str = '';
			arr_report = _.toArray(arr_report);

			if(arr_report.length) {
				summery_str = arr_report.map(function (elem) {
					return elem.msg;
				}).join("</li><li>");

				summery_str = ['<li>', summery_str, '</li>'].join("");
			}

			return summery_str;

		}
		return '';
	};

	validate.insertInvalidSign = function($el,before, type, title){
	
		if($el.find('.validTip.type_'+type).length){
			$el.find('.validTip.type_'+type).attr('title', title);
		}else{
			//&#xe601 = validation icon
			$el[before? 'prepend' : 'append']($('<div/>').attr({
	            'class':'validTip type_'+type,
	            'title':title
	            }).html('&#xe601').tooltip({
	               'content': function(){
	                    return $(this).attr('title');
	               }
	        }));
		}
	}

	validate.requiredField = function(value, options) {
		if (!value || (typeof value === 'string' && !value.replace(/\s/g, '').length)) {
			$('#field_' + options.field + '_err').show();
			return false;
		}

		$('#field_' + options.field + '_err').hide();
		return true;
	}

	validate.integer3Digits = function(value, options) {
		
		value+= ''; // convert to string

		var reg3digits=/^\d{0,3}$/;
		if(value.search(reg3digits) < 0) {
			$('#field_' + options.field + '_err').show();
			return false;
		}

		$('#field_' + options.field + '_err').hide();
		return true;
	}

	validate.isbnCheck = function(value, options) {
		if (value === undefined) {
			$('#field_' + options.field + '_err').show();
			return false;
		}

		if (value.trim().length > 0) {
			//var regEx = /^ISBN(-1(?:(0)|3))?:? (\s)*[0-9]+[- ][0-9]+[- ][0-9]+[- ][0-9]*[- ]*[xX0-9]/;
			var regEx = /^ISBN(?:-1[03])?[:\s]\s*(?:\d+[- ]){3,}\d?[xX]?$/;
			if (!regEx.test(value)) {
				$('#field_' + options.field + '_err').show();
				return false;
			}
		}
		$('#field_' + options.field + '_err').hide();
		return true;

	}

	/**
	 *
	 * @param id
	 * @param forceChildrenValidation
	 * @param additionalValidation - a validation report that was recieved from the parent element, and needs to be aggregated to the child element- current use : plugin custom validation
	 * @return selfValidation {valid: [Boolean], report: []}
	 */
	validate.validatePreviewRecursion = function(id, forceChildrenValidation, additionalValidation) {

		// get repo's element data
		var elem_repo = repo.get(id);
		if(!elem_repo) {
			throw 'validation error - no Repo element on editorId:[' + id + ']'
		}

		var editorClass = cgsUtil.getRepoItemEditorClass(elem_repo),
		 	selfValidation = {valid: true, report: []},
			childValidation;

		// call editor's valid function for self validation
		// if this function doesn't exist, self validation is true
		if(!!editorClass.valid) {
			selfValidation = editorClass.valid(elem_repo);

			// validate response
			if (!selfValidation)
				throw 'validation error editorId:[' + id + ']'
		}

		// validate children only if self validation passed
		if(selfValidation.valid && !selfValidation.dontAllowChildren) {
			// loop children
			_.each(editorClass.mapChildrenForValidation ? editorClass.mapChildrenForValidation(elem_repo) : repo.getChildren(elem_repo), function(childrenItem) {
				
				var additionalChildValidation = null;
				//check if the validation parent contains an extra validation for its child 
				if(selfValidation.childCustomValidation &&
					selfValidation.childCustomValidation[childrenItem.id]){
				
					additionalChildValidation = selfValidation.childCustomValidation[childrenItem.id];
					
				}

				// validate child
				// Skip sequence children validation when switching editors to speed up sequence loading
                if (forceChildrenValidation || elem_repo.type != 'sequence') {
					childValidation = validate.validatePreviewRecursion(childrenItem.id, forceChildrenValidation, additionalChildValidation);
				}
				else {
					childValidation = childrenItem.data.invalidMessage || {};
				}
				
				// combine self & child validation
				
				 if (  
				 	
				 	(childValidation.bubbleUp  ? childValidation.bubbleUp : types[childrenItem.type] && types[childrenItem.type].validationBubbleUp) && 
				 	
				 	!(types[childrenItem.type].validationBubbleUp === false)
					
					){
				 	selfValidation.valid = selfValidation.valid && childValidation.valid;
				 	selfValidation.bubbleUp = true;
				}

				selfValidation.report = _.union(selfValidation.report, childValidation.report);

				if(!childValidation.valid)
					selfValidation.upperComponentMessage = childValidation.report;
			});
		}else{
			selfValidation.upperComponentMessage = selfValidation.report;
		}

		if(!!editorClass.postValid) {
			var postValidation = editorClass.postValid(elem_repo);
			if(!postValidation.valid){
				selfValidation.upperComponentMessage = postValidation.report;
			}
			selfValidation.valid = selfValidation.valid && postValidation.valid;
			selfValidation.report = _.union(postValidation.report, selfValidation.report);
			//also add the bubble up attribute to the party 
			if(postValidation.bubbleUp){
				selfValidation.bubbleUp = postValidation.bubbleUp;
			}
		}

		//add the additional validation recieved from the parent element to the child
		if(additionalValidation){
			//override the default validation with the recieved validation
			if(additionalValidation.overrideDefaultValidation){
				selfValidation.valid = additionalValidation.valid;
				selfValidation.report = additionalValidation.report;

			}else{
				//combine the default validation with the recieved validation
				selfValidation.valid = selfValidation.valid && additionalValidation.valid;
				selfValidation.report = _.union(additionalValidation.report, selfValidation.report);
			}
		}


		//update the element data
		repo.startTransaction({ ignore: true });
		repo.updateProperty(elem_repo.id, 'isValid', selfValidation.valid, false, true);
		repo.updateProperty(elem_repo.id, 'invalidMessage', selfValidation, false, true);
		repo.endTransaction();
			

		// get editor's controller
		var editorController = repo_controllers.get(id);

		//if editor controller contains markValidation, call this function with the validation conclusion
		if (!!editorController && editorController.markValidation) {
			editorController.markValidation(selfValidation.valid);
		}
		

		return selfValidation;
	};

    validate.getFirstLevelChildrenValid = function( id ){

        return _.every( repo.get( id ).children , function( childElement ){
            childElement = repo.get( childElement );
            return childElement.data &&
                childElement.data.invalidMessage &&
                childElement.data.invalidMessage.report &&
                !childElement.data.invalidMessage.report.length
        } );

    };

	/**
	 * 
	 * @param id
	 * @param forceChildrenValidation
	 * @return valid {valid: [Boolean], report: []}
	 */
	validate.isEditorContentValid = function(id, forceChildrenValidation) {

		// get element data
		var  item = repo.get(id);
		if(!item) {
			return null;
		}
		var	valid = {valid: true, report: []},
			typeObj = types[item.type],

			//get first anccector validation, max ancestor:  active editor, if not, validate on current id
			idToValidate = id;
		
		var validationElemet = item;
		if( typeObj.validationAncestor =="special"){
			var editorClass = cgsUtil.getRepoItemEditorClass(item);
			if(editorClass && editorClass.getParentToValidate){
				idToValidate = editorClass.getParentToValidate(item);
			}

		}else{

			if( !typeObj.validationAncestor && item.type !== require('router').activeEditor.elementType){
				//search the closest validation ancector
				do{
					validationElemet = repo.get(validationElemet.parent);
					isValidationAncestor = validationElemet && !!types[validationElemet.type].validationAncestor;

				}
				while(validationElemet && !isValidationAncestor && require('router').activeEditor.elementType !== validationElemet.type)
				
				if(isValidationAncestor){
					idToValidate = validationElemet.id;
				}
				
			}

		}
		valid = validate.validatePreviewRecursion(idToValidate, forceChildrenValidation);
		return valid;
	};

	/**
	 * set message for validation report
	 * @param  {[type]} elem_repo [description]
	 * @param  {[type]} message   [description]
	 * @return {[type]}           [description]
	 */
	validate.setReportRecord = function (elem_repo,message){
		return {
			editorId 	: elem_repo.id,
			editorType 	: elem_repo.type,
			editorGroup : types[elem_repo.type].group,
			msg 		: require('translate').tran(message)
		};
	};
	//upload an invalid imge to the invalid component
	validate.uploadInvalidImg = function(id, imgPath, imgDimensions){
			var	record = repo.get(id);

			if(!record.data.invalidImg){

				var pid = require("userModel").getPublisherId(),
					cid = require("courseModel").getCourseId(),
					ph = imgPath,
					filename = ph.substr(ph.lastIndexOf('/') + 1);

				if (record && ph) {
					require('files').downloadFile({
						url: ph,
						publisherId: pid,
						courseId: cid,
						filename: filename,
						dirname: 'media'
					});
					repo.startTransaction({ ignore: true });
					repo.updateProperty(id, 'invalidImg', '/' + ph);
					repo.updateProperty(id, 'invalidImgDimensions', imgDimensions);
					repo.endTransaction();
				}
			}
	};
	//convert the validation object from the format reciveved by the plugins validation to a format used in the validation process
	/*
	params: 
		{object} options : 
		{string} options.id - id of item validation
		{boolean} options.valid - validation status - true/false
		{array} options.validationMessage - array of strings that describes the invalidness

	*/
	validate.convertValidationMessage = function(options){
		if(options.id){

			var repoItem = repo.get(options.id),
			validationResponse ={
				"valid" : true,
				"report": [],
				"overrideDefaultValidation" : options.overrideDefaultValidation
			};
			//check validation status
			if(!_.isUndefined(options.valid)){
				validationResponse.valid = options.valid;
		}

			//check validation report messages
			if(!_.isUndefined(options.validationMessage)){
				//validation report needs to be an array
				if(!_.isArray(options.validationMessage)){
					options.validationMessage = [options.validationMessage];
				}
				//add messages form the plugin chils to the validation array, in the needed format
				_.each(options.validationMessage, function(validationMsg){
					validationResponse.report.push(this.setReportRecord(repoItem, validationMsg));
				},this);
			}
			return validationResponse;
		}
	};
	
	return validate;

});