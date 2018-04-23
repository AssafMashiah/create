package org.t2k.ebooks;

/**
 * @author Alex Burdusel on 2016-09-13.
 */
public enum TestEBookJson {
    EBOOK_EXAMPLE_1("eBook_example_1.json"),
    EBOOK_EXAMPLE_2("eBook_example_2.json"),
    EPUB3_ACCESSIBLE("epub3_accessible.json"),
    EPUB3_ACCESSIBLE_MODIFIED_1("epub3_accessible_modified_1.json"),
    EPUB3_ACCESSIBLE_MODIFIED_2("epub3_accessible_modified_2.json");

    private String filePath;
    private String fileName;

    TestEBookJson(String fileName) {
        this.fileName = fileName;
        this.filePath = "books/jsons/" + fileName;
    }

    /**
     * @return relative path to the file from test environment context
     */
    public String getFilePath() {
        return filePath;
    }

    public String getFileName() {
        return fileName;
    }
}
