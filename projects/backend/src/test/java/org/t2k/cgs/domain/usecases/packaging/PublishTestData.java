package org.t2k.cgs.domain.usecases.packaging;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 2/23/15
 * Time: 1:41 PM
 * To change this template use File | Settings | File Templates.
 */
public class PublishTestData {
    private String testName;
    private String coursePath;

    public PublishTestData(String testName, String coursePath) {
        this.testName = testName;
        this.coursePath = coursePath;
    }

    public String getCoursePath() {
        return coursePath;
    }

    @Override
    public String toString() {
        return String.format("%s -> %s", testName, coursePath);
    }
}