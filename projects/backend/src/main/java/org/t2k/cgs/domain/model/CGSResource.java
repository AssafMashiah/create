package org.t2k.cgs.domain.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mongodb.DBObject;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.sequence.Sequence;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 14:41
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CGSResource {
    @NotNull
    private String resId;

    private String baseDir;
    private String href;
    private List<String> hrefs;
    private String locale;

    private String type;

    public static CGSResource newInstance(String href, String type) {
        return newInstance(UUID.randomUUID().toString(), href, type);
    }

    public static CGSResource newInstance(String resourceId, String href, String type) {
        Assert.notNull(resourceId, "resourceId cannot be null");
        Assert.notNull(href, "href cannot be null");
        Assert.notNull(type, "type cannot be null");

        CGSResource cgsResource = new CGSResource();
        cgsResource.resId = resourceId;
        cgsResource.href = href;
        cgsResource.type = type;
        return cgsResource;
    }

    public static CGSResource newInstance(String baseDir, List<String> hrefs, String type) {
        Assert.notNull(baseDir, "baseDir cannot be null");
        Assert.notNull(hrefs, "hrefs cannot be null");
        Assert.notNull(type, "type cannot be null");

        CGSResource cgsResource = new CGSResource();
        cgsResource.resId = UUID.randomUUID().toString();
        cgsResource.baseDir = baseDir;
        cgsResource.hrefs = new ArrayList<>(hrefs);
        cgsResource.type = type;
        return cgsResource;
    }

    public static CGSResource newInstance(String resourceId, DBObject customizationPackManifest) {
        String customizationPackName = (String) customizationPackManifest.get("name");
        String customizationPackVersion = (String) customizationPackManifest.get("version");
        String customizationPackBaseDir = String.format("customizationPack/%s/%s", customizationPackName, customizationPackVersion);

        CGSResource cgsResource = new CGSResource();
        cgsResource.resId = resourceId;
        cgsResource.type = "lib";
        cgsResource.baseDir = customizationPackBaseDir;
        cgsResource.hrefs = new ArrayList<>();
        cgsResource.hrefs.addAll((List<String>) customizationPackManifest.get("files"));
        if (!cgsResource.isValid()) {
            throw new IllegalArgumentException("Resource does not adhere to any of the resource contracts");
        }

        return cgsResource;
    }

    public static CGSResource of(DBObject dbObject) {
        CGSResource cgsResource = new CGSResource();
        cgsResource.resId = (String) dbObject.get(CourseCGSObject.RES_ID);
        cgsResource.type = (String) dbObject.get(ContentItemBase.TYPE);
        cgsResource.baseDir = (String) dbObject.get("baseDir");
        cgsResource.href = (String) dbObject.get(CourseCGSObject.HREF);
        if (dbObject.get("hrefs") != null) {
            cgsResource.hrefs = new ArrayList<>();
            cgsResource.hrefs.addAll((List<String>) dbObject.get("hrefs"));
        }
        cgsResource.locale = (String) dbObject.get("locale");
        if (!cgsResource.isValid()) {
            throw new IllegalArgumentException("Resource does not adhere to any of the resource contracts");
        }
        return cgsResource;
    }

    /**
     * Creates a new instance of a {@code CGSResource} for a sequence
     *
     * @param sequence sequence for which to create a resource reference
     * @return a new {@link CGSResource} instance
     */
    public static CGSResource newInstance(Sequence sequence) {
        CGSResource resource = new CGSResource();
        resource.resId = UUID.randomUUID().toString();
        resource.href = "sequences/" + sequence.getSeqId();
        resource.type = "sequence";
        return resource;
    }

    /**
     * Validates if the resource is valid
     */
    public boolean isValid() {
        return (baseDir != null && hrefs != null)
                || href != null;
    }

    public String getResId() {
        return resId;
    }

    public String getBaseDir() {
        return baseDir;
    }

    public List<String> getHrefs() {
        return hrefs;
    }

    public String getType() {
        return type;
    }

    public String getHref() {
        return href;
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
        CGSResource other = (CGSResource) obj;
        return this.resId.equals(other.resId);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + this.resId.hashCode();
        return result;
    }

    public String getLocale() {
        return locale;
    }
}
