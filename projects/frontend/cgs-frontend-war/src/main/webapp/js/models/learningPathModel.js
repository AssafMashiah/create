define(['lodash','events', 'repo', 'PermissionsModel', 'translate', 'courseModel', 'router'],
    function(_, events, repo, permissionsModel, i18n, courseModel, router) {
	
	function getPackageId(standard, packages) {
		for (var p in packages) {
			var found = findInChildren(standard.pedagogicalId, packages[p].standards);
			if (found) return p;
		}
	}

	function findInChildren(id, standards) {
		var f;
		if (standards.pedagogicalId == id) return standards;
		if (standards.length) {
			for (var i = 0; i < standards.length; i++) {
				if (id == standards[i].pedagogicalId) return standards[i];
				if (standards[i].children) f = findInChildren(id, standards[i].children);
				if (f) return f;
			}
		}
		if (standards.children) f = findInChildren(id, standards.children);
		return f;
	}

	function getStandardsFromItems(items) {
		var standardsIds = {};
		var standardsModel = require('standardsModel');
		return items.reduce(function (r, o) {
			var stds = standardsModel.getStandards(o.id).chosen;
			if (!stds || !stds.length) return r;
			stds = stds.reduce(function (r, o) {
				if (standardsIds[o.pedagogicalId]) return r;
				r.push(o);
				standardsIds[o.pedagogicalId] = 1;
				return r;
			}, []);
			if (stds && stds.length) return r.concat(stds);
			return r;
		}, []);
	}

	function addIntervals(learningPath, standards, packages) {
		var intSize = 100/learningPath.defaultLevels;
		for (var i = 0; i < standards.length; i++) {
			var std = standards[i];
			var packageId = getPackageId(std, packages);
			if (learningPath.standardsByPid && learningPath.standardsByPid[std.pedagogicalId]) continue;
			for (j = 0; j < learningPath.defaultLevels; j++) {
				var interval = {};
				interval.stdPackageId = packageId;
				interval.pedagogicalId = std.pedagogicalId;
				interval.standardName = std.standardName;
				interval.scoreInterval = {};
				interval.scoreInterval.min = Math.ceil(j*intSize);
				interval.scoreInterval.max = Math.floor((j+1)*intSize);
				interval.tocItemRefs = [];
				learningPath.standardIntervals.push(interval);
			}
		}
	}

	function LearningPath() {}

	LearningPath.prototype = {

		forAssessment: function(courseId, assessmentCid) {
            var course = repo.get(courseId);
            var learningPath = _.find(course.data.learningPaths,{'assessmentCid' : assessmentCid});
            var packages = course.data.standartsPackages;
            if (!learningPath) {
                learningPath = {'assessmentCid' : assessmentCid};
            }
            if (!learningPath.standardIntervals) {
                learningPath.defaultLevels = 3;
                learningPath.standardIntervals = [];
            } 
            var standardsModel = require('standardsModel');
            var tasks = repo.getChildrenRecordsByTypeRecursieve(assessmentCid,'sequence').reduce(function (r, o) {
							   return r.concat(repo.getChildren(o.id))
							}, []);
			var standards = getStandardsFromItems(tasks);
			var standardsByPid = {};
			addIntervals(learningPath, standards, packages);
			learningPath.standardIntervals.forEach(function (si) {
				if (!standardsByPid[si.pedagogicalId]) {
					var standard = _.find(standards, function(st) { return st.pedagogicalId == si.pedagogicalId });
					if (standard && standard.standardName) {
						si.standardName = standard.standardName;
					} else {
						si.standardName = "";
					}
					standardsByPid[si.pedagogicalId] = si;
				} else {
					si.standardName = standardsByPid[si.pedagogicalId].standardName;
				}
			});
			learningPath.standardsByPid = standardsByPid;
            return learningPath;
		}, 

		updateIntervals: function updateIntervals(courseId, assessmentCid) {
			var course = repo.get(courseId);
			var packages = course.data.standartsPackages;
            var learningPath = _.find(course.data.learningPaths,{'assessmentCid' : assessmentCid});
			var standardsModel = require('standardsModel');
			var tasks = repo.getChildrenRecordsByTypeRecursieve(assessmentCid,'sequence').reduce(function (r, o) {
						   return r.concat(repo.getChildren(o.id))
						}, []);
			var standards = getStandardsFromItems(tasks);
			var standardsIds = {};
			learningPath.standardIntervals.forEach(function (si) {
				standardsIds[si.pedagogicalId] = 1;
			});
			_.remove(standards, function (s) {
				return standardsIds[s.pedagogicalId];
			});
			addIntervals(learningPath, standards, packages);
		},

		update: function(courseId, assessmentCid, data) {
		    var course = repo.get(courseId);
		    if (!course.data.learningPaths) course.data.learningPaths = [];
            var learningPath = _.find(course.data.learningPaths,{'assessmentCid' : assessmentCid});
            if (!learningPath) {
                learningPath = {'assessmentCid' : assessmentCid};
                course.data.learningPaths.push(learningPath);
            } 
            _.assign(learningPath, data);
			if (!learningPath.standardIntervals || !learningPath.standardIntervals.length) {
				course.data.learningPaths.splice(course.data.learningPaths.indexOf(learningPath), 1);
			}
            repo.updateProperty(courseId, 'learningPaths', course.data.learningPaths);
            this.saveCourse();
		},

		remove: function (courseId, assessmentCid) {
			var course = repo.get(courseId);
			var key = _.findKey(course.data.learningPaths,function (value, a, b) {
                 return (value.assessmentCid == assessmentCid);
            });
            if (key != null) {
				course.data.learningPaths.splice(key, 1);
                this.saveCourse();
			}
		},
		safeToRemove: function (id, standardId) {
			var obj = repo.get(id);
			if (obj.id == "assessment" || obj.type == "sequence" || obj.type == "lo") return true;
			while (obj && obj.type != "lesson") {
				obj = repo.getParent(obj);
			}
			if (!obj || obj.data.mode != "assessment") return true;
			var learningPath = _.find(repo.get(repo._courseId).data.learningPaths,{'assessmentCid' : obj.id});
			if (!learningPath) return true;
			var tasks = repo.getChildrenRecordsByTypeRecursieve(obj.id,'sequence').reduce(function (r, o) {
							   return r.concat(repo.getChildren(o.id))
							}, []);
			_.remove(tasks, function (o) { return o.id == id});
			var standards = getStandardsFromItems(tasks);
			var found = _.find(standards, {pedagogicalId: standardId});
			return !!found;
		},
		deleteStandard: function (id, standard) {
			var self = this;
			var p = new Promise(function (resolve, reject) {
				var obj = repo.get(id);
				if (obj.id == "assessment" || obj.type == "sequence" || obj.type == "lo") return resolve(true);
				while (obj && obj.type != "lesson") {
					obj = repo.getParent(obj);
				}
				if (!obj || obj.data.mode != "assessment") return resolve(true);
				var assessmentCid = obj.id;
				var learningPath = _.find(repo.get(repo._courseId).data.learningPaths,{'assessmentCid' : obj.id});
				if (!learningPath) return resolve(true);
				var tasks = repo.getChildrenRecordsByTypeRecursieve(obj.id,'sequence').reduce(function (r, o) {
								   return r.concat(repo.getChildren(o.id))
								}, []);
				_.remove(tasks, function (o) { return o.id == id});
				var standards = getStandardsFromItems(tasks);
				var found = _.find(standards, {pedagogicalId: standard.pedagogicalId});
				if (found) {
					resolve(true);
				} else {
					require('showMessage').showConfirmation(i18n.tran('Warning'), i18n.tran('warning.learningpath.deletestandard'), function (confirmed) {
					   if (confirmed) {
					   	   _.remove(learningPath.standardIntervals, function (s) { 
					   	   		return s.pedagogicalId == standard.pedagogicalId
					   	   });
					   	   self.update(repo._courseId, assessmentCid, learningPath);
						   resolve(true);
					   } else {
						   reject(false);
					   }
				     });
				}
			});
			return p;

		},
		checkAssessmentIntegrity: function(newStandards) {
			var self = this;
			return new Promise(function (resolve, reject) {
				var currentTask = require("router").activeRecord;
				if (!currentTask) return resolve(true);
				var sequence = repo.getParent(currentTask.id);
				if (!sequence || sequence.type !== "sequence") return resolve(true);
				var assessment = repo.getParent(sequence.id);
				if (!assessment || assessment.type !== "lesson" ||
					assessment.data.mode !== "assessment" || !assessment.data.placement) return resolve(true);
				var learningPath = _.find(repo.get(repo._courseId).data.learningPaths, {'assessmentCid': assessment.id});
				if (!learningPath) return resolve(true);
				var tasks = repo.getChildren(sequence.id);
				if (!tasks.length) return resolve(true);
				_.remove(tasks, function (t) { return t.id == currentTask.id});
				var standards = getStandardsFromItems(tasks);
				var currentTaskStandards = getStandardsFromItems([currentTask]);
				var removedStandards = [];
				currentTaskStandards.forEach(function (cs) {
					if (!_.find(newStandards, {pedagogicalId: cs.pedagogicalId})
						&& !_.find(standards, {pedagogicalId: cs.pedagogicalId})) {
						removedStandards.push(cs);
					}
				});
				if (removedStandards.length) {
					require('showMessage').showConfirmation(i18n.tran('Warning'), i18n.tran('warning.learningpath.deletestandard'), function (confirmed) {
						if (confirmed) {
							removedStandards.forEach(function(standard) {
								_.remove(learningPath.standardIntervals, function (s) {
									return s.pedagogicalId == standard.pedagogicalId
								});
							});
							self.update(repo._courseId, assessment.id, learningPath);
							return resolve(true);
						} else {
							return reject(false);
						}
					});
				} else {
					return resolve(true);
				}
			});
		},
		deleteLesson: function (id, standard) {
 			var self = this;
			var p = new Promise(function (resolve, reject) {
				var obj = repo.get(id);
				if (obj.id == "assessment" || obj.type == "sequence" || obj.type == "lo") return resolve(true);
				while (obj && obj.type != "lesson") {
					obj = repo.getParent(obj);
				}
				if (!obj || obj.data.mode != "assessment") return resolve(true);
				var assessmentCid = obj.id;
				var learningPath = _.find(repo.get(repo._courseId).data.learningPaths,{'assessmentCid' : obj.id});
				if (!learningPath) return resolve(true);
				var tasks = repo.getChildrenRecordsByTypeRecursieve(obj.id,'sequence').reduce(function (r, o) {
								   return r.concat(repo.getChildren(o.id))
								}, []);
				_.remove(tasks, function (o) { return o.id == id});
				var standards = getStandardsFromItems(tasks);
				var found = _.find(standards, {pedagogicalId: standard.pedagogicalId});
				if (found) {
					resolve(true);
				} else {
					require('showMessage').showConfirmation(i18n.tran('Warning'), i18n.tran('warning.learningpath.deletestandard'), function (confirmed) {
					   if (confirmed) {
					   	   _.remove(learningPath.standardIntervals, function (s) { 
					   	   		return s.pedagogicalId == standard.pedagogicalId
					   	   });
					   	   self.update(repo._courseId, assessmentCid, learningPath);
						   resolve(true);
					   } else {
						   reject(false);
					   }
				     });
				}
			});
			return p;
		}, 
		includesLesson: function (id) {
			var course = repo.get(repo._courseId);
			if (!course.data.learningPaths) course.data.learningPaths = [];
			var learningPaths = course.data.learningPaths;
			for (var i = 0; i < learningPaths.length; i++) {
				var lp = learningPaths[i];
				for (var j = 0; j < lp.standardIntervals.length; j++) {
					var si = lp.standardIntervals[j];
					for (var k = 0; k < si.tocItemRefs.length; k++) {
						if (si.tocItemRefs[k].cid == id) return true;
					}
				}		
			}
			return false;
		}, 
		removeLesson: function (id) {
			var course = repo.get(repo._courseId);
			var learningPaths = course.data.learningPaths;
			if (!course.data.learningPaths) course.data.learningPaths = [];
			learningPaths.forEach(function (lp) {
				lp.standardIntervals.forEach(function (si) {
					_.remove(si.tocItemRefs, function (ref) {
						if (ref.cid == id) return true;
					})
				})
			});
			return false;
		},
        saveCourse: function() {
            var busy = require('busyIndicator');
            busy.start();
            var courseModel =  require("courseModel");
            courseModel.saveCourse(function () {
                courseModel.setDirtyFlag(false);
                busy.stop();
            });
        },
		checkForDataIntegrity: function() {
            var courseModel =  require("courseModel");
			var allAssessments = courseModel.getAssessments();
            var learningPaths = repo.get(courseModel.getCourseId()).data.learningPaths;
            var assessmentsNotReferenced = [];
            if (learningPaths) {
                learningPaths.forEach(function (lp) {
                    if (!_.contains(allAssessments, lp.assessmentCid)) {
                        assessmentsNotReferenced.push(lp.assessmentCid);
                    }
                });
            }
            if (assessmentsNotReferenced.length) {
                logger.warn(logger.category.COURSE, 'Unreferenced objects in learning paths. Removing: ' + assessmentsNotReferenced);
                assessmentsNotReferenced.forEach(function(anr) {
                    _.remove(learningPaths, function(lp) {
                        return anr == lp.assessmentCid;
                    });
                });
            }
		}
	};

	return new LearningPath();

});
