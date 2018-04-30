package org.t2k.cgs.domain.model.ebooks;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import javax.validation.Valid;
import java.util.ArrayList;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/10/2015
 * Time: 13:55
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class Page {

    private String id;
    private String eBookId;
    private String title;
    private String href;
    private String thumbnailHref;
    private int originalIndex;
    private String text;

    @Valid
    private ArrayList<JouveEnrichment> jouveEnrichmentList;

    private Page() {
    }

    public Page(String id, String eBookId, String title, String href, int originalIndex, String thumbnailHref) {
        this.id = id;
        this.eBookId = eBookId;
        this.title = title;
        this.href = href;
        this.originalIndex = originalIndex;
        this.thumbnailHref = thumbnailHref;
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

    public void setText(String text) {
        this.text = text;
    }

    public void addToJouveEnrichmentList(JouveEnrichment jouveEnrichment) {
        if (jouveEnrichmentList == null) {
            jouveEnrichmentList = new ArrayList<>();
        }
        this.jouveEnrichmentList.add(jouveEnrichment);
    }

    public ArrayList<JouveEnrichment> getJouveEnrichmentList() {
        return jouveEnrichmentList;
    }

    public void setJouveEnrichmentList(ArrayList<JouveEnrichment> jouveEnrichmentList) {
        this.jouveEnrichmentList = jouveEnrichmentList;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (obj.getClass() != getClass()) {
            return false;
        }
        Page other = (Page) obj;
        return this.id.equals(other.id);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + id.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Page{" +
                "\"id\": \"" + id + '\"' +
                ", \"eBookId\": \"" + eBookId + '\"' +
                ", \"title\": \"" + title + '\"' +
                ", \"href\": \"" + href + '\"' +
                ", \"thumbnailHref\": \"" + thumbnailHref + '\"' +
                ", \"originalIndex\": " + originalIndex +
                ", \"text\": \"" + text + '\"' +
                ", \"jouveEnrichmentList\": " + jouveEnrichmentList +
                "}";
    }
}