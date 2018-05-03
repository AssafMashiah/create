package org.t2k.cgs.service.validation;

import com.mongodb.DBObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;
import org.t2k.cgs.domain.usecases.SequenceService;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 23/09/14
 * Time: 17:16
 * To change this template use File | Settings | File Templates.
 */
//@ContextConfiguration("/springContext/PackagingServiceTest-context.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class ContentItemValidationTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TestUtils testUtils;

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private ContentItemValidation contentItemValidation;

    @Autowired
    private ContentValidator contentValidator;

    @Autowired
    private SequenceService sequenceService;

    @Autowired
    private CourseDataService courseDataService;

    private String lessonWithSeqItemJsonFileName = "jsons/lessonWithSequence.json";
    private List<Sequence> testSequences = new ArrayList<>();

    @AfterMethod
    private void removeTestSequences() throws DsException {
        for (Sequence s : testSequences) {
            sequenceService.deleteSequence(s.getSeqId(), s.getLessonCId(), s.getCourseId());
        }
    }

    private List<Sequence> createSequenceObjectsAndSaveToDb(List<String> sequenceIdsToCreate, String courseId, String tocItemId) throws DsException {
        List<Sequence> result = new ArrayList<>();

        for (String id : sequenceIdsToCreate) {
            result.add(new Sequence(id, tocItemId, courseId, "mockContent"));
        }
        sequenceService.saveSequences(result);
        return result;
    }

    @Test
    public void validateAllSequencesExistsOnDBSuccess() throws IOException, DsException, DaoException {
        DBObject lessonDBObject = testUtils.readResourcesAsDBObject(lessonWithSeqItemJsonFileName);
        TocItemCGSObject lesson = new TocItemCGSObject(lessonDBObject);
        List<String> sequences = tocItemDataService.getSequencesListFromContentItem(lesson);

        // Creating the sequences on DB, so the validation will work
        createSequencesInDB(sequences, lesson.getCGSData().get("courseId").toString(), lesson.getContentId());
        List<PublishError> errors = new ArrayList<>();
        Boolean success = contentItemValidation.doAllSequencesExistOnDB(lesson, errors);
        Assert.assertTrue(success);
        Assert.assertTrue(errors.isEmpty());
    }

    @Test
    public void validateAllSequencesExistsOnDBFailure() throws IOException, DsException {
        DBObject lessonDBObject = testUtils.readResourcesAsDBObject(lessonWithSeqItemJsonFileName);
        TocItemCGSObject lesson = new TocItemCGSObject(lessonDBObject);

        // note - we did not create the sequences on DB, so the validation will fail
        List<PublishError> errors = new ArrayList<>();
        Boolean success = contentItemValidation.doAllSequencesExistOnDB(lesson, errors);
        Assert.assertFalse(success);
        Assert.assertFalse(errors.isEmpty());
    }

    private void createSequencesInDB(List<String> sequences, String courseId, String tocItemId) throws DsException {
        testSequences = createSequenceObjectsAndSaveToDb(sequences, courseId, tocItemId);
    }

//  ########################
//  ##    Manual Tests    ##
//  ########################

    @Test(groups = "ignore")
    public void specificTocItemValidation() throws DsException {
        try {
            TocItemCGSObject tocItem = tocItemDataService.get(6, "fafae7f3-2a48-4b12-b12a-1381fda68955", "9dbf20e3-abb9-454c-826a-60ff851fd66c", null, false);
            contentValidator.validate(tocItem);
        } catch (ValidationException e) {
            throw e;
        }
    }

    @Test(groups = "ignore")
    public void specificCourseValidation() throws DsException {
            CGSValidationReport cgsValidationReport = courseDataService.validateCourseAndSubElements(6, "9dbf20e3-abb9-454c-826a-60ff851fd66c");
            Assert.assertFalse(cgsValidationReport.isSuccess());
    }
}