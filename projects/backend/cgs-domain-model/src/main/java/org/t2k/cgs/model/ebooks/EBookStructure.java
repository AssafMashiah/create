package org.t2k.cgs.model.ebooks;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/10/2015
 * Time: 13:51
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class EBookStructure {

    private String title;
    private String coverImage;
    @Valid
    private List<Page> pages;

    private EBookStructure() {
    } // in use by json serializer

    public EBookStructure(String title, String coverImage) {
        this.title = title;
        this.coverImage = coverImage;
        this.pages = new ArrayList<>();
    }

    public Page getPageById(String id) {
        for (Page page : pages) {
            if (page.getId().equals(id)) {
                return page;
            }
        }
        return null;
    }

    public int getPageIndex(Page page) {
        return pages.indexOf(page);
    }

    /**
     * Returns the pages between the specified firstPage, inclusive, to lastPage, exclusive.
     * (If firstPage and lastPage are equal or firstPage > lastPage, the returned list is empty.)
     *
     * @param firstPage
     * @param lastPage
     * @return
     */
    public List<Page> getPagesBetween(Page firstPage, Page lastPage) {
        if (firstPage == lastPage || firstPage == null) {
            return new ArrayList<>(0);
        }
        int firstPageIndex = pages.indexOf(firstPage);
        int lastPageIndex = pages.indexOf(lastPage);
        return pages.subList(firstPageIndex, lastPageIndex);
    }

    /**
     * Returns the pages between the specified firstPage, inclusive, to lastPage, inclusive.
     * (If firstPage and toIndex are equal, the returned list is empty.)
     *
     * @param firstPage
     * @param lastPage
     * @return
     */
    public List<Page> getPagesBetweenIncludingLast(Page firstPage, Page lastPage) {
        if (firstPage == lastPage) {
            return new ArrayList<>(0);
        }
        return pages.subList(pages.indexOf(firstPage), pages.indexOf(lastPage) + 1);
    }

    /**
     * Returns the pages between the specified firstPageId, inclusive, to lastPageId, exclusive.
     * (If firstPageId and lastPageId are equal, the returned list is empty.)
     *
     * @param firstPageId
     * @param lastPageId
     * @return
     */
    public List<Page> getPagesBetween(String firstPageId, String lastPageId) {
        if (firstPageId.equals(lastPageId)) {
            return new ArrayList<>(0);
        }
        return getPagesBetween(getPageById(firstPageId), getPageById(lastPageId));
    }

    /**
     * Returns the pages between the specified firstPageId, inclusive, to lastPageId, inclusive.
     * (If firstPageId and lastPageId are equal, the returned list is empty.)
     *
     * @param firstPageId
     * @param lastPageId
     * @return
     */
    public List<Page> getPagesBetweenIncludingLast(String firstPageId, String lastPageId) {
        if (firstPageId.equals(lastPageId)) {
            return new ArrayList<>(0);
        }
        return getPagesBetweenIncludingLast(getPageById(firstPageId), getPageById(lastPageId));
    }

    public List<Page> getPages() {
        return pages;
    }

    public void addPage(Page page) {
        this.pages.add(page);
    }

    public void addPages(List<Page> pages) {
        this.pages.addAll(pages);
    }

    public int getNumberOfPages() {
        return this.pages.size();
    }

    public String getTitle() {
        return this.title;
    }

    public String getCoverImage() {
        return this.coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    /**
     * Returns a brief description of this EBookStructure. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * EBookStructure{"title": "Example Title", "numberOfPages": 20}
     */
    @Override
    public String toString() {
        return "EBookStructure{" +
                "\"title\": \"" + title + '\"' +
                ", \"coverImage\": \"" + coverImage + '\"' +
                ", \"numberOfPages\": " + pages.size() +
                '}';
    }

}