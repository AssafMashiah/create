package org.t2k.cgs.domain.model.sequence;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.apache.log4j.Logger;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.domain.model.course.DifferentiationLevel;
import org.t2k.cgs.domain.model.tocItem.Lesson;
import org.t2k.cgs.utils.JsonDateSerializer;

import java.io.IOException;
import java.io.Serializable;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * An object containing the detailed content of a sequence, including the content played by DL
 */
@Document
@JsonAutoDetect
public class Sequence implements Serializable {

    private static final Logger LOGGER = Logger.getLogger(Lesson.class);

    //@TODO: ophir create one object .. use for both
    public final static String DB_OBJECT_ID_KEY = "_id";
    public final static String DB_CONTENT_KEY = "content";
    public final static String DB_SEQ_ID_KEY = "seqId";
    public final static String DB_LESSON_CID = "lessonCId";
    public final static String DB_COURSE_ID = "courseId";
    public final static String DB_SEQ_DELETION_DATE_KEY = "deletionDate";

    @Id
    private String id;
    private String seqId;
    private String lessonCId;
    private String courseId;
    /**
     * The content is held as a string in the DB and passed as it is to front-end and teach. It is a stringified map
     * having the ids of the content objects as keys and the content objects as values
     *
     * @see Content
     */
    private String content;
    private Date lastModified = new Date();
    private Date deletionDate;

    public Sequence() {
    }

    public Sequence(String seqId, String lessonCId, String courseId, String content, Date lastModified) {
        this.seqId = seqId;
        this.lessonCId = lessonCId;
        this.courseId = courseId;
        this.content = content;
        this.lastModified = lastModified;
    }

    public Sequence(String seqId, String lessonCId, String courseId, String content) {
        this.seqId = seqId;
        this.lessonCId = lessonCId;
        this.courseId = courseId;
        this.content = content;
    }

    public Sequence(String seqId, String lessonCId, String courseId, Content content) {
        this.seqId = seqId;
        this.lessonCId = lessonCId;
        this.courseId = courseId;
        Map<String, Content> contentMap = Collections.singletonMap(content.getId(), content);
        this.setContentFrom(contentMap);
    }

    public String getSeqId() {
        return seqId;
    }

    public void setSeqId(String seqId) {
        this.seqId = seqId;
    }

    public String getLessonCId() {
        return lessonCId;
    }

    public void setLessonCId(String lessonCId) {
        this.lessonCId = lessonCId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    /**
     * The content is held as a string in the DB and passed as it is to front-end and teach. It is a stringified map
     * having the ids of the content objects as keys and the content objects as values
     *
     * @see Content
     */
    public String getContent() {
        return content;
    }

    /**
     * The content is held as a string in the DB and passed as it is to front-end and teach. It is a stringified map
     * having the ids of the content objects as keys and the content objects as values
     *
     * @see Content
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Serializes a {@code Content} object to the content string inside the sequence.
     * <p>
     * Content is held as string for backward compatibility with frontend and teach. The content object
     * is too complex to completely define a design and hierarchy for it
     *
     * @param content te content object to be serialized as a content string inside the sequence containing the id as
     *                keys and the content objects as values
     * @see Content
     */
    @JsonIgnore
    public void setContentFrom(Map<String, Content> content) {
        try {
            this.content = new ObjectMapper().writeValueAsString(content);
        } catch (JsonProcessingException e) {
            LOGGER.error(String.format("Error setting content '%s' to sequence '%s'", content, this.seqId), e);
        }
    }

    /**
     * @return the deserialized content string as a {@code Content} object
     * @throws IOException in case an error is encountered during deserialization
     * @see Content
     */
    @JsonIgnore
    public Map<String, Content> getContentAs() throws IOException {
        return new ObjectMapper().readValue(this.content,
                TypeFactory.defaultInstance().constructMapType(HashMap.class, String.class, Content.class));
    }

    /**
     * Sets the title for the sequence
     */
    @JsonIgnore
    public void setTitle(String title) {
        try {
            JSONObject contentJson = new JSONObject(this.content);
            JSONObject seqContentJson = contentJson.getJSONObject(this.seqId);
            JSONObject seqContentDataJson = seqContentJson.getJSONObject("data");
            seqContentDataJson.put("title", title);
            this.content = contentJson.toString();
        } catch (JSONException e) {
            LOGGER.error("Error modifying content data for sequence " + this.seqId, e);
        }
    }

    /**
     * Modifies the content of the sequence by setting the properties representing the given arguments
     *
     * @param title                    title to set on the sequence
     * @param parentId                 cid of the sequence parent
     * @param differentiationLevel     the differentiation level for which the sequence is assigned. Can be null
     * @param courseDefaultDiffLevelId the ID of the default differentiation level on the course. Is ignored if
     *                                 {@code differentiationLevel} is null
     */
    @JsonIgnore
    public void setTitleParentAndDiffLevel(String title, String parentId,
                                           DifferentiationLevel differentiationLevel, int courseDefaultDiffLevelId) {
        try {
            JSONObject contentJson = new JSONObject(this.content);
            JSONObject seqContentJson = contentJson.getJSONObject(this.seqId);
            JSONObject seqContentDataJson = seqContentJson.getJSONObject("data");
            seqContentDataJson.put("title", title);
            seqContentJson.put("parent", parentId);
            if (differentiationLevel != null) {
                SequenceContent.SequenceDiffLevel diffLevel = new SequenceContent.SequenceDiffLevel(differentiationLevel,
                        differentiationLevel.getLevelId() == courseDefaultDiffLevelId);
                seqContentDataJson.put("diffLevel", new JSONObject(new ObjectMapper().writeValueAsString(diffLevel)));
            } else {
                seqContentDataJson.put("diffLevel", null);
            }
            this.content = contentJson.toString();
        } catch (JSONException e) {
            LOGGER.error("Error modifying content data for sequence " + this.seqId, e);
        } catch (JsonProcessingException e) {
            LOGGER.error("Error adding differentiation level to content data for sequence " + this.seqId, e);
        }
    }

    /**
     * Modifies the content of the sequence by setting the parent property to the given one
     *
     * @param parentId cid of the sequence parent
     */
    @JsonIgnore
    public void setParent(String parentId) {
        try {
            JSONObject contentJson = new JSONObject(this.content);
            JSONObject seqContentJson = contentJson.getJSONObject(this.seqId);
            seqContentJson.put("parent", parentId);
            this.content = contentJson.toString();
        } catch (JSONException e) {
            LOGGER.error("Error modifying content data for sequence " + this.seqId, e);
        }

    }

    @JsonSerialize(using = JsonDateSerializer.class)
    public Date getLastModified() {
        return lastModified;
    }

    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public Date getDeletionDate() {
        return this.deletionDate;
    }

    public void setDeletionDate(Date deletionDate) {
        this.deletionDate = deletionDate;
    }

    @Override
    public String toString() {
        return String.format("Sequence {seqId: %s, lessonCId: %s, courseId: %s}", seqId, lessonCId, courseId);
    }

    /**
     * Creates a copy of the {@code Sequence} object, but with new lessonCid
     *
     * @param lessonCid the new lessonCid to set on the {@code Sequence}
     * @return a new {@code Sequence} object copied  from the original one, but with changed lessonCid
     */
    public Sequence copy(String lessonCid, String courseId) {
        return new Sequence(this.seqId,
                lessonCid,
                courseId,
                this.content.replaceAll(this.lessonCId, lessonCid));
    }
}
