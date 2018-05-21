package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mongodb.DBObject;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.ContentItemBase;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 16:02
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseTocItemRef {

    private String cid;

    private String type;

    public static CourseTocItemRef of(DBObject dbObject) {
        CourseTocItemRef courseTocItemRef = new CourseTocItemRef();
        courseTocItemRef.cid = (String) dbObject.get(ContentItemBase.CID);
        courseTocItemRef.type = (String) dbObject.get(ContentItemBase.TYPE);
        return courseTocItemRef;
    }

    public static CourseTocItemRef newInstance(String cid, String type) {
        CourseTocItemRef courseTocItemRef = new CourseTocItemRef();
        courseTocItemRef.cid = cid;
        courseTocItemRef.type = type;
        return courseTocItemRef;
    }

    public String getCid() {
        return cid;
    }

    public String getType() {
        return type;
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
        CourseTocItemRef other = (CourseTocItemRef) obj;
        return this.type.equals(other.type) && this.cid.equals(other.cid);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + this.type.hashCode();
        result = 31 * result + this.cid.hashCode();
        return result;
    }

    /**
     * Returns a brief description of this CourseTocItemRef. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * CourseTocItemRef{"cid": "j123ascnasqwej", "type": "lesson"}
     */
    @Override
    public String toString() {
        return "CourseTocItemRef{" +
                "\"cid\": \"" + cid + '\"' +
                ", \"type\": \"" + type + '\"' +
                '}';
    }
}
