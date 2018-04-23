package org.t2k.cgs.ebooks;

import org.t2k.cgs.model.job.JobComponent;

/**
 * Created by Moshe.Avdiel on 11/17/2015.
 */
public enum EbookJobComponent implements JobComponent {
    CALCULATING_EBOOK_FILE_HASH("calculatingEBookFileHash"),
    PROGRESS_BUILD_STRUCTURE("buildEBookStructure"),
    SAVING_EBOOK_DATA_TO_DB("savingEBookDataToDb"),
    SAVING_FILE_TO_DISK("savingFileToDisk"),
    GENERATING_PAGE_THUMBNAILS("generatingPageThumbnails"),
    GENERATING_EBOOK_TOC("generatingEBookTOC"),
    EBOOK_TOC_ANALYSIS("ebookTOCAnalysis"),
    CREATING_COURSE("creatingCourse"),
    UPDATING_COURSES("updatingCourses"),
    EBOOK_STRUCTURE_VALIDATION("eBookStructureValidation");

    private String title;

    EbookJobComponent(String title) {
        this.title = title;
    }

    public String getTitle() {
        return this.title;
    }

    @Override
    public String getValue() {
        return title;
    }

    @Override
    public String toString() {
        return this.getTitle();
    }
}
