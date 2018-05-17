package org.t2k.cgs.domain.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.t2k.cgs.domain.model.classification.StandardsPackage;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.model.course.CourseCustomizationPack;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContentData implements ResourceHolder {

    @NotNull
    protected String cid;

    @NotNull
    protected String type;

    protected String schema;

    protected Header header;

    protected String title;

    protected String overview;

    protected boolean hideOverviewTitle;

    protected CourseCustomizationPack customizationPack;

    @Valid
    protected Set<TaggedStandards> standards = new HashSet<>();

    @Valid
    protected Set<StandardsPackage> standardPackages = new HashSet<>();

    @Valid
    protected Set<CGSResource> resources;

    protected Set<String> contentLocales = new HashSet<>();

    protected Set<String> supplementaryNarrationLocales;

    protected List<Object> customFields = new ArrayList<>();
//    private List<CourseMetaDataField> customFields = new ArrayList<>(); // FIXME: 7/26/16 CourseMetaDataField needs to be synchronized with the fields inside schema.js


    public String getCid() {
        return cid;
    }

    public Header getHeader() {
        return header;
    }

    public void setHeader(Header header) {
        this.header = header;
    }

    public String getSchema() {
        return schema;
    }

    public String getTitle() {
        return title;
    }

    public String getType() {
        return type;
    }

    public List<String> getContentLocales() {
        return contentLocales == null ? null : new ArrayList<>(contentLocales);
    }

    public List<TaggedStandards> getStandards() {
        return standards == null ? null : new ArrayList<>(standards);
    }

    public void setStandards(Set<TaggedStandards> standards) {
        this.standards = standards;
    }

    public List<StandardsPackage> getStandardPackages() {
        return standardPackages == null ? null : new ArrayList<>(standardPackages);
    }

    public Set<CGSResource> getResources() {
        return resources != null ? resources : new HashSet<>(0);
    }

    @Override
    public Set<CGSResource> getResources(Collection<String> resourceIds) {
        return this.resources.stream()
                .filter(resource -> resourceIds.contains(resource.getResId()))
                .collect(Collectors.toSet());
    }

    public boolean addResource(CGSResource resource) {
        if (resources == null) resources = new HashSet<>();
        return this.resources.add(resource);
    }

    public boolean removeResourceById(String resourceId) {
        return getResources().stream()
                .filter(res -> res.getResId().equals(resourceId))
                .findFirst()
                .map(cgsResource -> getResources().remove(cgsResource))
                .orElse(false);
    }

    public String getOverview() {
        return overview;
    }

    public CourseCustomizationPack getCustomizationPack() {
        return customizationPack;
    }

    public List<String> getSupplementaryNarrationLocales() {
        return supplementaryNarrationLocales == null ? null : new ArrayList<>(supplementaryNarrationLocales);
    }

    public List<Object> getCustomFields() {
        return customFields;
    }

    public boolean isHideOverviewTitle() {
        return hideOverviewTitle;
    }
}
