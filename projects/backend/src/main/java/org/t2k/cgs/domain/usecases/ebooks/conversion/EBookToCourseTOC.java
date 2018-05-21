package org.t2k.cgs.domain.usecases.ebooks.conversion;

import com.google.common.collect.Lists;
import nl.siegmann.epublib.domain.TOCReference;
import nl.siegmann.epublib.domain.TableOfContents;
import org.t2k.cgs.domain.model.ebooks.EBookStructure;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
public class EBookToCourseTOC {

    private String title;

    private List<EBookToCourseTOC> tocItems = new ArrayList<>();

    private List<EBookToCourseTOCItemRef> tocItemRefs = new ArrayList<>();

    /**
     * List of errors from all its refs and nested TOCs, encountered during processing
     */
    private List<Error> errors = new ArrayList<>();

    /**
     * Factory method to build the structure of a course from the original epub table of contents by applying the
     * Editis business requirements
     *
     * @param eBookStructure the structure the converted/to be converted ebook
     * @param originalTOC    the table of contents, as extracted from the epub
     * @param structure      parameters to structure the course to be created from an EBook
     * @return course toc structure to build a new course from
     */
    public static EBookToCourseTOC newInstance(EBookStructure eBookStructure,
                                               TableOfContents originalTOC,
                                               EBookToCourseTocStructure structure) {
        EBookToCourseTOC eBookToCourseTOC = new EBookToCourseTOC();
        int maxDepth = originalTOC.calculateDepth();
        List<TOCReference> tocReferences = originalTOC.getTocReferences();

        if (maxDepth >= structure.getMinDepthThresholdForTocCreation()) { // more than or equal to 3 children levels => we create toc
            LinkedList<TOCReference> nextElementStack = new LinkedList<>();
            for (int i = 0; i < tocReferences.size(); i++) {
                TOCReference tocReference = tocReferences.get(i);
                if (i < tocReferences.size() - 1) {
                    nextElementStack.push(tocReferences.get(i + 1));
                }
                eBookToCourseTOC.tocItems.add(newInstance(eBookStructure, tocReference, nextElementStack, 0, structure));
            }
        } else { // we create lessons (refs)
            for (int i = 0; i < tocReferences.size(); i++) {
                TOCReference tocReference = tocReferences.get(i);
                TOCReference nextReference = (i < tocReferences.size() - 1) ? tocReferences.get(i + 1) : null;
                eBookToCourseTOC.tocItemRefs.add(EBookToCourseTOCItemRef.newInstance(eBookStructure, tocReference, nextReference, structure, true));
                // add errors from refs
                eBookToCourseTOC.errors.addAll(eBookToCourseTOC.getTocItemRefs()
                        .stream().flatMap(ref -> ref.getErrors().stream())
                        .collect(Collectors.toList()));
            }
        }
        // add errors from nested toc
        eBookToCourseTOC.errors.addAll(eBookToCourseTOC.getTocItems().stream()
                .flatMap(toc -> toc.getErrors().stream())
                .collect(Collectors.toList()));
        return eBookToCourseTOC;
    }

