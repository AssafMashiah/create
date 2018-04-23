package org.t2k.cgs.model.course;

import org.springframework.test.util.ReflectionTestUtils;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.ebooks.conversion.EBookToCourseTOC;
import org.t2k.cgs.model.ebooks.conversion.EBookToCourseTOCItemRef;
import org.t2k.cgs.model.tocItem.CourseTocAndLessons;
import org.t2k.cgs.model.tocItem.Lesson;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-17.
 */
public class CourseTocAndLessonsTest {

    @Test
    public void testCourseTocAndLessonsConstruction() {
        int maxDepth = 5;
        int maxChildrenCount = 5;
        int maxRefsCount = 20;

//        EBookToCourseTOC eBookToCourseTOC = buildRandomMockEBookToCourseTOC(0, maxDepth, true, maxChildrenCount, true, maxRefsCount);
        EBookToCourseTOC eBookToCourseTOC = buildMockEBookToCourseTOC(0, maxDepth, 3, 5);
        EBook eBook = buildMockEBook();
        CourseTocAndLessons courseTocAndLessons = CourseTocAndLessons.newInstance("testCourse", 0, eBook, eBookToCourseTOC);

        // test root number of TOCs
        Assert.assertEquals(eBookToCourseTOC.getTocItems().size(), courseTocAndLessons.getCourseTocItem().getTocItems().size());
        // test root number of lessons
        Assert.assertEquals(eBookToCourseTOC.getTocItemRefs().size(), courseTocAndLessons.getCourseTocItem().getTocItemRefs().size());

        if (eBookToCourseTOC.getTocItems() != null
                && eBookToCourseTOC.getTocItems().size() > 0
                && eBookToCourseTOC.getTocItems().get(0) != null) {
            Assert.assertEquals(eBookToCourseTOC.getTocItems().get(0).getTitle(),
                    courseTocAndLessons.getCourseTocItem().getTocItems().get(0).getTitle());
        }

        int child1 = eBookToCourseTOC.getTocItems().size() > 0 ? eBookToCourseTOC.getTocItems().size() - 1 : eBookToCourseTOC.getTocItems().size();
        if (child1 > 0 && eBookToCourseTOC.getTocItems().get(child1) != null) {
            int lessonIndex = eBookToCourseTOC.getTocItems().get(child1).getTocItemRefs().size() > 0
                    ? eBookToCourseTOC.getTocItems().get(child1).getTocItemRefs().size() - 1
                    : eBookToCourseTOC.getTocItems().get(child1).getTocItemRefs().size();
            if (lessonIndex > 0 && eBookToCourseTOC.getTocItems().get(child1).getTocItemRefs().get(lessonIndex) != null) {
                EBookToCourseTOCItemRef eBookToCourseTOCItemRef = eBookToCourseTOC.getTocItems().get(child1).getTocItemRefs().get(lessonIndex);
                CourseTocItemRef courseTocItemRef = courseTocAndLessons.getCourseTocItem().getTocItems().get(child1).getTocItemRefs().get(lessonIndex);
                Lesson lesson = courseTocAndLessons.getLessons().stream()
                        .filter(lesson1 -> lesson1.getContentData().getCid().equals(courseTocItemRef.getCid()))
                        .collect(Collectors.toList()).get(0);
                Assert.assertEquals(eBookToCourseTOCItemRef.getTitle(), lesson.getContentData().getTitle());
            }
        }
    }

    private EBook buildMockEBook() {
        return new EBook.Builder("eBookId", 0, null)
                .setOriginalFileName("original eBook File name")
                .build();
    }

