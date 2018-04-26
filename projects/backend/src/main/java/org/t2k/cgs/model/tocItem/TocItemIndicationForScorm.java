package org.t2k.cgs.model.tocItem;

/**
 * Created by elad.avidan on 17/11/2014.
 */
public class TocItemIndicationForScorm {

    private String id;
    private String title;
    private boolean isHidden;

    public TocItemIndicationForScorm() { } // used in mongo mapper.

    public TocItemIndicationForScorm(String id, String title, boolean isHidden) {
        this.id = id;
        this.title = title;
        this.isHidden = isHidden;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public boolean isHidden() {
        return isHidden;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;

        TocItemIndicationForScorm that = (TocItemIndicationForScorm) o;
        if (id != null ? !id.equals(that.id) : that.id != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
