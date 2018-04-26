package org.t2k.cgs.security;

import org.springframework.data.annotation.Id;

import java.io.Serializable;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/08/13
 * Time: 16:54
 */
public class RelatesTo implements Serializable {
    @Id
    private int id;
    private String type;

    public RelatesTo(int id, String type) {
        this.id = id;
        this.type = type;
    }

    public RelatesTo() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    /**
     * Returns a brief description of this RelatesTo. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * RelatesTo{"id": 1, "type": "PUBLISHER"}
     */
    @Override
    public String toString() {
        return "RelatesTo{" +
                "\"id\": \"" + id + '\"' +
                ", \"type\": \"" + type + '\"' +
                '}';
    }
}
