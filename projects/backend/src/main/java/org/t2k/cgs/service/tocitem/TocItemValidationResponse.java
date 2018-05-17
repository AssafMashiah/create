package org.t2k.cgs.service.tocitem;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.tocItem.Format;
import org.t2k.cgs.domain.model.tocItem.Lesson;
import org.t2k.cgs.domain.model.tocItem.LessonContentData;
import org.t2k.cgs.domain.model.tocItem.TocItem;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Alex Burdusel on 2017-01-06.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TocItemValidationResponse {
    private String cid;
    private String title;
    private EntityType type;
    private Format format;
    /**
     * property used only for lessons
     */
    private Boolean isHidden;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    TocItemValidationResponse(TocItem tocItem) {
        this.cid = tocItem.getContentId();
        this.title = tocItem.getTitle();
        this.type = tocItem.getEntityType();
        this.format = tocItem.getContentData().getFormat();
        if (tocItem instanceof Lesson) {
            this.isHidden = ((LessonContentData) tocItem.getContentData()).isHidden();
        }
    }

    public String getCid() {
        return cid;
    }

    public void addError(String error) {
        this.errors.add(error);
    }

    void addErrors(List<String> errors) {
        this.errors.addAll(errors);
    }

    public List<String> getErrors() {
        return errors;
    }

    void addWarning(String warning) {
        this.warnings.add(warning);
    }

    void addWarnings(List<String> warnings) {
        this.warnings.addAll(warnings);
    }

    public List<String> getWarnings() {
        return warnings;
    }

    /**
     * Adds errors and warnings from the given validation response
     *
     * @param validationResponse validation response from which to add errors and warnings
     * @throws IllegalArgumentException if the cid or the type of the given validationResponse don't match with the
     *                                  current object's properties
     */
    void addFrom(TocItemValidationResponse validationResponse) {
        if (!this.cid.equals(validationResponse.cid)) {
            throw new IllegalArgumentException("The cid of the given validationResponse don't match with the current object's cid");
        }

        this.errors.addAll(validationResponse.errors);
        this.warnings.addAll(validationResponse.warnings);
    }

    public String getTitle() {
        return title;
    }

    public EntityType getType() {
        return type;
    }

    public Format getFormat() {
        return format;
    }

    public Boolean isHidden() {
        return isHidden;
    }
}
