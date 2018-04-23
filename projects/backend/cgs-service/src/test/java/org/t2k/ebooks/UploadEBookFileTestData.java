package org.t2k.ebooks;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 25/10/2015
 * Time: 19:47
 */
public class UploadEBookFileTestData {

    private final Boolean hasCoverImage;
    private String testName;
    private String eBookFileName;
    private String eBookRelativePath;

    public UploadEBookFileTestData(String testName, String eBookFileName, String eBookRelativePath, Boolean hasCoverImage) {
        this.testName = testName;
        this.eBookFileName = eBookFileName;
        this.eBookRelativePath = eBookRelativePath;
        this.hasCoverImage = hasCoverImage;
    }

    public UploadEBookFileTestData(String testName, TestEBookFile testEBookFile, Boolean hasCoverImage) {
        this.testName = testName;
        this.eBookFileName = testEBookFile.getFileName();
        this.eBookRelativePath = testEBookFile.getFilePath().replaceAll("/" + testEBookFile.getFileName(), "");
        this.hasCoverImage = hasCoverImage;
    }

    public String getEBookFileName() {
        return eBookFileName;
    }

    public String getEBookRelativePath() {
        return eBookRelativePath;
    }

    @Override
    public String toString() {
        return String.format("%s -> %s", testName, eBookFileName);
    }

    public Boolean isHasCoverImage() {
        return hasCoverImage;
    }
}
