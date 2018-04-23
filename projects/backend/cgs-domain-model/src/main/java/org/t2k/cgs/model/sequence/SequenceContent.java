package org.t2k.cgs.model.sequence;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.t2k.cgs.model.course.DifferentiationLevel;

import java.util.Collections;
import java.util.List;

/**
 * Content item of type sequence, containing data for the parent content of a sequence
 *
 * @author Alex Burdusel on 2016-12-13.
 * @see Content
 */
@JsonDeserialize(as = SequenceContent.class)
public class SequenceContent extends Content {

    private final ContentType type = ContentType.sequence;

    private boolean isCourse;
    @JsonProperty(value = "is_modified")
    private boolean isModified;
    @JsonProperty
    private Data data;

    public static SequenceContent newInstance(String sequenceId,
                                              String parentCid,
                                              DifferentiationLevel differentiationLevel,
                                              int lessonDefaultDiffLevelId) {
        SequenceContent sequenceContent = new SequenceContent();
        sequenceContent.id = sequenceId;
        sequenceContent.parent = parentCid;
        sequenceContent.data = new Data(sequenceId, differentiationLevel, lessonDefaultDiffLevelId);
        return sequenceContent;
    }

    @Override
    public ContentType getType() {
        return type;
    }

    public boolean isCourse() {
        return isCourse;
    }

    @JsonIgnore
    public boolean isModified() {
        return isModified;
    }

    public Data getData() {
        return data;
    }

    /**
     * Object containing the data inside a sequence content
     */
    public static class Data {
        private SequenceDiffLevel diffLevel;
        private String title;
        private String type = "simple";
        private String exposure = "one_by_one";
        private boolean sharedBefore;
        private boolean isValid;
        private InvalidMessage invalidMessage;

        public Data(String sequenceId, DifferentiationLevel differentiationLevel, int courseDefaultDiffLevelId) {
            this.diffLevel = new SequenceDiffLevel(differentiationLevel,
                    differentiationLevel.getLevelId() == courseDefaultDiffLevelId);
            this.title = differentiationLevel.getName();
            this.invalidMessage = new InvalidMessage(sequenceId);
        }

        public DifferentiationLevel getDiffLevel() {
            return diffLevel;
        }

        public String getTitle() {
            return title;
        }

        public String getType() {
            return type;
        }

        public String getExposure() {
            return exposure;
        }

        public boolean isSharedBefore() {
            return sharedBefore;
        }

        public boolean isValid() {
            return isValid;
        }

        public InvalidMessage getInvalidMessage() {
            return invalidMessage;
        }
    }

    public static class InvalidMessage {
        private boolean valid;
        private List<Message> report;
        private List<Message> upperComponentMessage;

        InvalidMessage(String editorId) {
            report = Collections.singletonList(new Message(editorId));
            upperComponentMessage = Collections.singletonList(new Message(editorId));
        }

        public boolean isValid() {
            return valid;
        }

        public List<Message> getReport() {
            return report;
        }

        public List<Message> getUpperComponentMessage() {
            return upperComponentMessage;
        }
    }

    public static class Message {
        private String editorId;
        private ContentType editorType = ContentType.sequence;
        private ContentType editorGroup = ContentType.sequence;
        private String msg = "There must be at least one task in the sequence";

        public Message(String editorId) {
            this.editorId = editorId;
        }

        public String getEditorId() {
            return editorId;
        }

        public ContentType getEditorType() {
            return editorType;
        }

        public ContentType getEditorGroup() {
            return editorGroup;
        }

        public String getMsg() {
            return msg;
        }
    }

    public static class SequenceDiffLevel extends DifferentiationLevel {
        /**
         * whether the differentiation level is the default one on the lesson
         */
        boolean isDefault;

        public SequenceDiffLevel() {
        }

        SequenceDiffLevel(DifferentiationLevel differentiationLevel, boolean isDefault) {
            setLevelId(differentiationLevel.getLevelId());
            setName(differentiationLevel.getName());
            setAcronym(differentiationLevel.getAcronym());
            this.isDefault = isDefault;
        }
    }
}
