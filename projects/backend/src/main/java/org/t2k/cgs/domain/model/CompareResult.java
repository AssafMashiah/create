package org.t2k.cgs.domain.model;

import java.util.List;

/**
 * Object holding the result of a compare between two objects
 *
 * @author Alex Burdusel on 2016-08-31.
 */
public class CompareResult {
    /**
     * a negative integer, zero, or a positive integer if the first compared object is less
     * than, equal to, or greater than the second compared object object.
     */
    private int result;
    /**
     * differences between the compared objects, in case the two objects were not equal
     */
    private List<String> differences;

    /**
     * @param result      a negative integer, zero, or a positive integer if the first compared object is less
     *                    than, equal to, or greater than the second compared object object.
     * @param differences differences between the compared objects, in case the two objects were not equal
     * @return a new {@link CompareResult} object from the given params
     */
    public static CompareResult newInstance(int result, List<String> differences) {
        CompareResult compareResult = new CompareResult();
        compareResult.result = result;
        compareResult.differences = differences;
        return compareResult;
    }

    /**
     * a negative integer, zero, or a positive integer if the first compared object is less
     * than, equal to, or greater than the second compared object object.
     */
    public int getResult() {
        return result;
    }

    /**
     * differences between the compared objects, in case the two objects were not equal
     */
    public List<String> getDifferences() {
        return differences;
    }
}
