package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.CGSData;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.course.Importable;

import javax.persistence.Id;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
public abstract class TocItem implements ContentItemBase, Importable<TocItem> {

    @Id
    /**
     * generated automatically by mongo, not used in the project as id. cid inside CGSData is used as ID
     */
    protected ObjectId _id;

    protected CGSData cgsData;

    /**
     * Creates a new instance of a toc item from the given arguments. The created instance can be a {@link Lesson} or
     * an {@link Assessment}, depending on the provided entityType
     *
     * @param courseId        id of the course to which the toc item belongs
     * @param publisherId     publisher that created the toc item
     * @param entityType      type of the toc item: {@link EntityType#LESSON} or {@link EntityType#ASSESSMENT}
     * @param contentDataJson string representing the JSON object to be deserialized to the specified type of toc item
     * @return a new instance of a toc item
     * @throws IllegalArgumentException if entity type is different from {@link EntityType#LESSON} and {@link EntityType#ASSESSMENT}
     * @throws IOException              if any other I/O problem (unexpected end-of-input, network error) during the
     *                                  json deserialization process
     */
    public static TocItem newInstance(String courseId, int publisherId, EntityType entityType, String contentDataJson) throws IOException {
        if (entityType == EntityType.LESSON) {
            return Lesson.newInstance(courseId, publisherId, new ObjectMapper().readValue(contentDataJson, LessonContentData.class));
        } else if (entityType == EntityType.ASSESSMENT) {
            return Assessment.newInstance(courseId, publisherId, new ObjectMapper().readValue(contentDataJson, AssessmentContentData.class));
        } else {
            throw new IllegalArgumentException(String.format("Toc item entity type '%s' not supported", entityType));
        }
    }

    /**
     * @param tocItemCGSObject a toc item as a {@link TocItemCGSObject} object
     * @return a new instance of a toc item as a {@link TocItem} object
     * @throws IllegalArgumentException if entity type is different from {@link EntityType#LESSON} and {@link EntityType#ASSESSMENT}
     * @throws IOException              if any other I/O problem (unexpected end-of-input, network error) during the
     *                                  json deserialization process
     */
    public static TocItem newInstance(TocItemCGSObject tocItemCGSObject) throws IOException {
        return newInstance(tocItemCGSObject.getCourseId(), tocItemCGSObject.getPublisherId(),
                tocItemCGSObject.getEntityType(), tocItemCGSObject.serializeContentData());
    }

    /**
     * Helper method to retrieve the applets resources used on the lesson
     *
     * @return a list of applets resources used on the lesson
     */
    @JsonIgnore
    public List<AppletResource> getAppletsResources() {
        return getContentData().getResources().stream()
                .map(AppletResource::newInstance)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    @JsonIgnore
    public ObjectId getId() {
        return _id;
    }

    @JsonIgnore
    public void setId(ObjectId _id) {
        this._id = _id;
    }

    public CGSData getCgsData() {
        return cgsData;
    }

    public abstract TocItemContentData getContentData();

    public String getCourseId() {
        return getCgsData().getCourseId();
    }

    @Override
    @JsonIgnore
    public String getContentId() {
        return getContentData().getCid();
    }

    @Override
    public void setContentId(String cid) {
        throw new UnsupportedOperationException();
    }

    @Override
    public EntityType getEntityType() {
        return EntityType.forName(getContentData().getType());
    }

    @Override
    public String getEntityId() {
        return _id.toString();
    }

    @Override
    public String getContentVersionNumber() {
        return "NA";
    }

    @Override
    public String getTitle() {
        return getContentData().getTitle();
    }

    @Override
    public Date getLastModified() {
        return getContentData().getHeader().getLastModified();
    }
}