    /**
     * Factory method to build a new instance of {@link EBookToCourseTOC} from the given params
     *
     * @param eBookStructure   the structure the converted/to be converted ebook
     * @param tocReference     current {@link TOCReference} to build a {@link EBookToCourseTOC} from it
     * @param nextElementStack a stack of {@link EBookToCourseTOC}, used to link to the next {@link EBookToCourseTOC},
     *                         when building the list of {@link EBookToCourseTOC}
     * @param currentDepth     current depth within the TOC
     * @param structure        parameters to structure the course to be created from an EBook
     * @return a new instance of {@link EBookToCourseTOC}
     */
    private static EBookToCourseTOC newInstance(EBookStructure eBookStructure,
                                                TOCReference tocReference,
                                                LinkedList<TOCReference> nextElementStack,
                                                int currentDepth,
                                                EBookToCourseTocStructure structure) {
        EBookToCourseTOC eBookToCourseTOC = new EBookToCourseTOC();
        eBookToCourseTOC.title = tocReference.getTitle();

        List<TOCReference> children = tocReference.getChildren();
        if (children.size() > 0 && currentDepth < structure.getNestedTocDepth()) {
            // TODO can be used for nested TOC items - currently not needed and duplicating the refs
            for (int i = 0; i < children.size(); i++) {
                TOCReference childReference = children.get(i);
                TOCReference nextChildReference = (i < (children.size() - 1)) ? children.get(i + 1) : null;
                if (nextChildReference != null) {
                    nextElementStack.push(nextChildReference);
                }
                eBookToCourseTOC.tocItems.add(newInstance(eBookStructure, childReference, nextElementStack,
                        currentDepth + 1, structure));
            }
        }

        // consume next element in the stack
        TOCReference nextReference = !nextElementStack.isEmpty() ? nextElementStack.pop() : null;
        eBookToCourseTOC.tocItemRefs.add(EBookToCourseTOCItemRef.newInstance(eBookStructure, tocReference,
                nextReference,
                structure, true));
        if (children.size() > 0) {
            for (int i = 0; i < children.size(); i++) {
                TOCReference childTOCReference = children.get(i);
                TOCReference nextChildReference = ((i == children.size() - 1)) ? nextReference : children.get(i + 1);
                eBookToCourseTOC.tocItemRefs.addAll(
                        buildEBookToCourseTOCItemRefsByCollapsing(eBookStructure, childTOCReference, nextChildReference,
                                currentDepth + 1, structure));
            }
        }
        // add errors from refs
        eBookToCourseTOC.errors.addAll(eBookToCourseTOC.getTocItemRefs()
                .stream().flatMap(ref -> ref.getErrors().stream())
                .collect(Collectors.toList()));
        return eBookToCourseTOC;
    }

    /**
     * Recursive factory method to build a list of {@link EBookToCourseTOCItemRef} (lessons) from TOC references and
     * collapse their children, where needed, in order to build lessons from them as well, depending on the
     * tocRefCreationThreshold value inside the {@link EBookToCourseTocStructure}.
     * The tocRefCreationThreshold is the threshold at which we stop creating lessons from children and use them
     * as learning objects.
     *
     * @param eBookStructure the structure the converted/to be converted ebook
     * @param tocReference   current TOC reference
     * @param nextReference  next TOC reference
     * @param currentDepth   current depth within the TOC
     * @param structure      parameters to structure the course to be created from an EBook
     * @return a list of EBookToCourseTOCItemRef representing lessons built from TOC references and their children, where needed.
     */
    private static List<EBookToCourseTOCItemRef> buildEBookToCourseTOCItemRefsByCollapsing(EBookStructure eBookStructure,
                                                                                           TOCReference tocReference,
                                                                                           TOCReference nextReference,
                                                                                           int currentDepth,
                                                                                           EBookToCourseTocStructure structure) {
        List<EBookToCourseTOCItemRef> refs = new ArrayList<>();
        // build refs for its children recursively and add them (collapse) to the refs list
        if (currentDepth < structure.getTocRefCreationThreshold()) {
            List<TOCReference> children = tocReference.getChildren();
            TOCReference nextReferenceForCurrent = (children.size() > 0) ? children.get(0) : nextReference;
            // build current ref
            refs.add(EBookToCourseTOCItemRef.newInstance(eBookStructure, tocReference, nextReferenceForCurrent, structure, true));
            for (int i = 0; i < children.size(); i++) {
                TOCReference childTOCReference = children.get(i);
                nextReference = ((i == children.size() - 1) || currentDepth + 1 == structure.getTocRefCreationThreshold())
                        ? nextReference
                        : children.get(i + 1);
                refs.addAll(buildEBookToCourseTOCItemRefsByCollapsing(eBookStructure, childTOCReference, nextReference,
                        currentDepth + 1, structure));
            }
        } else {
            // build current ref
            refs.add(EBookToCourseTOCItemRef.newInstance(eBookStructure, tocReference, nextReference, structure, false));
        }
        return refs;
    }

