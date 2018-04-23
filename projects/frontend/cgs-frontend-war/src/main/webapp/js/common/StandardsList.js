define(["jquery", "lodash", "repo", "mustache", "GenericList", "HTMLControlFactory", "events", "standardsModel", "editMode", "translate", "learningPathModel"],
    function ($, _, repo, Mustache, GenericList, HTMLControlFactory, events, standardsModel, editMode, i18n, learningPathModel) {
        /**
         *
         * @param config
         *
         * @constructor
         */
        function StandardsList(config) {

            var _parentId,
                _repoId,
                _isReadOnly,
                _getStandardsFunc,
                _checkboxesJSON = {},
                _addStandardsBtnId = "addStandards",
                _disableAddStandardsBtn,
                _removeStandardsFunc;


            function constructor() {
                _parentId = config.itemId;
                if (config.repoId) _repoId = config.repoId;
                if (config.removeStandardsFunc) _removeStandardsFunc = config.removeStandardsFunc;
                _getStandardsFunc = config.getStandardsFunc;
                _isReadOnly = config.isReadOnly;
                _disableAddStandardsBtn = config.disableAddStandardsBtn;

                render();
            }

            function _sortStandardsByPackage(json) {
                var recommended, chosen;
                recommended = standardsModel.groupStandardsByPackage(json.recommended);
                chosen = standardsModel.groupStandardsByPackage(json.chosen);

                var recommended2 = {};
                $.each(recommended, function (key, value) {
                    var arr = recommended[key];
                    recommended2[key] = recommended2[key] || {};
                    recommended2[key]["recommended"] = arr;
                    if (chosen[key]) {
                        recommended2[key]["chosen"] = chosen[key];
                        delete chosen[key];
                    }
                });

                $.each(chosen, function (key, value) {
                    var arr = chosen[key];
                    recommended2[key] = recommended2[key] || {};
                    recommended2[key]["chosen"] = arr;
                });

                return recommended2;
            }

            function _intersectionStandards(array) {
                var slice = Array.prototype.slice;
                var rest = slice.call(arguments, 1);
                return _.filter(_.uniq(array), function (item) {
                    return _.every(rest, function (other) {
                        return _.any(other, function (element) {
                            return standardsModel.isEqualStandards(element, item);
                        });
                    });
                });
            };

            function _removeCheckedStandards(chosen, checked) {
                var chosenIndex;
                $.each(checked, function (index, result) {
                    chosenIndex = standardsModel.containsStandard(chosen, result);
                    if (chosenIndex != -1) {
                        chosen.splice(chosenIndex, 1);
                    }
                });
            }

            function _standardClicked(event) {
            	var action;
            	var standardId = $(event.target).attr("standard-id");
            	var standard = _checkboxesJSON[standardId];
                if ($(event.target).prop("checked")) {
                    action = "add";
                } else {
                    action = "delete";
                }
                standardsModel.updateStandardList(_repoId, standard, action).then(function () {
                }).catch(function () {
                	$(event.target).attr("checked", "checked");
                });
            }

	        function _removeStandard(event) {
	        	var standardId = $(event.target).attr("standard-id");
	        	var standard = _checkboxesJSON[standardId];
				standardsModel.updateStandardList(_repoId, standard, "delete").then(function () {
					var pack = $(event.target).parents('.package-container');
					$(event.target).parent().remove();
					if (!pack.find('li').length) {
						pack.remove();
					}
				}).catch(function () {
					console.log('Standard deletion canceled', _repoId, standardId);
				});
            }

            function _standardTreeClosed(standards) {
                if (standards) {
                    //check for learning path integrity
                    learningPathModel.checkAssessmentIntegrity(standards).then(function () {
                        standardsModel.setStandards(_repoId, standards);
                        reRender();
                    }).catch(function () {
                        return;
                    });
                }
            }

            function _getFullPackageId(standard) {
                return standard.name +"_" + standard.subjectArea+"_"+standard.version;
            }

            function _showStandardsTree() {
                if (!editMode.readOnlyMode) {
                    standardsModel.showStandardTreeDialog(_repoId, _standardTreeClosed.bind(this));
                }

            }

            function _createGenericListItems(packageStandards) {
                var items = [], checkbox, checkboxChecked,
                    isDisabled, standardRemoveIcon;
                items["recommended"] = [];
                items["chosen"] = [];

                isDisabled = editMode.readOnlyMode ? "disabled" : "";
                _.each(packageStandards.recommended, function (item) {

                    _checkboxesJSON[standardsModel.getStandardId(item)] = item;

                    checkbox = HTMLControlFactory.checkbox('', 'classA', 'standard-id="' + standardsModel.getStandardId(item) + '" ' + isDisabled);

                    checkboxChecked = HTMLControlFactory.checkbox('', 'classA', 'checked standard-id="' + standardsModel.getStandardId(item) + '" ' + isDisabled);

                    items["recommended"].push(
                        {
                            label: item.pedagogicalId,
                            description: item.standardName,
                            controlBefore: {
                                template: (standardsModel.containsStandard(packageStandards.recommendedChecked, item) != -1) ? checkboxChecked : checkbox,
                                eventName: "click",
                                callback: _standardClicked
                            },
                            controlAfter: null
                        })
                });
                _.each(packageStandards.chosen, function (item) {
                    _checkboxesJSON[standardsModel.getStandardId(item)] = item;
                    standardRemoveIcon = HTMLControlFactory.span('', 'removeStd icon-trash' + ' ' + isDisabled, 'standard-id="' + standardsModel.getStandardId(item) + '"');

                    items["chosen"].push(
                        {
                            label: item.pedagogicalId,
                            description: item.standardName,
                            controlBefore: _isReadOnly ? null :
                            {
                                template: standardRemoveIcon,
                                eventName: "click",
                                callback: _removeStandardsFunc ? _removeStandardsFunc : _removeStandard
                            },
                            controlAfter: null
                        });
                });
                return items;
            }

            function _verifyStandardsOrder(standards,packageId) {
                 //gets standards in course and flatten then go one by one
                var standardPackage = repo.get(repo._courseId).data.standartsPackages[packageId];
                if (!standardPackage) {
                    logger.warn(logger.category.STANDARDS, "Could not get standard package with id: " + packageId);
                    logger.warn(logger.category.STANDARDS, "Skipping ordering of standards!");
                    return standards;
                }
                var courseStandards = standardPackage.standards,
                    standardsIds = {},
                    counter = {i: 0};

                if (!courseStandards)  {
					logger.warn(logger.category.STANDARDS, "Could not get standards, skipping ordering of standards");
					return standards;
				}

                standardsIds = getStandardsPositions(courseStandards.children, standardsIds, counter);

                function getStandardsPositions (standardsChildren, standardsIds, counter) {
                        _.each(standardsChildren, function(val){
                            standardsIds[val["pedagogicalId"]] = counter.i++;
                            getStandardsPositions(val.children, standardsIds, counter);
                        });

                    return standardsIds;
                }
                standards = _.sortBy(standards, function(standard){
                    standard.pos = standardsIds[standard["pedagogicalId"]];
                    return standardsIds[standard["pedagogicalId"]];
                });
                return standards;
            }

            function _createPackageUI(packageName, packageStandards) {
                var packageDiv = HTMLControlFactory.div("", ["package-container"], []),
                    recommendedDiv = HTMLControlFactory.div("", ["recommended-container"], []),
                    chosenDiv = HTMLControlFactory.div("", ["chosen-container"], []),
                    pkgObj = $($(packageDiv)[0]).appendTo($(_parentId)),
                    recoObj = $($(recommendedDiv)[0]).appendTo(pkgObj),
                    exObj = $($(chosenDiv)[0]).appendTo(pkgObj);

                var items = _createGenericListItems(packageStandards);

				var titleSeparatorIndex = packageName.indexOf(" - ");
				var title = packageName.substr(0, titleSeparatorIndex);
				var subtitle = packageName.substr(titleSeparatorIndex + 3);
                new GenericList({
                    itemId: recoObj,
                    items: items["recommended"],
                    title: title,
                    subtitle: subtitle
                });

                new GenericList({
                    itemId: exObj,
                    items: items["chosen"],
                    title: null
                });
            }

            function reRender() {
                dispose();
                render();
            }

            function render() {
                var moreButton,
                    buttonObj,
                    standards;

                standards = _getStandardsFunc();
                standards = _sortStandardsByPackage(standards);

                _.each(standards, function (value, key) {
                    if (value.chosen && value.chosen.length) {
                        value.chosen = _verifyStandardsOrder(value.chosen,_getFullPackageId(value.chosen[0]));
                    }

                    if (value.recommended && value.recommended.length) {
                        value.recommended = _verifyStandardsOrder(value.recommended,_getFullPackageId(value.recommended[0]));
                    }
                    value.recommendedChecked = _intersectionStandards(value.recommended, value.chosen);
                    //remove checked recommended standards from chosen
                    _removeCheckedStandards(value.chosen, value.recommendedChecked);

                    _createPackageUI(key, value);
                });

                if (!_isReadOnly && !_disableAddStandardsBtn) {
                    var isDisabled = editMode.readOnlyMode || _.isEmpty(repo.get(repo._courseId).data.standartsPackages);
                    moreButton = HTMLControlFactory.button(_addStandardsBtnId, "btn", ((isDisabled ? "disabled " : "") + 'canBeDisabled="false"'), i18n._("((Add Standards))"));
                    buttonObj = $(moreButton).eq(0);
                    buttonObj.appendTo($(_parentId));
                    buttonObj.on("click", _showStandardsTree.bind(this));
                }

            }
            function enableAddStandartButton(){
                $("#"+_addStandardsBtnId).removeAttr('disabled');
            }

            function dispose() {
                $(_parentId).find("*").addBack().unbind();
                $(_parentId).empty();
            }

            constructor();

            return {
                render: render,
                dispose: dispose,
                reRender: reRender,
                enableAddStandartButton : enableAddStandartButton
            }


        }


        return StandardsList;
    })
;
