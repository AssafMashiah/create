package org.t2k.cgs.tocItem.tocimport;

import java.util.List;
import java.util.Map;

/**
 * Object containing info about the toc items to import from a course
 *
 * @author Alex Burdusel on 2016-12-23.
 */
public class TocItemsToImportDTO {
    /**
     * courseId of the course from which the TOC items are imported
     */
    private String sourceCourseId;
    /**
     * a mapping between the IDs of the differentiations levels on the destination
     * course, held as keys and the IDs of the differentiation levels on the source
     * course, held as values. Null value means that the level on the destination course
     * has no mapping. -1 key means that the destination course has no differentiation
     * levels, and only one of the differentiation levels sequences from the source course
     * will be imported (the one mapped to -1)
     */
    private Map<Integer, Integer> diffMap;
    /**
     * cids of the TOC items to be imported
     */
    private List<String> tocItemCids;


    /**
     * courseId of the course from which the TOC item is imported
     */
    public String getSourceCourseId() {
        return sourceCourseId;
    }

    /**
     * cids of the TOC items to be imported
     */
    public List<String> getTocItemCids() {
        return tocItemCids;
    }

    /**
     * a mapping between the IDs of the differentiations levels on the destination
     * course, held as keys and the IDs of the differentiation levels on the source
     * course, held as values. Null value means that the level on the destination course
     * has no mapping. -1 key means that the destination course has no differentiation
     * levels, and only one of the differentiation levels sequences from the source course
     * will be imported (the one mapped to -1)
     */
    public Map<Integer, Integer> getDiffMap() {
        return diffMap;
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
                "\"sourceCourseId\": \"" + sourceCourseId + '\"' +
                ", \"diffMap\": " + diffMap +
                ", \"tocItemCids\": " + tocItemCids +
                '}';
    }
}
