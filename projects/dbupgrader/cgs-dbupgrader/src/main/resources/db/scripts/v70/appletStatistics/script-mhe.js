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
var courseIdsToCheck = ["46e34467-d0bf-48dc-8622-a49ba2ebe8d7", "b3b2e30a-ec57-4f13-90d9-2f32cd5dad38", "2addbc0c-b916-4736-92fa-c5663172a44a", "5f1d4346-1da6-4743-8eb1-be2de4718146", "2230d6b4-e6b2-419b-beed-e7de54579e1f", "299b0d3c-90fe-459d-ac27-c814f55f84a8", "92d8e638-e4fe-4f48-bc9d-86192d6db21a", "ac3d24e3-d981-4ef9-8b60-32b650824415", "a682da60-eb8c-491e-8e41-5ca2ed108aff", "5e778bf7-f69a-4cf8-afaf-de9dfa92467c", "1024d37f-c3c0-4aca-817d-939cef3674f3", "6639a671-dc10-4b8c-ba9d-9b3c45f731de", "4af7e82d-4043-4490-bb91-df3b51d501c4", "f9479e82-77b2-4ccd-9a4d-303746c51fd4", "742151a4-77c1-4ec8-8b96-4a1796f012e7", "52c7fa80-2fa5-490d-b509-766ed1b34796", "0835bec6-2e39-418c-ae9b-c5e266b5150b"];
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