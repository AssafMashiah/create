function printCell(val) {

    print('<td>'+val+'</td>');

};



function getPublisherName(publisherId) {

    var publishers = db.getCollection('publishers').find({'accountId':publisherId});

    if (publishers.count() > 0) {

        var publisher = publishers.next();

        return publisher.name;

    }

    else {

        return null;

    }

}



function getLessonByCourseId(courseId) {

    var lessons = db.getCollection('lessons').find({'cgsData.courseId':courseId});

    if (lessons.count() > 0) {

      var lesson = lessons.next();

      return lesson;

    }

    else {

        return null;

    }    

}



print('<html> <head>');

print('  <meta charset="UTF-8"/> ');

print('  <title>OLD PDF Report</title> ');

print('<style>');

print(' .center {margin: auto; width: 80%; padding: 10px; } ');

print(' .centerGreen { margin: auto; width: 80%; padding: 10px; border:3px solid #73AD21; } ');

print('</style>');

print('</head>');

print('<body bgcolor="#84c0fd">');

print('<div style="padding-top:30px;"> </div>');

print('<h1 style="color:blue;" class="centerGreen"> OLD PDF Report </h1>');

// print('<h4>' + db.getMongo() + '</h4>');

print('<div style="padding-top:30px;"> </div>');

print('<div style="text-align:center;">');



// Get All Sequences with Old PDF.

var sequencesWithPDF = db.getCollection('sequences').find({'content':/html_sequence/}, {_id:true, seqId:true, lessonCId:true, courseId:true, lastModified:true}).limit(100);



var totalSequences = sequencesWithPDF.count();

print('TOTAL SEQUENCES: ' + totalSequences );

print('<table border=1 class="center" style="color:#000; font-weight:bold" >');

print('<tr>');

    printCell('Publisher ID');

    printCell('Publisher Name');

    printCell('Course ID');

    printCell('Course Name');

    printCell('Lesson ID');

    printCell('Lesson Name');

    printCell('Sequence ID');

    printCell('Last Modified');

print('</tr>');



sequencesWithPDF.forEach( function(sequenceWithPDF) {

    

    var sequenceId = sequenceWithPDF.seqId;

    var courseId = sequenceWithPDF.courseId;

    var lastModified = sequenceWithPDF.lastModified;        



    //  Get Courses

    var courses = db.getCollection('courses').find({'contentData.courseId':courseId});

    

    if (courses.count() == 0) {

        print('No Courses found for Course ID: ' + courseId);

    }

    else {       

        courses.forEach(function(course) {

            var courseName = course.contentData.title;

            var publisherId = course.cgsData.publisherId;            

            var publisherName = getPublisherName(publisherId);

            var lesson = getLessonByCourseId(courseId);

            

            print('<tr>');

            printCell(publisherId);

            printCell(publisherName);

            printCell(courseId);

            printCell(courseName);

            printCell(lesson.contentData.cid);

            printCell(lesson.contentData.title);

            printCell(sequenceId);

            printCell(lastModified);

            print('</tr>');

        });

    }            

});



print('</table>');

print('</div>');

