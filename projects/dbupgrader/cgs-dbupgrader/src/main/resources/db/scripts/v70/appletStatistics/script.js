load("C:/appletStatisticsScript/json_sans_eval.js");
var appletsSummary = {};

function addOneToCounter(appletId) {
    if (appletsSummary.hasOwnProperty(appletId)) {
        appletsSummary[appletId] = appletsSummary[appletId] + 1; // add 1
    } else {
        appletsSummary[appletId] = 1; // first occurrence
    }
}

// get all courses that have applets
var courseIdsToCheck = [];
db.applets.find({"applets.0": {$exists: true}}).forEach(function (appletsAttribute) {
    courseIdsToCheck.push(appletsAttribute.courseId);
});

print("Going over " + courseIdsToCheck.length + " courses that have applets");

/// get all lessons with applets
var lessonsToCheck = db.lessons.find({
    "cgsData.courseId": {$in: courseIdsToCheck},
    "contentData.resources": {$elemMatch: {'baseDir': /applets/}}
});

var assessmentsToCheck = db.assessments.find({
    "cgsData.courseId": {$in: courseIdsToCheck},
    "contentData.resources": {$elemMatch: {'baseDir': /applets/}}
});

print("In these courses there are " + lessonsToCheck.count() + " lessons and "+assessmentsToCheck.count()+" assessments that use one or more applets");

var sequencesHandled = 0;
// print applet ids for a single sequence
function handleSequence(sequence) {
    var contentJson = jsonParse(sequence.content);
    sequencesHandled++;
    for (var taskId in contentJson) {
        var task = contentJson[taskId];
        if (task != null) {
            if (task.type == "applet") {
                addOneToCounter(task.data.appletId);
            }
        }
    }
}

var index = 0;
lessonsToCheck.forEach(function (lesson) {
	print("handle lesson: "+index);
	handleTocItem(lesson);
	index++;
});

var index = 0;
assessmentsToCheck.forEach(function (assessment) {
	print("handle assessment: "+index);
    handleTocItem(assessment);
	index++;
});

print(">>>>>>>>>>> summary: ");
print("Counted sequences"+sequencesHandled);
print("appletId,count");
for (var appletId in appletsSummary) {
    print(appletId + "," + appletsSummary[appletId]);
}

function handleTocItem(tocItem) {
    var tocItemSequences = db.sequences.find({
        lessonCId: tocItem.contentData.cid,
        courseId: tocItem.cgsData.courseId
    });
    tocItemSequences.forEach(function (sequence) {
        handleSequence(sequence);
    });
};