package org.t2k.cgs.model.ebooks.ebookForClientResponse;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.model.ebooks.Page;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by thalie.mukhtar on 8/2/2016.
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class PageForClient {

    private String id;
    private String eBookId;
    private String title;
    private String href;
    private String thumbnailHref;
    private int originalIndex;

    private PageForClient() {
    }// in use by json serializer

    public PageForClient(Page page) {
        this.id = page.getId();
        this.eBookId = page.getEBookId();
        this.title = page.getTitle();
        this.href = page.getHref();
        this.thumbnailHref = page.getThumbnailHref();
        this.originalIndex = page.getOriginalIndex();
    }

    public String getId() {
        return id;
    }

    public String geteBookId() {
        return eBookId;
    }

    public String getTitle() {
        return title;
    }

    public String getHref() {
        return href;
    }

    public String getThumbnailHref() {
        return thumbnailHref;
    }

    public int getOriginalIndex() {
        return originalIndex;
    }
}
