define([], function () {
	return {
		narration_show: {
			'singleStyle': true,
			'bankStyle': true,
			'singleStyleNoInfoBaloon': true,
			'singleStylePlainText': true,
			'plain': false
		},
		modes: {
            'custom': function (record, customConfig, settings) {
                var group_aliases = {
                    "styles": "menu-button-text-style",
                    "effects": "menu-button-text-effects",
                    "insert": "text-viewer-insert-menu-btn-group",
                    "font": "menu-button-font-style",
                    "paragraph": "menu-button-paragraph-style"
                };

                var menu_context = customConfig.menuItems[0];

                var groups = _.map(settings.groups, function (item) {
                    return group_aliases[item];
                })

                menu_context.subMenuItems = _.filter(menu_context.subMenuItems, function (item) {
                    return !item.id  || (~groups.indexOf(item.id));
                })
            },
            'singleStyle': function f1125(record, customConfig) {
                if (customConfig.menuItems.length) {
                    customConfig.menuItems[0].subMenuItems.splice(0, 1);
                }
            },
            'bankStyle': function f1126(record, customConfig) {
                this.disableMenuItems(customConfig.menuItems, 'menu-button-paragraph-math');
                this.disablesSpecificMenuItem(customConfig.menuItems, 'menu-button-insert-ib');
            },
            'noInfoBaloon' : function(record, customConfig){
                this.disablesSpecificMenuItem(customConfig.menuItems, 'menu-button-insert-ib');
            },
            'singleStyleNoInfoBaloon': function f1127(record, customConfig) {
                if (customConfig.menuItems.length) {
                    customConfig.menuItems[0].subMenuItems.splice(0, 1);
                    
                    this.disablesSpecificMenuItem(customConfig.menuItems, 'menu-button-insert-ib');
                }
            },
            'singleStylePlainText' : function(record, customConfig){
                if (customConfig.menuItems.length) {
                    customConfig.menuItems.splice(0, customConfig.menuItems.length);
                    customConfig.menuInitFocusId = 'menu-button-task';
                    
                }
            },
            'plain': function f1128(record, customConfig) {
                customConfig.menuItems.splice(0, customConfig.menuItems.length);
                
            },
            'thin': function f1129(record, customConfig) {
                var removed = 0;

                _.each(require('cgsUtil').cloneObject(customConfig.menuItems[0].subMenuItems), function f1130(item, i) {
                    if (record.type === 'AnswerFieldTypeText') {
                        customConfig.menuItems[0].subMenuItems.splice(i - removed, 1);
                        ++removed;
                    } else {
                        if (item.id !== 'text-viewer-insert-menu') {
                            customConfig.menuItems[0].subMenuItems.splice(i - removed, 1);
                            ++removed;
                        } else {
                            ++removed;
                        }
                    }
                });

                // Disable menu items if this text viewer is a table summary/header
                var styleOverride = record.data.styleOverride;
                if (styleOverride == 'tableSummary' ||
                    styleOverride == 'tableHeader')
                {
                    this.disableMenuItems(customConfig.menuItems, '');
                }

                return true;
            }
        },
        //check if the hyper link button should be added to the TVE menu
        configureHyperLinkButton: function(record, config){
            //default value is fale
            var hasLink = false;

            //these are parents that can have TVE with hyper link button
            var hyperLinkParents = [
                {'type': 'question'},
                {'type': 'hint'},
                {'type': 'table', 'dependencies':[{'type':'question'}]},
                {'type': 'subQuestion'},
                {'type': 'title', 'dependencies':[{'type':'selfCheck'}]},
                {'type': 'feedback'},
                {'type': 'sharedContent'}
            ];
            //get all the ancestors of the current TVE
            var parents = require('repo').getAncestors(record.id);

            //loop over availabel parents and check if they are the TVE ancestor
            for (var i = 0; i < hyperLinkParents.length; i++) {
                var linkParent = hyperLinkParents[i];

                var parentOfType = _.filter(parents, {'type' : linkParent.type });
                //ancestor is from proper type
                if(parentOfType.length){
                    //check for parent dependencied
                    if(linkParent.dependencies){
                        var dependenciesCount = linkParent.dependencies.length;
                        var count = 0;

                        _.each(linkParent.dependencies, function(parentDependency){
                            var dependency = _.filter(parents, {'type' : parentDependency.type });
                            if(dependency.length){
                                count++;
                            }
                        });
                        //check that all the dependencies are ancestors
                        if(count == dependenciesCount){
                            hasLink = true;
                            break;
                        }
                    }else{
                        hasLink = true;
                        break;
                    }
                }
            }

            if(!hasLink){
                this.disablesSpecificMenuItem(config.menuItems, 'menu-button-insert-link');
            }
        }
	};
});