    /**
     * Factory method to build the structure of a course from the original epub table of contents by applying the
     * Editis business requirements
     *
     * @param eBookStructure the structure the converted/to be converted ebook
     * @param originalTOC    the table of contents, as extracted from the epub
     * @param structure      parameters to structure the course to be created from an EBook
     * @param maxPagesPerRef maximum number of pages to include per ref (lesson)
     * @return course toc structure to build a new course from
     */
    public static EBookToCourseTOC newInstance(EBookStructure eBookStructure,
                                               TableOfContents originalTOC,
                                               EBookToCourseTocStructure structure,
                                               int maxPagesPerRef) {
        EBookToCourseTOC eBookToCourseTOC = newInstance(eBookStructure, originalTOC, structure);
        return newInstance(eBookToCourseTOC, maxPagesPerRef);
    }

    /**
     * Factory method that builds a new instance of {@link EBookToCourseTOC} from an existing one, by adapting
     * the structure of the TOC to handle corner cases, where a maximum number of pages is required
     * per reference (lesson)
     *
     * @param maxPagesPerRef maximum number of pages to include per ref (lesson)
     * @return a new instance of {@link EBookToCourseTOC}
     */
    public static EBookToCourseTOC newInstance(EBookToCourseTOC eBookToCourseTOC, int maxPagesPerRef) {
        EBookToCourseTOC newEBookToCourseTOC = new EBookToCourseTOC();
        newEBookToCourseTOC.title = eBookToCourseTOC.getTitle();
        newEBookToCourseTOC.errors = eBookToCourseTOC.getErrors();

        newEBookToCourseTOC.tocItemRefs = eBookToCourseTOC.getTocItemRefs().stream()
                .flatMap(ref -> newEBookToCourseTOCItemRefs(ref, maxPagesPerRef).stream())
                .collect(Collectors.toList());

        newEBookToCourseTOC.tocItems = eBookToCourseTOC.getTocItems().stream()
                .map(toc -> EBookToCourseTOC.newInstance(toc, maxPagesPerRef))
                .collect(Collectors.toList());

        return newEBookToCourseTOC;
    }

