package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.apache.log4j.Logger;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.domain.usecases.ebooks.conversion.EBookToCourseTOCItemRef;
import org.t2k.cgs.domain.model.CGSData;
import org.t2k.cgs.domain.model.ebooks.EBookHolder;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.ebooks.EBook;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
@Document(collection = "lessons")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Lesson extends TocItem implements EBookHolder {

    private static final Logger LOGGER = Logger.getLogger(Lesson.class);

    private LessonContentData contentData;

    public static Lesson newInstance(String courseId, int publisherId,
                                     EBook eBook,
                                     EBookToCourseTOCItemRef eBookToCourseTOCItemRef) {
        Lesson lesson = new Lesson();
        lesson.cgsData = CGSData.newInstance(publisherId, courseId);
        String cid = UUID.randomUUID().toString();
        lesson.contentData = new LessonContentData.Builder(cid, eBook, eBookToCourseTOCItemRef)
                .setFormat(Format.EBOOK)
                .setPedagogicalLessonType(PedagogicalLessonType.CUSTOM.getValue())
                .build();
        return lesson;
    }

    public static Lesson newInstance(String courseId, int publisherId, LessonContentData lessonContentData) {
        Lesson lesson = new Lesson();
        lesson.cgsData = CGSData.newInstance(publisherId, courseId);
        lesson.contentData = lessonContentData;
        return lesson;
    }

    /**
     * {@inheritDoc}
     *
     * @see LessonContentData#transformForImport(Course, Course)
     */
    @Override
    public Lesson transformForImport(Course sourceCourse, Course destinationCourse) {
        Lesson transformed = new Lesson();
        transformed.cgsData = CGSData.newInstance(destinationCourse.getCgsData().getPublisherId(), destinationCourse.getCourseId());
        transformed.contentData = this.contentData.transformForImport(sourceCourse, destinationCourse);
        return transformed;
    }

    @Override
    public LessonContentData getContentData() {
        return contentData;
    }

    @Override
    public String toString() {
        return "Lesson{" +
                "\"_id\": \"" + _id + '\"' +
                ", \"cgsData\": " + cgsData +
                ", \"contentData\": " + contentData +
                '}';
    }

    @Override
    public boolean containsEBook(EBook eBook) {
        return contentData.containsEBook(eBook);
    }

    @Override
    public Set<String> getEBooksIds() {
        return contentData.getEBooksIds() == null ? Collections.emptySet() : new HashSet<>(contentData.getEBooksIds());
    }

    @Override
    public boolean updateEBook(EBook newEBook, EBook oldEBook) {
        LOGGER.debug(String.format("Updating eBook %s with %s on lesson %s", oldEBook, newEBook, this.getContentData().getCid()));
        return contentData.updateEBook(newEBook, oldEBook);
    }
}
