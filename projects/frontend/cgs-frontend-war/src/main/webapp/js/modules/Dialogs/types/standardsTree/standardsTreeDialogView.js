define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'translate', 'learningPathModel', 'router', 'modules/Dialogs/BaseDialogView',
	'text!modules/Dialogs/types/standardsTree/standardsTreeDialog.html',
	'text!modules/Dialogs/types/standardsTree/standardTreeRowTemplate.html'],
function(_, $, BaseView, Mustache, events, i18n, learningPathModel, router, BaseDialogView, template, rowTemplate) {

    function _getTreeSelectedStandards() {
        var selectedStandards =  this.$el.find("input.standardSelection:checked");
        var returnValue = [];
        // reset flat standard checked status
        _.each(this.flatStandard, function(value) {
        	if (value.isCheckable) {
        		value.isChecked = false;
			}
        });
        this.$el.find("li.selected").removeClass("selected");
        _.each(selectedStandards, function(standard){
            var key = this.getFlatStandardsKey({
                name : $(standard).attr('pkgName'),
                subjectArea : $(standard).attr('pkgSubjectArea'),
                pedagogicalId : $(standard).attr('id').substr(6)
            });
            var standardObject = {};
			if (this.flatStandard[key].isCheckable) {
				this.flatStandard[key].isChecked = true;
			}
            _.each(this.flatStandard[key], function(value, index) {
                if ( index != "children" ) {
                    standardObject[index] = value;
                }
            });
            returnValue.push(standardObject);
            $(standard).closest("li").addClass("selected");
        }, this);
		_checkSelectAllLabelChanges.call(this);
        return returnValue;
    }

    function _checkSelectAllLabelChanges() {
    	var allChildrenChecked = function(standard) {
    		var noOfChildren = 0;
    		var noOfChecks = 0;
			if (!standard.children) {
    			return {
					noOfChildren: noOfChildren,
					noOfChecks: noOfChecks
				};
    		}
    		standard.children.forEach(function(std) {
    			var x = allChildrenChecked.call(this, std);
    			noOfChildren += x.noOfChildren;
    			noOfChecks += x.noOfChecks;
    			if (std.isChecked) noOfChecks++;
    			if (std.isCheckable) noOfChildren++;
    		}.bind(this));
			if (!standard.selectAllElem) {
				var selectAllElements = this.$el[0].getElementsByClassName("select-all");
				for (var i = 0; i < selectAllElements.length; i++) {
					if (selectAllElements[i].getAttribute('data-pedagogical-id') == standard.pedagogicalId) {
						standard.selectAllElem = selectAllElements[i];
						break;
					}
				}
			}
			if (noOfChecks == noOfChildren) {
				//TODO: need to be translated
    			standard.selectAllElem.innerText = "Clear all";
				standard.selectAllElem.setAttribute("data-mode", "clear");
    		} else {
    			standard.selectAllElem.innerText = "Select all";
				standard.selectAllElem.setAttribute("data-mode", "select");
    		}
			return {
				noOfChildren: noOfChildren,
				noOfChecks: noOfChecks
			};
    	};

     	_.each(this._standards, function(standard) {
     		if (standard.standards && standard.standards.children) {
    			allChildrenChecked.call(this, standard.standards);
    		}
     	}.bind(this));
    }

	var standardsTreeDialogView = BaseDialogView.extend({
		tagName : 'div',
		className : 'css-dialog css-treeview',

		initialize: function(options) {

			this.customTemplate = template;
			this._super(options);
			this.registerEvents();

		},

		render: function( $parent ) {
            var StandardsList = require("StandardsList"),
                standardListObj;
			this.standardsTree = this.getTreeHtml();
			this._super($parent, this.customTemplate);
            this.standardListObj = new StandardsList(
                {
                    itemId: '#selectedContainer',
                    repoId: require("courseModel").getCourseId(),
                    getStandardsFunc: function() {
                        return { chosen: _getTreeSelectedStandards.call(this) };
                    }.bind(this),
                    removeStandardsFunc: this.deselectStandard.bind(this),
                    isReadOnly: false,
                    disableAddStandardsBtn: true
                });

            $("#treeContainer .standardSelection").on("click", this.standardListObj.reRender);
            $("#treeContainer .select-all").on("click", this.checkAllChildren.bind(this));
            
            this.$("[rel=tooltip]").tooltip({
	               'content': function(){
	                    return $(this).attr('title');
	               }
	        })
		},

		registerEvents: function(){
		
		},

		beforeTermination: function() {
			var selectedStandards = _getTreeSelectedStandards.call(this);
			this.controller.setReturnValue('save', selectedStandards);
		},

		getTreeHtml: function(){
			var cid = require("courseModel").getCourseId();
			var courseStandartsPackages = require('cgsUtil').cloneObject(require("repo").get(cid).data.standartsPackages);
			
			var html = null ;
			
			if( courseStandartsPackages && _.size(courseStandartsPackages) > 0 ) {
				
				this.selectedStandards = require("repo").get(this.options.config.repoContextId).data.selectedStandards;
				
				this._standards = courseStandartsPackages;
				
				html = this.createTree() ;
				
			} else {
				
				html = i18n._("Course does not contain any standard packages.") ;
				
			}
			return html;
		},
		createTree:  function() {

			var html = '';
			_.each(this._standards, function(package){
				html += '<li><input type="checkbox" id="selectNode-CE" class="toggle-box">' +
                            '<label rel="tooltip" title="' + package.description + '" class="tree-title"> <b>' + package.name +' </b> ' + package.subjectArea + '</label>'+'<ul><li>'+
							this.createStandardsNodes(package.standards, package, true, null)+ '</li></ul></li>';
			}, this);

			return  '<ul>'+ html + '</ul>';


		},
		createStandardsNodes : function(standardItem, packageItem, skipFirstLevel, parent){

			var pkgDataToMerge = {},
                packageNameToStandard,
                html = "";
			_.each(packageItem, function(value, index) {
				if (index != "standards" && index != "description") {
					pkgDataToMerge[index] = value ;
				}
			});
            packageNameToStandard = (pkgDataToMerge["name"] === standardItem["name"])? "": standardItem["name"];
            standardItem["standardName"] = standardItem["standardName"] ||  packageNameToStandard;

            if (!skipFirstLevel)  {
                var mustacheObject = $.extend(standardItem, pkgDataToMerge);
                mustacheObject.isChecked = this.isStandardChecked(standardItem);
                mustacheObject.isLeaf = !standardItem.children;
                mustacheObject.isCheckable = (eval(standardItem.taggable) == null)? false: eval(standardItem.taggable);
                html = Mustache.render(rowTemplate, mustacheObject);
            }
			if (standardItem.children) {
				html += '<li data-pedagogical-id=' + standardItem.pedagogicalId + ' class="select-all"> Select All </li>';
				_.each(standardItem.children, _.bind(function(standard) {
                    html += '<li>' +  this.createStandardsNodes(standard, packageItem, false, standardItem) + '</li>';
				}, this));
				html += '</ul>';

				
			} 
			if (!this.flatStandard)	this.flatStandard = {};
			this.flatStandard[this.getFlatStandardsKey({name : packageItem.name,
														subjectArea: packageItem.subjectArea,
														//version : packageItem.version,
														pedagogicalId : standardItem.pedagogicalId })] = standardItem;

			return html;
		},
		getFlatStandardsKey: function(params){

			return params.name+"_"+params.subjectArea +"_"+params.pedagogicalId;

		},
		isStandardChecked: function(standardItem, packageItem){
            var item = _.find(this.selectedStandards, function(obj){
                return require("standardsModel").isEqualStandards(obj,standardItem);
            });

			return item !== undefined;

		},
		checkAllChildren: function(e) {
			var $target = $(e.target);
			var checked = $target.attr("data-mode") == "select";
			$target.parent().find("input").each(function(index, inputEl) {
				inputEl.checked = checked;
			});
			this.standardListObj.reRender();
		},
		deselectStandard: function(e) {
			var standardId = $(e.target).attr("standard-id");
			var pedagogicalId = this.flatStandard[standardId].pedagogicalId;
			var input = document.getElementById('input_' + pedagogicalId)
			input.checked = false;
			this.standardListObj.reRender();
		}

	}, {type: 'standardsTreeDialogView'});

	return standardsTreeDialogView;

});
