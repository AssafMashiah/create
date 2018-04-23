package org.t2k.cgs.model.tocItem;

import org.t2k.cgs.model.course.CourseToc;
import org.t2k.cgs.model.course.CourseTocItemRef;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.ebooks.conversion.EBookToCourseTOC;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Holds the root CourseTocItem and a list of all lessons referenced by it
 *
 * @author Alex Burdusel on 2016-06-17.
 */
public class CourseTocAndLessons {

    private CourseToc courseTocItem;
    private List<Lesson> lessons;

    /**
     * Builds CourseTocAndLessons by using bottom up recursivity (memoization) for both lessons and CourseTocItems
     */
    public static CourseTocAndLessons newInstance(String courseId, int publisherId,
                                                  EBook eBook,
                                                  EBookToCourseTOC eBookToCourseTOC) {
        CourseTocAndLessons courseTocAndLessons = new CourseTocAndLessons();
        // create lessons from current level EBookToCourseTOC
        courseTocAndLessons.lessons = eBookToCourseTOC.getTocItemRefs().stream()
                .map(eBookToCourseTOCItemRef -> Lesson.newInstance(courseId, publisherId, eBook, eBookToCourseTOCItemRef))
                .collect(Collectors.toList());

        // create toc item refs for course from current level lessons
        List<CourseTocItemRef> courseTocItemsRefs = courseTocAndLessons.lessons.stream()
                .map(lesson -> CourseTocItemRef.newInstance(lesson.getContentData().getCid(), lesson.getContentData().getType()))
                .collect(Collectors.toList());

        // recursively build children bottom up (memoization), which are needed for building the current CourseTocItem
        List<EBookToCourseTOC> childrenEBookToCourseTOCs = eBookToCourseTOC.getTocItems();
        // transform children EBookToCourseTOC into CourseTocAndLessons children
        List<CourseTocAndLessons> courseTocAndLessonsChildren = childrenEBookToCourseTOCs.stream()
                .map(bookToCourseTOC -> CourseTocAndLessons.newInstance(courseId, publisherId, eBook, bookToCourseTOC))
                .collect(Collectors.toList());
        // extract the CourseTocItems from the CourseTocAndLessons children in a list
        List<CourseToc> courseTocItems = courseTocAndLessonsChildren.stream()
                .map(CourseTocAndLessons::getCourseTocItem)
                .collect(Collectors.toList());

        // build current level courseTocItem
        courseTocAndLessons.courseTocItem = CourseToc.newInstance(eBookToCourseTOC.getTitle(),
                courseTocItems,
                courseTocItemsRefs);

        // memoization, since we already have the lessons build from children
        if (childrenEBookToCourseTOCs.size() > 0) {
            // fetch and add lessons from children
            courseTocAndLessons.lessons.addAll(courseTocAndLessonsChildren.stream()
                    .flatMap(courseTocAndLessons1 -> courseTocAndLessons1.getLessons().stream()).collect(Collectors.toList()));
        }

        return courseTocAndLessons;
    }

    public CourseToc getCourseTocItem() {
        return courseTocItem;
    }

    public List<Lesson> getLessons() {
        return lessons;
    }
}
