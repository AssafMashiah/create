package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mongodb.DBObject;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 14:40
 */
public class CourseCustomizationPack {
    private String name;

    private String version;

    private String language;

    private String date;

    private String author;

    private String structureVersion;

    @Valid
    private Set<CourseCustomIconsPack> customIconsPacks = new HashSet<>();

    @NotNull
    @Pattern(regexp = "resource_[0-9]+")
    private String resourceId;

    public static CourseCustomizationPack newInstance(String resourceId, DBObject customizationPackManifest) {
        CourseCustomizationPack customizationPack = of(customizationPackManifest);
        customizationPack.resourceId = resourceId;
        return customizationPack;
    }

    public static CourseCustomizationPack of(DBObject dbObject) {
        CourseCustomizationPack customizationPack = new CourseCustomizationPack();
        customizationPack.version = (String) dbObject.get("version");
        customizationPack.name = (String) dbObject.get("name");
        customizationPack.language = (String) dbObject.get("language");
        customizationPack.date = (String) dbObject.get("date");
        customizationPack.author = (String) dbObject.get("author");
        customizationPack.structureVersion = (String) dbObject.get("structureVersion");
        customizationPack.resourceId = (String) dbObject.get("resourceId");
        Object customIconsPackDbObject = dbObject.get("customIconsPacks");
        if (customIconsPackDbObject != null) {
            customizationPack.customIconsPacks = (Set<CourseCustomIconsPack>) customIconsPackDbObject; // FIXME: 7/12/16
        }
        return customizationPack;
    }

    public String getName() {
        return name;
    }

    public String getVersion() {
        return version;
    }

    public String getLanguage() {
        return language;
    }

    public String getAuthor() {
        return author;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getDate() {
        return date;
    }

    public String getStructureVersion() {
        return structureVersion;
    }

    public Set<CourseCustomIconsPack> getCustomIconsPacks() {
        return customIconsPacks;
    }

    @JsonIgnore
    public CourseCustomIconsPack getCustomIconsPackByType(PublisherCustomIconsPack.Type type) {
        for (CourseCustomIconsPack iconsPack : this.customIconsPacks) {
            if (iconsPack.getType() == type) {
                return iconsPack;
            }
        }
        return null;
    }

    /**
     * Adds a {@link PublisherCustomIconsPack}. This will override existing {@link PublisherCustomIconsPack}s of the same type the course
     * already has
     */
    public void addCustomIconsPack(CourseCustomIconsPack customIconsPack) {
        for (Iterator<CourseCustomIconsPack> iterator = this.customIconsPacks.iterator(); iterator.hasNext(); ) {
            CourseCustomIconsPack iconsPack = iterator.next();
            if (iconsPack.equals(customIconsPack)) {
                iterator.remove();
            }
        }
        this.customIconsPacks.add(customIconsPack);
    }
}
