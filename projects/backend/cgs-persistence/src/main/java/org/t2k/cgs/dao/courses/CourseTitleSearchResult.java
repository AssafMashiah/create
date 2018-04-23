package org.t2k.cgs.dao.courses;

import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.tocItem.Format;

import java.util.List;

/**
 * An object containing info about a course obtained after a text search result
 *
 * @author Alex Burdusel on 2017-01-11.
 */
public class CourseTitleSearchResult {




    private String courseId;
    private String title;
    private boolean matched;
    private Toc toc;

    CourseTitleSearchResult (String courseId, String title, Boolean matched, Toc toc) {
        this.courseId = courseId;
        this.title = title;
        this.matched = matched;
        this.toc = toc;
    }

    public String getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public boolean isMatched() {
        return matched;
    }

    public Toc getToc() {
        return toc;
    }

    public static class Toc {
        private String cid;
        private String title;
        private boolean matched;
        private List<Toc> tocItems;
        private List<TocItemRef> tocItemRefs;

        Toc (String cid, String title, Boolean matched, List<Toc> tocItems, List<TocItemRef> tocItemRefs) {
            this.cid = cid;
            this.title = title;
            this.matched = matched;
            this.tocItems = tocItems;
            this.tocItemRefs = tocItemRefs;
        }

        public String getCid() {
            return cid;
        }

        public String getTitle() {
            return title;
        }

        public boolean isMatched() {
            return matched;
        }

        public boolean hasMatchedChildren() {
            for (TocItemRef ref : tocItemRefs) {
                if (ref.isMatched()) {
                    return true;
                }
            }
            for (Toc child : tocItems) {
                if (child.isMatched() || child.hasMatchedChildren()) {
                    return true;
                }
            }
            return false;
        }

        public List<Toc> getTocItems() {
            return tocItems;
        }

        public List<TocItemRef> getTocItemRefs() {
            return tocItemRefs;
        }
    }

    public static class TocItemRef {
        private String cid;
        private String title;
        private EntityType type;
        private Format format;
        private boolean matched;

        TocItemRef (String cid, String title, EntityType type, Format format, Boolean matched) {
            this.cid = cid;
            this.title = title;
            this.type = type;
            this.format = format;
            this.matched = matched;
        }

        public String getCid() {
            return cid;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public EntityType getType() {
            return type;
        }

        public Format getFormat() {
            return format;
        }

        public void setFormat(Format format) {
            this.format = format;
        }

        public boolean isMatched() {
            return matched;
        }
    }
}
