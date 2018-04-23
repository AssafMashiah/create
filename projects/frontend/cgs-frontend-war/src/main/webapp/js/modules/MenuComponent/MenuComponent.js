define(['lodash', 'BaseController', './MenuComponentView', 'events', './config', './constants', 'repo'],
    function f907(_, BaseController, MenuComponentView, events, config, constants, repo) {

        var MenuComponent = BaseController.extend({

            initialize: function f908(configOverrides) {
                this._super(config, configOverrides);
                this.constants = constants;

                // default menu items configuration
                this.defaultMenuItems = this.config.menuItems;

                this.view = new MenuComponentView({controller: this});

                // set default items
                this.setItems({}, true);

                this.registerEvents();
            },

            registerEvents: function f909() {
                this.bindEvents({
                    'disable_menu_item': {'type': 'register', 'func': this.view.disableMenuItem, 'ctx': this, 'unbind': 'dispose'},
                    'enable_menu_item': {'type': 'register', 'func': this.view.enableMenuItem, 'ctx': this, 'unbind': 'dispose'}
                });
            },

            refreshMenu: function f911() {
                this.setItems(this.extendedConfig, false, this.menuInitFocusId);
            },

            setMenuTab: function(menuId) {
                if ($('#' + menuId).length) {
                    this.setItems(this.extendedConfig, false, menuId);
                }
            },

            setItems: function f912(itemsConfig, appendToDefault, menuInitFocusId) {
                var extendedConfig = itemsConfig;

                if (appendToDefault) {
                    extendedConfig = itemsConfig.length ? _.union(this.defaultMenuItems, itemsConfig) : this.defaultMenuItems;
                }

                this.extendedConfig = extendedConfig;
                this.menuInitFocusId = menuInitFocusId;

                //check shown menu width according to view port
                var resultJson = this.checkMenuWidth($.extend(true, {}, extendedConfig), menuInitFocusId);

                //if config has been changed - render it with new configuration
                if (_.isEqual(resultJson.newConfig, extendedConfig) == false) {
                    this.view.setItems(resultJson.newConfig, menuInitFocusId);
                }
            },

            checkMenuWidth: function f913(extendedConfig, menuInitFocusId) {
                var shownMenuConfig, self = this;
                //find config of current shown menu
                if (!!menuInitFocusId) {
                    shownMenuConfig = _.where(extendedConfig, {id: menuInitFocusId})[0];
                } else {
                    //first menu config if there is no focus id passed by configuration
                    shownMenuConfig = extendedConfig[0];
                }

                if (shownMenuConfig) {

                    var viewPortWidth = this.view.getMenuViewPortWidth();
                    var rsWidth = viewPortWidth - this.constants.marginFactor;  //view port width minus margin factor
                    var menuWidth = 0;

                    //num of sub menus multiplied by menu dom width
                    var subMenusWidthArray = _.map(shownMenuConfig.subMenuItems, function f914(element, index, list) {
                        var elWidth;
                        if (element.type === 'btn-group-scroll') {
                            elWidth = self.constants.menuScrollItemWidth;
                        }
                        else if (element.type == "btn-group-title"){
                            var locale = require('userModel').account.interfaceLocales.selected;
                            var textualMenuWidths = self.constants.textualMenuWidths[locale] || self.constants.textualMenuWidths['default'];
                            
                            switch(element.id){
                                case "menu-lesson-activities-group":
                                    var lesson = require("repo").get(require("lessonModel").getLessonId());
                                    var isEbook = lesson.data.format == "EBOOK";
                                    var hasQuiz = require('userModel').account.enableQuiz;
                                
                                    elWidth = textualMenuWidths[isEbook || !hasQuiz ? "addLo" : "addLoAndQuiz"];
                                break;
                                case "sequence-insert-menu":
                                    elWidth = textualMenuWidths[require("lessonModel").isLessonModeAssessment() ? "assessmentSequenceTasksMenuWidth" : "sequenceTasksMenuWidth"];
                                break;
                                default:
                                    elWidth = (element.subMenuItems && element.subMenuItems.length || 0) * self.constants.menuItemWidth;
                                break;

                            }
                        }
                        else {
                            elWidth = (element.subMenuItems && element.subMenuItems.length || 0) * self.constants.menuItemWidth;
                        }

                        return {
                            'subMenuIndex': index,
                            'subMenuLength': element.subMenuItems.length,
                            'elementWidth': elWidth
                        };
                    });

                    //sum of sub-menus width
                    menuWidth = calcMenuWidth(subMenusWidthArray);

                    var widthDiff = rsWidth - menuWidth, tmpElem, numOfMenusToCollapse = 0;
                    while ((widthDiff < 0) && (numOfMenusToCollapse <= subMenusWidthArray.length)) { //View Port smaller than optimum width
                        //If the collapse of 1 group is not enough the next group will collapse and so forth
                        numOfMenusToCollapse += 1;
                        //First buttons group from right to left that contains more than 1 button is collapsed into a drop-down named by the group name
                        tmpElem = _.last(_.filter(subMenusWidthArray, function f915(item) {
                            return item.subMenuLength > 1;
                        }), numOfMenusToCollapse);

                        //update subMenuWidth according to collapsed width
                        for (var item in tmpElem) {
                            tmpElem[item].elementWidth = this.constants.menuItemWidth;
                        }

                        //calc new menu width
                        menuWidth = calcMenuWidth(subMenusWidthArray);
                        widthDiff = rsWidth - menuWidth;
                    }

                    if (numOfMenusToCollapse > 0) {
                        _.each(tmpElem, function f916(element, index, list) {
                            buildNewConfig(shownMenuConfig, element.subMenuIndex);
                        });
                    }

                }

                function calcMenuWidth(subMenusWidthArray) {
                    var menuWidth = 0;
                    _.each(subMenusWidthArray, function f917(element, index, list) {
                        menuWidth += element.elementWidth;
                    });
                    return menuWidth;
                }

                function buildNewConfig(shownMenuConfig, subMenuIndex) {
                    var subMenuToCollapse = shownMenuConfig.subMenuItems[subMenuIndex];

                    if (!!subMenuToCollapse) {
                        //build new config for collapsed group
                        var dropDownItems = _.clone(subMenuToCollapse.subMenuItems);
                        var newConfig = [
                            {
                                'id': subMenuToCollapse.id,
                                'icon': '',
                                'label': subMenuToCollapse.label,
                                'notImplemented': subMenuToCollapse.notImplemented,
                                'canBeDisabled': true,
                                'dontStealFocus': true,
                                'dropDownItems': dropDownItems
                            }
                        ];

                        subMenuToCollapse.type = 'btn_dropdown';
                        subMenuToCollapse.subMenuItems = newConfig;
                    }

                    return subMenuToCollapse;
                }

                return {'newConfig': extendedConfig, 'numOfMenusToCollapse': numOfMenusToCollapse};

            },

            getCourseReferencesCount: function f918() {
                var cid = require('courseModel').courseId;
                if (cid) {
                    var record = repo.get(cid);
                    return (record && record.data && record.data.references && record.data.references.length) || 0;
                }
                return 0;
            }

        }, {type: 'MenuComponent'});

        return MenuComponent;

    });