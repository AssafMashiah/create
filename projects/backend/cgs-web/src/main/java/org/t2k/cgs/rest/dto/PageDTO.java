package org.t2k.cgs.rest.dto;

import org.springframework.data.domain.Page;
import org.springframework.util.Assert;

import java.util.List;

/**
 * A generic page DTO object
 *
 * @author Alex Burdusel on 2017-01-31.
 */
public class PageDTO<T> {

    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private long totalItems;
    private List<T> items;

    /**
     * @param pageNumber
     * @param pageSize
     * @param totalPages
     * @param totalItems
     * @param items      items to include in the page. Cannot be null
     */
    public PageDTO(int pageNumber,
                   int pageSize,
                   int totalPages,
                   long totalItems,
                   List<T> items) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalPages = totalPages;
        this.totalItems = totalItems;
        Assert.notNull(items);
        this.items = items;
    }

    public PageDTO(Page<T> page) {
        this.pageNumber = page.getNumber();
        this.pageSize = page.getSize();
        this.totalPages = page.getTotalPages();
        this.totalItems = page.getNumberOfElements();
        this.items = page.getContent();
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public List<T> getItems() {
        return items;
    }

    /**
     * @return number of elements currently included in the page
     */
    public int getNumberOfItems() {
        return items.size();
    }
}
