package org.t2k.cgs.model.ebooks;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.model.ebooks.overlayElement.OverlayElement;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/10/2015
 * Time: 13:55
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class PageInsideLesson {

    private String id;
    private String eBookId;
    private String title;
    private String href;
    private String thumbnailHref;
    private int originalIndex;
    private String text;
    @Valid
    private List<OverlayElement> overlayElements;


    private PageInsideLesson() { } // in use by json serializer

    public PageInsideLesson(String id, String eBookId, String title, String href, int originalIndex, String thumbnailHref) {
        this(id, eBookId, title, href, originalIndex, thumbnailHref,new ArrayList<>() );
    }

    public PageInsideLesson(String id, String eBookId, String title, String href, int originalIndex, String thumbnailHref, List<OverlayElement> overlayElements) {
        this.id = id;
        this.eBookId = eBookId;
        this.title = title;
        this.href = href;
        this.originalIndex = originalIndex;
        this.thumbnailHref = thumbnailHref;
        this.overlayElements = overlayElements;
        this.text = "";
    }

    public String getId() {
        return this.id;
    }

    public String getEBookId() {
        return eBookId;
    }

    public String getTitle() {
        return this.title;
    }

    public String getHref() {
        return this.href;
    }

    public int getOriginalIndex() {
        return originalIndex;
    }

    public String getThumbnailHref() {
        return thumbnailHref;
    }

    public void setThumbnailHref(String thumbnailHref) {
        this.thumbnailHref = thumbnailHref;
    }

    public String getText() {
        return text;
    }
    public List<OverlayElement> getOverlayElements() {
        return overlayElements;
    }

    public void setText(String text) {
        this.text = text;
    }
}