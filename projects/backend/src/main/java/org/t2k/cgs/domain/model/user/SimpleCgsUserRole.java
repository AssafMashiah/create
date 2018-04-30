package org.t2k.cgs.domain.model.user;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.domain.model.user.RelatesTo;

import javax.persistence.Id;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "roles")
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class SimpleCgsUserRole implements Serializable {

    @Id
    private ObjectId id;

    private String name;
    private RelatesTo relatesTo;
    private Map<String, Boolean> permissions;

    public SimpleCgsUserRole() {
        permissions = new HashMap<String, Boolean>();
    }

    public Map<String, Boolean> getPermissions() {
        return permissions;
    }

    public String getId() {
        return id.toString();
    }

    public ObjectId getObjectId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRelatesTo(RelatesTo relatesTo) {
        this.relatesTo = relatesTo;
    }

    public String getName() {
        return this.name;
    }

    public RelatesTo getRelatesTo() {
        return this.relatesTo;
    }

    @Override
    public String toString() {
        return "SimpleCgsUserRole{" +
                "\"id\": \"" + id +
                ", \"name\": " + name + '\"' +
                ", \"relatesTo\": " + relatesTo +
                ", \"permissions\": '" + permissions +
                '}';
    }
}