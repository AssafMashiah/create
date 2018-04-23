package org.t2k.cgs.model.packaging;

import com.t2k.common.utils.PublishModeEnum;
import org.t2k.cgs.model.course.CourseTocItemRef;

import java.util.ArrayList;
import java.util.List;

public class CoursePackageParams {

    private int publisherId;
    private String courseId;
    private String publishMode;
    private String description;
    private String releaseNote;
    private String version;
    private PublishTarget target;
    private List<String> excludeList;
    private List<String> selectedList;
    private Boolean includeAncestorsStandards = false; // false by default
    /**
     * TOC items to be marked as sample on the course before the publish process. When a course has sample toc items,
     * only them will be available for playing in teach.
     */
    private List<CourseTocItemRef> sample;

    public CoursePackageParams(int publisherId, String courseId, PublishTarget publishTarget,
                               PublishModeEnum publishMode, String description, String releaseNotes,
                               List<String> selectedIds, List<String> excludeIds) {
        this.publisherId = publisherId;
        this.courseId = courseId;
        this.target = publishTarget;
        this.description = description;
        this.releaseNote = releaseNotes;
        this.publishMode = publishMode.getName();

        if (publishTarget == PublishTarget.LESSON_TO_FILE
                || publishTarget == PublishTarget.LESSON_TO_CATALOG
                || publishTarget == PublishTarget.COURSE_TO_URL
                || publishTarget == PublishTarget.LESSON_TO_URL) {
            this.selectedList = selectedIds;
            this.excludeList = excludeIds;
        } else {
            this.selectedList = new ArrayList<>();
        }
    }

    public CoursePackageParams() {
    }

    ; // Dummy constructor, needed for JSON mapping from client-request-json in this object

    public int getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getPublishMode() {
        return publishMode;
    }

    public void setPublishMode(String publishMode) {
        this.publishMode = publishMode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReleaseNote() {
        return releaseNote;
    }

    public void setReleaseNote(String releaseNote) {
        this.releaseNote = releaseNote;
    }

    public String getVersion() {
        return version;
    }

    public PublishTarget getTarget() {
        return target;
    }

    public void setTarget(PublishTarget target) {

        this.target = target;
    }

    public List<String> getExcludeList() {
        return excludeList;
    }

    public void setExcludeList(List<String> excludeList) {
        this.excludeList = excludeList;
    }

    public List<String> getSelectedList() {
        return selectedList;
    }

    public void setSelectedList(List<String> selectedList) {
        this.selectedList = selectedList;
    }

    public Boolean getIncludeAncestorsStandards() {
        return includeAncestorsStandards;
    }

    public void setIncludeAncestorsStandards(Boolean includeAncestorsStandards) {
        this.includeAncestorsStandards = includeAncestorsStandards;
    }

    /**
     * TOC items to be marked as sample on the course before the publish process. When a course has sample toc items,
     * only them will be available for playing in teach.
     */
    public List<CourseTocItemRef> getSample() {
        return sample;
    }
}
