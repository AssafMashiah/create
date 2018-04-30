package org.t2k.cgs.domain.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 21/09/2015
 * Time: 15:02
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY, getterVisibility = JsonAutoDetect.Visibility.NONE, creatorVisibility = JsonAutoDetect.Visibility.NONE)
//@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseItem {

    private String id;
    private String name;
    private List<CourseItem> items;

    public CourseItem(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public List<CourseItem> getItems() {
        return items;
    }

    public void setItems(List<CourseItem> items) {
        this.items = items;
    }
}