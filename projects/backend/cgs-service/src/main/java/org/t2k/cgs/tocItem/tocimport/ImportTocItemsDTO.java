package org.t2k.cgs.tocItem.tocimport;

import java.util.List;

/**
 * Object used for toc items import from one or more course course to a destination course
 *
 * @author Alex Burdusel on 2016-12-23.
 */
public class ImportTocItemsDTO {

    /**
     * courseId of the course to which the TOC items are imported
     */
    private String destinationCourseId;
    /**
     * cid of the toc inside the destination course where the toc items should be added
     */
    private String destinationTocCid;

    /**
     * Index of a lesson in the {@code destinationTocCid} that will be replaced by the imported toc items. Can be null
     */
    private Integer index;

    /**
     * Toc items to import
     */
    private List<TocItemsToImportDTO> tocItemsToImport;


    /**
     * courseId of the course to which the TOC items are imported
     */
    public String getDestinationCourseId() {
        return destinationCourseId;
    }

    /**
     * cid of the toc inside the destination course where the toc items should be added
     */
    public String getDestinationTocCid() {
        return destinationTocCid;
    }

    /**
     * Index of a lesson in the {@code destinationTocCid} that will be replaced by the imported toc items. Can be null
     */
    public Integer getIndex() {
        return index;
    }

    /**
     * Toc items to import
     */
    public List<TocItemsToImportDTO> getTocItemsToImport() {
        return tocItemsToImport;
    }

    /**
     * Returns a brief description of this ImportTocItemsDTO. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * ImportTocItemsDTO{"sourceCourseId": "asdqweasda", "destinationCourseId": "wqeqj1312", "diffMap": [...],
     * "destinationTocCid": "qwei123jw", "tocItemCids": [...], "index": null}
     */
    @Override
    public String toString() {
        return "ImportTocItemsDTO{" +
                ", \"destinationCourseId\": \"" + destinationCourseId + '\"' +
                ", \"destinationTocCid\": \"" + destinationTocCid + '\"' +
                ", \"index\": " + index +
                ", \"tocItemsToImport\": " + tocItemsToImport +
                '}';
    }
}