    /**
     * Factory method to build a list of {@link EBookToCourseTOCItemRef} by splitting an existing one, based on a maximum
     * number of pages to include in it
     *
     * @param eBookToCourseTOCItemRef the {@link EBookToCourseTOCItemRef} (lesson) to split
     * @param maxPages                maximum number of pages to include per ref (lesson)
     * @return
     */
    private static List<EBookToCourseTOCItemRef> newEBookToCourseTOCItemRefs(EBookToCourseTOCItemRef eBookToCourseTOCItemRef, int maxPages) {
        int totalPagesCount = eBookToCourseTOCItemRef.getPagesCount();
        if (totalPagesCount <= maxPages) {
            return Collections.singletonList(eBookToCourseTOCItemRef);
        }
        int splitLessonsCount = maxPages / totalPagesCount + 1;
        List<EBookToCourseTOCItemRef> splitRefsList = new ArrayList<>(splitLessonsCount);

        List<EBookToCourseLearningObject> learningObjectsToBeIncluded = new ArrayList<>();
        int pagesToBeIncludedLOPagesCount = 0; // should always be < maxPages

        int lessonIndex = 1;

        for (EBookToCourseLearningObject learningObject : eBookToCourseTOCItemRef.getLearningObjects()) {
            int currentLOPagesCount = learningObject.getPagesCount();
            String loTitle = learningObject.getTitle();
            List<Error> loErrors = learningObject.getErrors();
            // we  have remainder pages from the previous loop
            if (pagesToBeIncludedLOPagesCount > 0
                    && pagesToBeIncludedLOPagesCount + currentLOPagesCount >= maxPages) {
                int pagesNeededFromLOToFill = maxPages - pagesToBeIncludedLOPagesCount;
                EBookToCourseLearningObject newLearningObject = EBookToCourseLearningObject.newInstance(
                        loTitle,
                        learningObject.getPages().subList(0, pagesNeededFromLOToFill),
                        loErrors);
                learningObjectsToBeIncluded.add(newLearningObject);
                // we create refs from the batch containing < maxPages
                splitRefsList.add(EBookToCourseTOCItemRef.newInstance(eBookToCourseTOCItemRef.getTitle() + lessonIndex,
                        learningObjectsToBeIncluded, eBookToCourseTOCItemRef.getErrors()));
                lessonIndex++;
                pagesToBeIncludedLOPagesCount = 0;
                learningObjectsToBeIncluded.clear();

                // update current learning object to exclude the extracted pages
                if (pagesNeededFromLOToFill < currentLOPagesCount) {
                    learningObject = EBookToCourseLearningObject.newInstance(
                            loTitle,
                            learningObject.getPages().subList(pagesNeededFromLOToFill, learningObject.getPagesCount()),
                            loErrors);
                    currentLOPagesCount = learningObject.getPagesCount();
                } else {
                    continue;
                }
            }

            if (currentLOPagesCount >= maxPages) {
                // current learning object has more pages than max and we split it into multiple learning objects and build refs that include them
                learningObjectsToBeIncluded.addAll(Lists.partition(learningObject.getPages(), maxPages)
                        .stream().map(pages -> EBookToCourseLearningObject.newInstance(loTitle, pages, loErrors))
                        .collect(Collectors.toList()));
                // each learning objects contains maxPages, except the last one, which may contain fewer
                for (int i = 0; i < learningObjectsToBeIncluded.size(); i++) {
                    EBookToCourseLearningObject lo = learningObjectsToBeIncluded.get(i);
                    if (lo.getPagesCount() == maxPages) { // only the last one can have less; none can have more
                        splitRefsList.add(EBookToCourseTOCItemRef.newInstance(eBookToCourseTOCItemRef.getTitle() + lessonIndex,
                                Collections.singletonList(learningObjectsToBeIncluded.get(0)),
                                eBookToCourseTOCItemRef.getErrors()));
                        lessonIndex++;
                        learningObjectsToBeIncluded.remove(lo);
                        i--;
                    }
                }
            } else {
                learningObjectsToBeIncluded.add(learningObject);
                pagesToBeIncludedLOPagesCount += learningObject.getPagesCount();
            }
        }
        // we build a ref from the remaining (they should not exceed max, since we previously treated this)
        if (learningObjectsToBeIncluded.size() > 0) {
            splitRefsList.add(EBookToCourseTOCItemRef.newInstance(eBookToCourseTOCItemRef.getTitle() + lessonIndex,
                    learningObjectsToBeIncluded,
                    eBookToCourseTOCItemRef.getErrors()));
        }
        return splitRefsList;
    }

    public List<EBookToCourseTOC> getTocItems() {
        return tocItems;
    }

    public void setTocItems(List<EBookToCourseTOC> tocItems) {
        this.tocItems = tocItems;
    }

    public List<EBookToCourseTOCItemRef> getTocItemRefs() {
        return tocItemRefs;
    }

    public void setTocItemRefs(List<EBookToCourseTOCItemRef> tocItemRefs) {
        this.tocItemRefs = tocItemRefs;
    }

    public String getTitle() {
        return title;
    }

    /**
     * @return a count of all the refs found within the TOC and nested TOC items
     */
    public int getRefsCount() {
        return tocItemRefs.size() + tocItems.stream().mapToInt(EBookToCourseTOC::getRefsCount).sum();
    }

    /**
     * @return a count of all the pages found within the TOC refs and nested TOC items refs
     */
    public int getPagesCount() {
        int pagesFromRefsInCurrentTOC = tocItemRefs.stream()
                .flatMap(ref -> ref.getLearningObjects().stream())
                .mapToInt(learningObject -> learningObject.getPages().size()).sum();
        int pagesFromRefsInNestedTOCs = tocItems.stream().mapToInt(EBookToCourseTOC::getPagesCount).sum();
        return pagesFromRefsInCurrentTOC + pagesFromRefsInNestedTOCs;
    }

    /**
     * List of errors from all its refs and nested TOCs, encountered during processing
     */
    public List<Error> getErrors() {
        return errors;
    }
}
