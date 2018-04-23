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
var courseIdsToCheck = ["e7a1c322-77d3-4f21-b717-0000112642c1","1b3403d5-6edf-4fbf-a5d2-f311894a9705","46da05e7-aec1-4d7a-970e-1a1f64006cf9","5da059df-4a79-44a2-b13e-9e2467684b61", "22267acf-9b4c-4ace-b571-a9ec315bf024", "7440a321-c212-46f8-b6e9-db56219eb5e9","5a4e68f0-f537-4f09-8de0-c07d9a907dcb","80454f75-c39c-4bb5-8d2e-0ed2bddc212f","48124168-ad0f-4b90-8cba-bd4f97cd90fb","c6cdd206-e960-4011-9147-63d510b40d23"];

/*
db.applets.find({"applets.0": {$exists: true}}).forEach(function (appletsAttribute) {
    courseIdsToCheck.push(appletsAttribute.courseId);
});
*/

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