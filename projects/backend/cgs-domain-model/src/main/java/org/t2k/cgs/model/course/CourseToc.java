package org.t2k.cgs.model.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.mongodb.DBObject;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.classification.TaggedStandards;

import javax.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 15:58
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseToc {

    private String cid;
    private String title;
    private boolean hideTitle;
    private String overview;
    private boolean hideOverview;
    private String imageResourceRef;
    private List<String> keywords = new ArrayList<>();
    private String type;
    @Valid
    private List<CourseTocItemRef> tocItemRefs = new ArrayList<>();
    @Valid
    private List<CourseToc> tocItems = new ArrayList<>();
    @Valid
    private Set<TaggedStandards> standards = new HashSet<>();

    public static CourseToc newInstance(String title) {
        CourseToc toc = new CourseToc();
        toc.cid = UUID.randomUUID().toString();
        toc.title = title;
        toc.overview = "";
        toc.type = EntityType.TOC_ITEM.getName();
        return toc;
    }

    public static CourseToc newInstance(String title,
                                        List<CourseToc> tocItems,
                                        List<CourseTocItemRef> tocItemRefs) {
        CourseToc toc = newInstance(title);
        toc.tocItems = tocItems;
        toc.tocItemRefs = tocItemRefs;
        return toc;
    }

    public static CourseToc of(DBObject dbObject) {
        CourseToc toc = new CourseToc();
        toc.cid = (String) dbObject.get(ContentItemBase.CID);
        toc.title = (String) dbObject.get(ContentItemBase.TITLE);
        toc.overview = (String) dbObject.get("overview");
        toc.hideOverview = dbObject.get("hideOverview") == null ? false : (Boolean) dbObject.get("hideOverview");
        toc.imageResourceRef = (String) dbObject.get("imageResourceRef");
        toc.keywords.addAll((List) dbObject.get("keywords"));
        toc.type = (String) dbObject.get(ContentItemBase.TYPE);
        List<CourseTocItemRef> tocItemRefs = ((List<DBObject>) dbObject.get(ContentItemBase.TOC_ITEM_REFS))
                .stream().map(CourseTocItemRef::of)
                .collect(Collectors.toList());
        toc.tocItemRefs.addAll(tocItemRefs);
        List<CourseToc> tocItems = ((List<DBObject>) dbObject.get(ContentItemBase.TOC_ITEMS))
                .stream().map(CourseToc::of)
                .collect(Collectors.toList());
        toc.tocItems.addAll(tocItems);
        if (dbObject.get("standards") != null) {
            toc.standards = ((List<DBObject>) dbObject.get("standards"))
                    .stream().map(TaggedStandards::of).collect(Collectors.toSet());
        }
        return toc;
    }

    public String getCid() {
        return cid;
    }

    public String getTitle() {
        return title;
    }

    public boolean isHideTitle() {
        return hideTitle;
    }

    public String getOverview() {
        return overview;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public String getType() {
        return type;
    }

    public String getImageResourceRef() {
        return imageResourceRef;
    }

    public boolean isHideOverview() {
        return hideOverview;
    }

    public List<CourseTocItemRef> getTocItemRefs() {
        return tocItemRefs;
    }

    /**
     * Adds the given toc item refs to the toc item
     *
     * @param tocItemRefs refs to add to the toc item
     */
    public void addTocItemRefs(List<CourseTocItemRef> tocItemRefs) {
        this.tocItemRefs.addAll(tocItemRefs);
    }

    /**
     * Adds the given toc item refs to the toc item, by replacing the ref at the given index
     *
     * @param tocItemRefs refs to add to the toc item
     * @param index       index of the toc item ref to replace with the given refs
     */
    public void addTocItemRefs(List<CourseTocItemRef> tocItemRefs, int index) {
        this.tocItemRefs.remove(index);
        this.tocItemRefs.addAll(index, tocItemRefs);
    }

    /**
     * @return a list of {@link CourseTocItemRef} on the TOC Item object, including the ones on the nested TOC Items
     */
    public List<CourseTocItemRef> getAllTocItemRefs() {
        return Stream
                .concat(tocItemRefs.stream(),
                        tocItems.stream().flatMap(courseTocItem -> courseTocItem.getAllTocItemRefs().stream()))
                .collect(Collectors.toList());
    }

    public List<CourseTocItemRef> getAllTocItemRefs(EntityType type) {
        return getAllTocItemRefs()
                .stream().filter(courseTocItemRef -> courseTocItemRef.getType().equals(type.getName()))
                .collect(Collectors.toList());
    }

    public List<CourseToc> getTocItems() {
        return tocItems;
    }

    /**
     * Retrieves a toc item from the tree by its cid
     *
     * @param cid identifier of the toc item
     * @return the toc item, or null, if none found
     */
    @JsonIgnore
    public Optional<CourseToc> getTocByCid(String cid) {
        if (this.cid.equals(cid)) {
            return Optional.of(this);
        }
        for (CourseToc tocItem : tocItems) {
            Optional<CourseToc> tocItemChild = tocItem.getTocByCid(cid);
            if (tocItemChild.isPresent()) return tocItemChild;
        }
        return Optional.empty();
    }

    public Set<TaggedStandards> getStandards() {
        return standards;
    }

    /**
     * Retrieves a list of all toc sub-levels from the toc hierarchy
     *
     * @return a list of all toc sub-levels from the toc hierarchy
     */
    @JsonIgnore
    public List<CourseToc> getFlattenedTocChildren() {
        List<CourseToc> flattenedTocElements = new ArrayList<>(this.tocItems);
        for (CourseToc tocItem : tocItems) {
            flattenedTocElements.addAll(tocItem.getFlattenedTocChildren());
        }
        return flattenedTocElements;
    }
}