    /**
     * Creates a random EBookToCourseTOC without pages
     *
     * @param currentDepth    current toc depth
     * @param maxDepthLevel   how deep the toc items should go
     * @param addChildrenTOCs weather to add children or not
     * @param addTocRefs      weather to add references or not
     */
    public EBookToCourseTOC buildRandomMockEBookToCourseTOC(int currentDepth,
                                                            int maxDepthLevel,
                                                            boolean addChildrenTOCs,
                                                            int maxChildrenCount,
                                                            boolean addTocRefs,
                                                            int maxRefsCount) {
        int childrenCount = 0;
        int refsCount = 0;

        EBookToCourseTOC eBookToCourseTOC = new EBookToCourseTOC();

        if (addChildrenTOCs) {
            // add mock children TOCs
            childrenCount = (int) (Math.random() * maxChildrenCount);
            List<EBookToCourseTOC> childrenTOCs = new ArrayList<>(childrenCount);
            int nextDepth = currentDepth + 1;
            if (currentDepth < maxDepthLevel - 1) {
                for (int i = 0; i < childrenCount; i++) {
                    childrenTOCs.add(buildRandomMockEBookToCourseTOC(nextDepth,
                            maxDepthLevel,
                            currentDepth < maxDepthLevel, // add toc children or not
                            maxChildrenCount,
                            ((new Random().nextInt(2)) == 1),
                            maxRefsCount)); // add toc refs or not
                }
            }
            ReflectionTestUtils.setField(eBookToCourseTOC, "tocItems", childrenTOCs);
        } else {
            ReflectionTestUtils.setField(eBookToCourseTOC, "tocItems", new ArrayList<>());
        }

        if (addTocRefs) {
            // add mock TOC refs
            refsCount = (int) (Math.random() * maxRefsCount);
            List<EBookToCourseTOCItemRef> refs = new ArrayList<>(refsCount);
            for (int i = 0; i < refsCount; i++) {
                EBookToCourseTOCItemRef eBookToCourseTOCItemRef = new EBookToCourseTOCItemRef();
                ReflectionTestUtils.setField(eBookToCourseTOCItemRef, "title", "Ref " + i + String.format(" from TOC with %s child(ren) and %s lesson(s) at depth level %s/%s", childrenCount, refsCount, currentDepth, maxDepthLevel - 1));
                ReflectionTestUtils.setField(eBookToCourseTOCItemRef, "learningObjects", new ArrayList<>(0));
                refs.add(eBookToCourseTOCItemRef);
            }
            ReflectionTestUtils.setField(eBookToCourseTOC, "tocItemRefs", refs);
        } else {
            ReflectionTestUtils.setField(eBookToCourseTOC, "tocItemRefs", new ArrayList<>());
        }

        ReflectionTestUtils.setField(eBookToCourseTOC, "title",
                String.format("TOC with %s child(ren) and %s lesson(s) at depth level %s/%s", childrenCount, refsCount, currentDepth, maxDepthLevel - 1));

        return eBookToCourseTOC;
    }

    /**
     * Creates an EBookToCourseTOC without pages using the given arguments
     *
     * @param currentDepth  current toc depth
     * @param maxDepthLevel how deep the toc items should go
     * @param childrenCount children to add if not max depth
     * @param refsCount     refs to add to toc
     */
    public EBookToCourseTOC buildMockEBookToCourseTOC(int currentDepth,
                                                      int maxDepthLevel,
                                                      int childrenCount,
                                                      int refsCount) {
        EBookToCourseTOC eBookToCourseTOC = new EBookToCourseTOC();

        if (currentDepth < maxDepthLevel) {
            // add mock children TOCs
            List<EBookToCourseTOC> childrenTOCs = new ArrayList<>(childrenCount);
            int nextDepth = currentDepth + 1;
            if (currentDepth < maxDepthLevel - 1) {
                for (int i = 0; i < childrenCount; i++) {
                    childrenTOCs.add(buildMockEBookToCourseTOC(nextDepth,
                            maxDepthLevel,
                            childrenCount,
                            refsCount));
                }
            }
            ReflectionTestUtils.setField(eBookToCourseTOC, "tocItems", childrenTOCs);
        } else {
            ReflectionTestUtils.setField(eBookToCourseTOC, "tocItems", new ArrayList<>());
        }

        // add mock TOC refs
        List<EBookToCourseTOCItemRef> refs = new ArrayList<>(refsCount);
        for (int i = 0; i < refsCount; i++) {
            EBookToCourseTOCItemRef eBookToCourseTOCItemRef = new EBookToCourseTOCItemRef();
            ReflectionTestUtils.setField(eBookToCourseTOCItemRef, "title", "Ref " + i + String.format(" from TOC with %s child(ren) and %s lesson(s) at depth level %s/%s", childrenCount, refsCount, currentDepth, maxDepthLevel - 1));
            ReflectionTestUtils.setField(eBookToCourseTOCItemRef, "learningObjects", new ArrayList<>(0));
            refs.add(eBookToCourseTOCItemRef);
        }
        ReflectionTestUtils.setField(eBookToCourseTOC, "tocItemRefs", refs);

        ReflectionTestUtils.setField(eBookToCourseTOC, "title",
                String.format("TOC with %s child(ren) and %s lesson(s) at depth level %s/%s", childrenCount, refsCount, currentDepth, maxDepthLevel - 1));

        return eBookToCourseTOC;
    }
}
