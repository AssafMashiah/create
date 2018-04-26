package org.t2k.cgs.tocItem.tocimport;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.tocItem.TocItem;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;

import java.util.List;
import java.util.Map;

public interface ImportTocItemService {

    /**
     * Method for validating that the toc items meet the requirements to be imported on the destination course
     *
     * @param destinationCourse course where the toc items will be imported
     * @param tocItems          toc items to be imported
     * @param catalogApplets    applets that allowed for publisher retrieved from GCR
     * @return a map containing as key the toc item cid and as value the validation response for the given toc items
     * containing errors and warnings, if any were found
     */
    Map<String, TocItemValidationResponse> validateTocItemsForImport(Course destinationCourse,
                                                                     List<TocItem> tocItems,
                                                                     List<GCRAppletArtifact> catalogApplets);

    /**
     * Imports one or more TOC items from one or more courses to a given course.
     * <p>
     * The progress of the process can be tracked on the given jobId
     *
     * @param jobId             ID of the {@code Job} tracking the process
     * @param userId            id of the user initiating the import
     * @param publisherId       id of the publisher owning the courses
     * @param importTocItemsDTO an object containing the data about the toc items to be imported
     * @throws IllegalArgumentException if at least one of the {@code tocItemCids} is not found on the source course
     */
    void importTocItems(String jobId, int userId, int publisherId, ImportTocItemsDTO importTocItemsDTO);

    void copyAssets(int publisherId, String destinationCid, String sourceCid, List<String> pathsList) throws DsException;
}
