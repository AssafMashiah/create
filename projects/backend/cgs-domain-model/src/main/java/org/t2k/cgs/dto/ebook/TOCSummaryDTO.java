package org.t2k.cgs.dto.ebook;

/**
 * @author Alex Burdusel on 2016-06-23.
 */
public class TOCSummaryDTO {
    private int tocItemsCount;
    private int lessonsCount;
    private int pagesCount;

    public static TOCSummaryDTO newInstance(int tocItemsCount,
                                            int lessonsCount,
                                            int pagesCount) {
        TOCSummaryDTO tocSummaryDTO = new TOCSummaryDTO();
        tocSummaryDTO.tocItemsCount = tocItemsCount;
        tocSummaryDTO.lessonsCount = lessonsCount;
        tocSummaryDTO.pagesCount = pagesCount;
        return tocSummaryDTO;
    }

    public int getTocItemsCount() {
        return tocItemsCount;
    }

    public int getLessonsCount() {
        return lessonsCount;
    }

    public int getPagesCount() {
        return pagesCount;
    }
}
