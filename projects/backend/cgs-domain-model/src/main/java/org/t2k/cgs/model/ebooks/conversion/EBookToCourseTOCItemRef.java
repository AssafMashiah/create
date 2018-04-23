package org.t2k.cgs.model.ebooks.conversion;

import nl.siegmann.epublib.domain.TOCReference;
import org.t2k.cgs.model.ebooks.EBookStructure;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
public class EBookToCourseTOCItemRef {

    private String title;

    private List<EBookToCourseLearningObject> learningObjects = new ArrayList<>();

    /**
     * List of errors from all its learning objects, encountered during processing
     */
    private List<Error> errors = new ArrayList<>();

    /**
     * Factory method to build an EBookToCourseTOCItemRef, representing a lesson
     *
     * @param eBookStructure         the structure the converted/to be converted ebook
     * @param currentTocReference    current TOC reference
     * @param nextParentTocReference next TOC reference, as received from parent TOC item
     * @param structure              parameters to structure the course to be created from an EBook
     * @param createLoOnlyFromParent in case the currentTocReference has children and hasLearningObject is true, create
     *                               the LO only from the parent, not from the children as well
     * @return a new instance of {@link EBookToCourseTOCItemRef}
     */
    public static EBookToCourseTOCItemRef newInstance(EBookStructure eBookStructure,
                                                      TOCReference currentTocReference,
                                                      TOCReference nextParentTocReference,
                                                      EBookToCourseTocStructure structure,
                                                      boolean createLoOnlyFromParent) {
        EBookToCourseTOCItemRef eBookToCourseTOCItemRef = new EBookToCourseTOCItemRef();
        eBookToCourseTOCItemRef.title = currentTocReference.getTitle();

        List<TOCReference> childrenTocReferences = currentTocReference.getChildren();
        if (!createLoOnlyFromParent && !structure.hasLearningObjects()
                || childrenTocReferences.size() == 0) {
            // if it should not have learning objects, we still create one, as UI will filter it out and display the pages inside it in the lesson
            // the next reference will be that given from parent (e.g.: next toc item)
            eBookToCourseTOCItemRef.learningObjects.add(EBookToCourseLearningObject
                    .newInstance(eBookStructure, currentTocReference, nextParentTocReference));
        } else if (createLoOnlyFromParent && childrenTocReferences.size() > 0) {
            // the next reference will be that of the first child
            eBookToCourseTOCItemRef.learningObjects.add(EBookToCourseLearningObject
                    .newInstance(eBookStructure, currentTocReference, childrenTocReferences.get(0)));
        } else {
            eBookToCourseTOCItemRef.learningObjects.add(EBookToCourseLearningObject
                    .newInstance(eBookStructure, currentTocReference, childrenTocReferences.get(0)));
            for (int i = 0; i < childrenTocReferences.size(); i++) {
                TOCReference childTocReference = childrenTocReferences.get(i);
                TOCReference nextTocReference = (i < childrenTocReferences.size() - 1) ? childrenTocReferences.get(i + 1) : nextParentTocReference;
                eBookToCourseTOCItemRef.learningObjects.add(EBookToCourseLearningObject
                        .newInstance(eBookStructure, childTocReference, nextTocReference));
            }
        }
        // add errors from learning objects
        eBookToCourseTOCItemRef.errors.addAll(eBookToCourseTOCItemRef.getLearningObjects()
                .stream().flatMap(lo -> lo.getErrors().stream())
                .collect(Collectors.toList()));
        return eBookToCourseTOCItemRef;
    }

    public static EBookToCourseTOCItemRef newInstance(String title, List<EBookToCourseLearningObject> learningObjects, List<Error> errors) {
        EBookToCourseTOCItemRef eBookToCourseTOCItemRef = new EBookToCourseTOCItemRef();
        eBookToCourseTOCItemRef.title = title;
        eBookToCourseTOCItemRef.learningObjects.addAll(learningObjects);
        eBookToCourseTOCItemRef.errors = errors;
        return eBookToCourseTOCItemRef;
    }

    public int getPagesCount() {
        return learningObjects.stream()
                .mapToInt(learningObject -> learningObject.getPages().size()).sum();
    }

    public String getTitle() {
        return title;
    }

    public List<EBookToCourseLearningObject> getLearningObjects() {
        return learningObjects;
    }

    public List<Error> getErrors() {
        return errors;
    }
}
