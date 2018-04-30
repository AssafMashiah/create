package org.t2k.cgs.domain.model.classification;

import com.mongodb.DBObject;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 08/07/14
 * Time: 10:38
 */
public class TaggedStandards implements Serializable {

    @NotNull
    private String stdPackageId;

    private List<String> pedagogicalIds;

    public static TaggedStandards of(DBObject dbObject) {
        TaggedStandards taggedStandards = new TaggedStandards();
        taggedStandards.stdPackageId = (String) dbObject.get("stdPackageId");
        taggedStandards.pedagogicalIds = (List<String>) dbObject.get("pedagogicalIds");
        return taggedStandards;
    }

    public String getStdPackageId() {
        return stdPackageId;
    }

    public void setStandardPackageId(String standardPackageId) {
        this.stdPackageId = standardPackageId;
    }

    public List<String> getPedagogicalIds() {
        return pedagogicalIds;
    }

    public void setPedagogicalIds(List<String> pedagogicalIds) {
        this.pedagogicalIds = pedagogicalIds;
    }

    @Override
    public String toString() {
        return "CourseStandardPackageTag{" +
                "standardPackageId='" + stdPackageId + '\'' +
                ", pedagogicalIds=" + pedagogicalIds +
                '}';
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
        TaggedStandards other = (TaggedStandards) obj;
        this.pedagogicalIds.sort(String::compareTo);
        other.pedagogicalIds.sort(String::compareTo);
        return (this.stdPackageId != null && other.stdPackageId != null && this.stdPackageId.equals(other.stdPackageId)
                || this.stdPackageId == null && other.stdPackageId == null)
                && this.pedagogicalIds.equals(other.pedagogicalIds);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + (this.stdPackageId == null ? 0 : this.stdPackageId.hashCode());
        this.pedagogicalIds.sort(String::compareTo);
        result = 31 * result + this.pedagogicalIds.hashCode();
        return result;
    }

}
