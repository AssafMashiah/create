package org.t2k.cgs.domain.usecases.ebooks;

/**
 * @author Alex Burdusel on 2016-09-13.
 */
public enum TestEBookFile {
    PDF_BEITZA("Beitza.pdf"),
    PDF_PAGE_WITH_MISSING_FONT("Page_With_Missing_Font.pdf"),
    PDF_BLANK_PAGE_AND_FONTS("6_Pages_Blank_Page_And_Fonts.pdf"),
    EPUB_2_EXAMPLE("epub2_example.epub"),
    EPUB_3_MOBY_DICK("epub3_moby_dick.epub"),
    EPUB_3_MOBY_DICK_MODIFIED("epub3_moby_dick-Chapter55_title_modified.epub"),
    EPUB_3_ACCESSIBLE("epub3_accessible.epub"),
    EPUB_3_QUIZ_BINDINGS("epub3_quiz-bindings.epub"),
    EPUB_3_NON_EPUB_EXAMPLE("non-epub-example.epub"),
    EPUB_3_POC_PER_JOUVE_ECRAN("epub3_POC_PER_JOUVE_ECRAN.epub"),
    EPUB_3_CHILDRENS_LITERATURE("epub3_childrens-literature.epub"),
    EPUB_3_RETZ_ECOLE_DES_ALBUMS_TEXTE_SEUL("epub3_RETZ_Ecole-des-albums_texte_seul.epub"),
    EPUB_3_ANA_MATH_3E("ANA_MATH_3E.epub");

    private String filePath;
    private String fileName;

    TestEBookFile(String fileName) {
        this.fileName = fileName;
        this.filePath = "books/" + fileName;
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
