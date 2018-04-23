package org.t2k.cgs.model.ebooks.conversion;

import com.fasterxml.jackson.annotation.JsonIgnore;
import nl.siegmann.epublib.domain.TOCReference;
import org.apache.log4j.Logger;
import org.t2k.cgs.model.ebooks.EBookStructure;
import org.t2k.cgs.model.ebooks.Page;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
public class EBookToCourseLearningObject {

    @JsonIgnore
    private static Logger logger = Logger.getLogger(EBookToCourseLearningObject.class);

    private String title;

    private List<Page> pages = new ArrayList<>();

    /**
     * List of errors encountered during processing
     */
    private List<Error> errors = new ArrayList<>();

    /**
     * Factory method to build an EBookToCourseLearningObject, representing a learning object
     *
     * @param eBookStructure      the structure the converted/to be converted ebook
     * @param currentTocReference current TOC reference
     * @return a new instance of {@link EBookToCourseLearningObject}
     */
    public static EBookToCourseLearningObject newInstance(EBookStructure eBookStructure,
                                                          TOCReference currentTocReference,
                                                          TOCReference nextTocReference) {
        //TODO can be extended to support nested learning objects by recursively creating them
        EBookToCourseLearningObject eBookToCourseLearningObject = new EBookToCourseLearningObject();
        eBookToCourseLearningObject.title = currentTocReference.getTitle();

        // get all pages until next toc reference
        String startPageIntervalId = currentTocReference.getResourceId();
        String endPageIntervalId;
        if (nextTocReference != null) {
            endPageIntervalId = nextTocReference.getResourceId();
            List<Error> errors = checkPagesForErrors(eBookStructure, startPageIntervalId, endPageIntervalId);
            if (errors.size() == 0) {
                eBookToCourseLearningObject.pages.addAll(eBookStructure.getPagesBetween(startPageIntervalId, endPageIntervalId));
                if (startPageIntervalId.equals(endPageIntervalId)) {
                    eBookToCourseLearningObject.pages.add(eBookStructure.getPageById(startPageIntervalId));
                }
            } else {
                eBookToCourseLearningObject.errors.addAll(errors);
            }
        } else {
            List<Page> pageList = eBookStructure.getPages();
            endPageIntervalId = pageList.get(pageList.size() - 1).getId();
            List<Error> errors = checkPagesForErrors(eBookStructure, startPageIntervalId, endPageIntervalId);
            if (errors.size() == 0) {
                eBookToCourseLearningObject.pages.addAll(eBookStructure.getPagesBetweenIncludingLast(startPageIntervalId, endPageIntervalId));
            } else {
                eBookToCourseLearningObject.errors.addAll(errors);
            }
        }
        return eBookToCourseLearningObject;
    }

    public static EBookToCourseLearningObject newInstance(String title, List<Page> pages, List<Error> errors) {
        EBookToCourseLearningObject eBookToCourseLearningObject = new EBookToCourseLearningObject();
        eBookToCourseLearningObject.title = title;
        eBookToCourseLearningObject.pages = pages;
        eBookToCourseLearningObject.errors = errors;
        return eBookToCourseLearningObject;
    }

    /**
     * @param eBookStructure
     * @return a list of errors, if any encountered
     */
    private static List<Error> checkPagesForErrors(EBookStructure eBookStructure, String firstPageId, String lastPageId) {
        List<Error> errors = new ArrayList<>(1);
        Page firstPage = eBookStructure.getPageById(firstPageId);
        Page lastPage = eBookStructure.getPageById(lastPageId);
        int firstPageIndex = eBookStructure.getPageIndex(firstPage);
        int lastPageIndex = eBookStructure.getPageIndex(lastPage);
        if (firstPageIndex > lastPageIndex) {
            String errMsg = String.format("Error retrieving pages list! " +
                            "First page (%s) index [%s] is larger than last page (%s) index [%s]",
                    firstPage.getId(), firstPageIndex, lastPage.getId(), lastPageIndex);
            logger.error(errMsg);
            errors.add(Error.newInstance(EBookToCourseErrorCode.INVALID_PAGES_ORDER, errMsg));
        }
        return errors;
    }

    public String getTitle() {
        return title;
    }

    public List<Page> getPages() {
        return pages;
    }

    public int getPagesCount() {
        return pages.size();
    }

    public List<Error> getErrors() {
        return errors;
    }
}
