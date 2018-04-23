define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'repo','translate', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/learningPath/learningPath.html', 'text!modules/Dialogs/types/learningPath/intervalCell.html', 'text!modules/Dialogs/types/learningPath/lessonsCell.html', 'text!modules/Dialogs/types/learningPath/lessonSelect.html', 'text!modules/Dialogs/types/learningPath/dialogHeader.html'],
    function learninPath(_, $, BaseView, Mustache, events, repo, i18n, BaseDialogView, template, intervalCellTemplate, lessonsCellTemplate, lessonSelectTemplate, dialogHeaderTemplate) {

		function updateLocalData(obj) {
			obj.groupedIntervals = _.groupBy(obj.learningPath.standardIntervals, 'pedagogicalId');
			obj.linkedLessons = {};
			for (var g in obj.groupedIntervals) {
				var intervals = obj.groupedIntervals[g];
				for (var i = 0; i < intervals.length; i++) {
					var int = intervals[i];
					for (var j = 0; j < int.tocItemRefs.length; j++) {
						var ref = int.tocItemRefs[j];
						if (!obj.linkedLessons[ref.cid]) obj.linkedLessons[ref.cid] = {};
						if (!obj.linkedLessons[ref.cid][int.pedagogicalId]) obj.linkedLessons[ref.cid][int.pedagogicalId] = {};
						obj.linkedLessons[ref.cid][int.pedagogicalId][i] = 1;
					}
				}
			}
		}
	
        var learningPathDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',
            dataObj : {},
			
            initialize: function initialize(options) {
                this.customTemplate = template;
                this.learningPath = options.config.learningPath;
                this.expandedLessons = {};
                this.expandedLinks = {};
                updateLocalData(this);
                options.config.standards = _.map(this.groupedIntervals, function (obj, key) {
                	var value = {};
                	value.pedagogicalId = key;
                    if (obj[0].standardName) value.standardName = obj[0].standardName;
                	return value;
                });
                this._super(options);
            },

            render: function render($parent) {
                this._super($parent, this.customTemplate);
                this.renderIntervals();
                this.bindEvents(); 
            },

            renderLessonSelect: function renderLessonSelect(interval) {
                var id = this.options.config.id;
                if (!id) return;
                var self = this;
                var currentLessonId = require("lessonModel").lessonId, currentTocId;
                if (repo.getParent(currentLessonId).type == "course") {
					currentTocId = repo.getParent(currentLessonId).id;
                } else {
                	currentTocId = repo.getAncestorRecordByType(currentLessonId, "toc").id;
                }
				this.renderLessons(this.$('#dialogContent'), currentTocId, interval, true);
				this.$('#dialogTitle').html(Mustache.render(i18n._(dialogHeaderTemplate), {
					pedagogicalId: interval.pedagogicalId,
					standardName: interval.obj.standardName,
					level: parseInt(interval.index) + 1,
					intervalMin: interval.obj.scoreInterval.min,
					intervalMax: interval.obj.scoreInterval.max
				}));
				this.$('#dialogTitle .back_btn').on('click' , function () {
				     self.renderStandardsList();
				});
				this.$('#dialogContent .lesson_row ').each(function (i , e) {
					var id = e.id;
					var expanded = self.expandedLinks[id];
					var le = $(e);
					le.addClass(expanded? 'expanded': 'closed');
					le.find('.lesson_links').each(function (i, e) {
						if (e.scrollHeight > e.clientHeight + 10) {
							$(e).addClass('expandable');
						}
					})
				});
				this.bindLessonsEvents();
            },

            renderStandardsList: function renderStandardsList() {
                var html = Mustache.render(i18n._(template), this);
                this.$('#dialogTitle').html('<div id="dialogTitle" class="modal-header"><h3>'+i18n.tran('dialog.learningpath.title') + '</h3></div>');
                this.$('#dialogContent').html(html);
                this.renderIntervals();
                this.bindEvents();
            },

            renderLessons: function renderLessons(div, id, interval, firstIteration) {
                var record = repo.get(id);
                if (!record) return;
                var children = [];
                if (firstIteration && record.type != "course") {
					children.push(record);
                } else {
                	children = repo.getChildren(id);
                }              
                if (!children.length) return;
                var tocs = [];
                var lessons = [];
                var pid = interval.pedagogicalId;
                var ii = interval.index;
                for (var i = 0; i < children.length; i++) {
                    var c = children[i];
                    if (c.type == 'toc') {
                        tocs.push(c);
                    } else if (c.type == 'lesson') {
                    	if (c.id == this.learningPath.assessmentCid) continue;
                    	var l = Object.assign({}, c);
                    	if (this.linkedLessons[c.id]) {
                    		l.selected = !!(this.linkedLessons[c.id][pid] && this.linkedLessons[c.id][pid][ii]);
                    		var self = this;
                    		l.linkedTo = _.reduce(this.linkedLessons[c.id], function(result, el, k) {
                    			return result.concat(_.map(el, function (eli, k2) {
                    				var standardName = self.learningPath.standardsByPid[k].standardName;
                    				return {
                    					pedagogicalId: k,
                    					standardName: standardName,
                    					levelNo: parseInt(k2) + 1
									};
                    			}));
                    		}, []);
                    		l.isLinked = l.linkedTo.length;
                    	}
                        lessons.push(l);
                    }
                }
                var html = Mustache.render(i18n._(lessonSelectTemplate), {
                    lessons: lessons
                });
                div.html(html);
                div = div.find(".lessons_table");
                for (var i = 0; i < tocs.length; i++) {
                    var t = tocs[i];
                    if (t.children.length) {
                    	div.append('<div class="toc_item">' + t.data.title + '</div>');
                    	div.append('<div id="toc_lessons_' + t.id + '" class="lessons_container"></div>');
                    }
                    var d = div.find("#toc_lessons_" + t.id);
                    this.renderLessons(d, t.id, interval, false);
                }
            },

            renderIntervals: function renderIntervals() {
            	this.$('#settings_numberoflevels').val(this.learningPath.defaultLevels);
                var tbody = this.$('tbody');
                for (var i in this.groupedIntervals) {
                    var stds = this.groupedIntervals[i];
                    var stdrow = this.$('.standard_row.' + i.replace(/(\(|\)|:|\.|\[|\]|,)/g, "\\$1"));
                    stdrow.find('td').attr('rowspan', stds.length);
                    var intervalcell = stdrow.find('.standard_interval');
                    var lessonscell = stdrow.find('.standard_lessons');
                    for (var j = 0; j < stds.length; j++) {
                        if (j > 0) {
                            var nstdrow = $('<tr>');
                            nstdrow.attr("data-pedagogical-id", i);
                            nstdrow.attr("data-interval-id", j);
                            nstdrow.insertAfter(stdrow);
                            stdrow = nstdrow;
                        }
						var standard = _.assign({}, stds[j]);
						standard.disabled = (stds.length == 1);
                        var html = Mustache.render(i18n._(intervalCellTemplate), standard);
                        stdrow.append(html);
                        var intervallessons = this.getLessons(stds[j].tocItemRefs);
                        var lessonshtml = Mustache.render(i18n._(lessonsCellTemplate), {
                        	lessons : intervallessons,
                         	hasLessons: !!intervallessons.length,
                         	length: intervallessons.length,
                         	expandable: intervallessons.length > 3});
                        stdrow.append(lessonshtml);
                    }
                }
            },

            bindEvents: function bindEvents() {
                this.$('.edit_lessons').on('click', _.bind(function(e) {
                	var $elem = $(e.currentTarget).parents('tr');
                    var intervalId = $elem.data('intervalId');
                    var pedagogicalId = $elem.data('pedagogicalId');
                    this.selectedInterval = {
                    	obj: this.groupedIntervals[pedagogicalId][intervalId],
                        pedagogicalId: pedagogicalId,
                    	index: intervalId
                    };
					this.expandedLinks = {};
                    this.renderLessonSelect(this.selectedInterval);
                }, this)); 

                 this.$('.btn_delete').on('click', _.bind(function(e) {
                    var $elem = $(e.currentTarget).parents('tr');
                    var intervalId = $elem.data('intervalId');
                    var pedagogicalId = $elem.data('pedagogicalId');
					this.deleteInterval(pedagogicalId, intervalId);
                }, this)); 

                 this.$('.btn_add').on('click', _.bind(function(e) {
                    var $elem = $(e.currentTarget).parents('tr');
                    var intervalId = $elem.data('intervalId');
                    var pedagogicalId = $elem.data('pedagogicalId');
					this.addInterval(pedagogicalId, intervalId);
                }, this)); 

                this.$('.btn_more').on('click', _.bind(function(e) {
                   $(e.currentTarget).parents('#lessons_list').addClass('expanded');
                }, this));
                this.$('.btn_less').on('click', _.bind(function(e) {
                   $(e.currentTarget).parents('#lessons_list').removeClass('expanded');
                }, this)); 
				this.$('.settings').on('click', _.bind(function(e) {
                   $(e.currentTarget).parents('#learning_path').find('#settings_dropdown').toggleClass('hide');
                }, this)); 
				this.$('#settings_cancel').on('click', _.bind(function(e) {
                   $(e.currentTarget).parents('#settings_dropdown').toggleClass('hide');
                }, this)); 
				this.$('#settings_set').on('click', _.bind(function(e) {
					var settingsE = $(e.currentTarget).parents('#settings_dropdown');
                   settingsE.toggleClass('hide');
				   var val = settingsE.find('#settings_numberoflevels').val();
				   this.setLevels(val);
                }, this)); 

            },

            bindLessonsEvents: function bindEvents() {
                var self = this;
                this.$('.lesson_row input[type="checkbox"]').on('change', _.bind(function(e) {
                    var val = e.currentTarget.checked;
                    var lid = e.currentTarget.id.split('_')[1];
                    var pid = self.selectedInterval.obj.pedagogicalId;
                    var i =  self.selectedInterval.index;
                    if (val) {
                        if (!self.linkedLessons[lid]) self.linkedLessons[lid] = {};
                        if (!self.linkedLessons[lid][pid]) self.linkedLessons[lid][pid] = {};
                        if (!self.linkedLessons[lid][pid][i]) {
                        	self.linkedLessons[lid][pid][i] = 1;
                        	self.selectedInterval.obj.tocItemRefs.push({"cid":lid, "type": "lesson"});
                        }
                    } else {
                    	if (self.linkedLessons[lid][pid][i]) {
                        	delete self.linkedLessons[lid][pid][i];
                        	_.remove(self.selectedInterval.obj.tocItemRefs,function (value) {
                        		return (value.cid == lid);
                        	});
                        }
                    }
                }, this));

                 this.$('.lesson_row .lesson_links .links_more').on('click', function (e) {
                 	var row = $(e.currentTarget).parents('.lesson_row');
                 	var id = row.attr('id');
                 	self.expandedLinks[id] = true;
                 	row.find('.lesson_links').addClass('expanded');
                 });

                 this.$('.lesson_row .lesson_links .links_less').on('click', function (e) {
                 	var row = $(e.currentTarget).parents('.lesson_row');
                 	var id = row.attr('id');
                 	self.expandedLinks[id] = false;
                 	row.find('.lesson_links').removeClass('expanded');
                 });
            },

            events: {
                'dblclick #standards_packages tr.enabled' : 'packageClicked',
                'click #standards_packages tr.enabled' : 'packageSelected',
            },
            packageClicked: function(event) {
                var selectedPkg = this.options.config.standardPackages[event.currentTarget.rowIndex-1];
                this.controller.setReturnValue('stdPkg', selectedPkg );
                this.controller.onDialogTerminated('stdPkg');
            },
            
            packageSelected: function(event){

                var selectedPkg = this.options.config.standardPackages[event.currentTarget.rowIndex-1];
                
                $("#standards_packages tr.enabled").removeClass('selected'); // remove selected class from all rows
                $(event.currentTarget).addClass('selected');//add selected calss to current selected row
               
                this.controller.setReturnValue('Add', selectedPkg );
                this.$('#Add').removeAttr('disabled').removeClass('disabled');


            },

            getLessons: function getLessons(tocItemRefs) {
                return tocItemRefs.map(function (item) {
                   return repo.get(item.cid);
                })
            },

            beforeTermination: function() {
				this.controller.setReturnValue('save', this.learningPath);
			}, 

			deleteInterval: function (pedagogicalId, count, forced) {
				var intervals =  this.groupedIntervals[pedagogicalId];
				var intSize = 100/intervals.length;
				var min = Math.ceil(count*intSize);
				var self = this;
                var key = _.findKey(this.learningPath.standardIntervals,function (value, a, b) {
                	  return (value.pedagogicalId == pedagogicalId && value.scoreInterval.min == min);
                });
                if (key == null) return;
                var interval = this.learningPath.standardIntervals[key];
                if (interval.tocItemRefs.length && !forced) {
					require('showMessage').showDialog('Checking Type Warning Lesson',{message:'warning.learningpath.deleteinterval'}, function (ok) {
						if (ok) {
							self.deleteInterval(pedagogicalId, count, true);
						}
					})
					return false;
				}
                this.learningPath.standardIntervals.splice(key, 1);
                this.updateIntervals(pedagogicalId);
			},


			addInterval: function (pedagogicalId, count) {
				var intervals =  this.groupedIntervals[pedagogicalId];
				var packageId = intervals[0].stdPackageId;
				var intSize = 100/intervals.length;
				var min = Math.ceil(count*intSize);
				var interval = {
					stdPackageId: packageId,
					pedagogicalId: pedagogicalId,
					scoreInterval: {},
                    tocItemRefs: []
				};
				var key = _.findKey(this.learningPath.standardIntervals,function (value, a, b) {
                	 return (value.pedagogicalId == pedagogicalId && value.scoreInterval.min == min);
                });
                this.learningPath.standardIntervals.splice(key+1, 0, interval);
                this.updateIntervals(pedagogicalId);
			}, 

			updateIntervals: function(pedagogicalId) {
				var intervals = _.filter(this.learningPath.standardIntervals, {pedagogicalId: pedagogicalId});
				var intSize = 100/intervals.length;
                for (var i = 0; i < intervals.length; i++) {
					var interval = intervals[i];
					interval.scoreInterval.min = Math.ceil(i*intSize);
					interval.scoreInterval.max = Math.floor((i+1)*intSize);
                }
                updateLocalData(this);
                this.renderStandardsList();
			}, 

			setLevels: function (val, forced) {
				require('showMessage').showDialog('Checking Type Warning Lesson',{message:'warning.learningpath.setintervals'}, function (ok) {
					if (ok) {
						this.learningPath.defaultLevels = parseInt(val);
						for (var g in this.groupedIntervals) {
							var ints = this.groupedIntervals[g];
							var len = ints.length;
							while (val > len) {
								this.addInterval(g, len);
								len = this.groupedIntervals[g].length;
							}
							while (val < len) {
								this.deleteInterval(g, len - 1 , true);
								len = this.groupedIntervals[g].length;
							}
						}
					}
				}.bind(this));
				
			}
			



        }, {type: 'learningPathDialogView'});

return learningPathDialogView;

});