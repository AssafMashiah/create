package org.t2k.preview;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.packaging.ContentParseUtil;
import org.t2k.cgs.domain.usecases.ScpConversionService;
import org.t2k.cgs.service.preview.ScpConversionServiceImpl;
import org.t2k.cgs.service.preview.ScpConverter;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.mock;

/**
 * Created by thalie.mukhtar on 17/11/2015.
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class LessonToSCPConversionUtilTest extends AbstractTestNGSpringContextTests {

    private static final String BASIC_COURSE_DATA_JSON = "preview/course/courseData.json";
    private static final String COURSE_WITH_EMPTY_LESSON_JSON = "preview/course/courseWithEmptyLesson.json";
    private static final String BASIC_LESSON_DATA_JSON = "preview/lesson/lessonData.json";
    private static final String COURSE_WITH_TOC_JSON = "preview/course/courseWithToc.json";
    private static final String LESSON_IN_A_COURSE_WITH_TOC_JSON = "preview/lesson/lessonInACourseWithToc.json";
    private static final String EBOOK_LESSON_JSON = "preview/lesson/ebookLessonWithoutHotspots.json";
    private static final String EBOOK_COURSE_JSON = "preview/course/ebookCourseWithoutHotspots.json";
    private static final String EMPTY_LESSON_IN_A_COURSE_WITH_TOC_JSON = "preview/lesson/emptyLesson.json";
    private static final String ITEMS_DATA = "itemsData";
    private static final String ITEMS = "items";
    private static final String DATA = "data";

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private ScpConverter converter;

    private ScpConversionService scpConversionService;

    private CourseDataService courseDataServiceMock;

    @Autowired
    private ApplicationContext appContext;

    @BeforeMethod
    public void initCourseDaoMock() {
        courseDataServiceMock = mock(CourseDataService.class);
        this.scpConversionService = new ScpConversionServiceImpl(courseDataServiceMock, appContext);
    }

    @Test
    public void convertEmptyLessonTest() throws Exception {
        String course = testUtils.readResourcesAsString(COURSE_WITH_EMPTY_LESSON_JSON);
        String lesson = testUtils.readResourcesAsString(EMPTY_LESSON_IN_A_COURSE_WITH_TOC_JSON);

        testScpConversion(course, lesson);
    }

    @Test
    public void convertEBookLessonTest() throws Exception {
        String course = testUtils.readResourcesAsString(EBOOK_COURSE_JSON);
        String lesson = testUtils.readResourcesAsString(EBOOK_LESSON_JSON);

        testScpConversion(course, lesson);
    }

    @Test
    public void convertLessonInACourseWithOneLessonTest() throws Exception {
        String course = testUtils.readResourcesAsString(BASIC_COURSE_DATA_JSON);
        String lesson = testUtils.readResourcesAsString(BASIC_LESSON_DATA_JSON);

        testScpConversion(course, lesson);
    }

    @Test
    public void convertLessonInACourseWithTocLevelsTest() throws Exception {
        String course = testUtils.readResourcesAsString(COURSE_WITH_TOC_JSON);
        String lesson = testUtils.readResourcesAsString(LESSON_IN_A_COURSE_WITH_TOC_JSON);

        testScpConversion(course, lesson);
    }

    private void testScpConversion(String courseString, String lessonString) throws Exception {
        DBObject course = (DBObject) JSON.parse(courseString);
        DBObject lesson = (DBObject) JSON.parse(lessonString);
        String courseId = (String) ((DBObject) course.get(ContentItemBase.CGS_CONTENT)).get(ContentItemBase.CID);
        int publisherId = (int) ((DBObject) course.get(ContentItemBase.CGS_DATA)).get(TocItemCGSObject.PUBLISHER_ID);

        //return fake database information about the course
        Mockito.when(this.courseDataServiceMock.getCourse(publisherId, courseId, null, false)).thenReturn(new CourseCGSObject(course));

        Map<String, Object> convertedData = scpConversionService.convertLessonToScpFormat(publisherId, courseId, lessonString);

        DBObject manifest = (DBObject) convertedData.get(ScpConverter.MANIFEST);
        HashMap lesson_sequences_map = (HashMap) convertedData.get(ScpConverter.LESSON_SEQUENCES_MAP);
        HashMap lessons = (HashMap) convertedData.get(ScpConverter.LESSONS);
        HashMap cnt_sequences = (HashMap) convertedData.get(ScpConverter.CNT_SEQUENCES);

        //validate that conversion returned all the expected elements
        Assert.assertNotNull(manifest);
        Assert.assertNotNull(lesson_sequences_map);
        Assert.assertNotNull(lessons);
        Assert.assertNotNull(cnt_sequences);

        //validate that only one lesson was returned
        Assert.assertEquals(((HashMap) convertedData.get(ScpConverter.LESSONS)).size(), 1);

        String lessonId = (String) lesson.get(ContentItemBase.CID);
        //validate that the lesson was injected with "customizationPack" property under the data
        Assert.assertNotNull(((DBObject) ((DBObject) lessons.get(lessonId)).get(DATA)).get(ContentParseUtil.CUSTOMIZATIONPACK));
        HashMap courseItems = (HashMap) manifest.get(ITEMS_DATA);

        //validate that the course after conversion contains only the wanted lesson
        Assert.assertEquals(courseItems.size(), 1);
        Assert.assertNotNull(courseItems.get(lessonId));

        //validate that the number of sequences in the sequence map is equal to the number of sequences in cnt_sequences(we have all the sequences of only one lesson)
        if ((HashMap) lesson_sequences_map.get(lessonId) != null) {

            Assert.assertEquals(((HashMap) lesson_sequences_map.get(lessonId)).size(), cnt_sequences.size());
        } else {
            //in case of no sequences in lesson map- the number of total sequences need to be 1
            Assert.assertEquals(cnt_sequences.size(), 0);
        }
    }
}