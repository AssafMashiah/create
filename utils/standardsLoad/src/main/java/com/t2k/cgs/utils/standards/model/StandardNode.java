package com.t2k.cgs.utils.standards.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/19/12
 * Time: 9:23 AM
 */
public class StandardNode {

    private String pedagogicalId;
    private String name;
    private String gradeLevel;
    private String parentPedagogicalId;
    private boolean taggable;
    private String description;
    private int orderIndex;
    private List<StandardNode> children;

    public StandardNode(){
        this.children = new ArrayList<StandardNode>();
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPedagogicalId() {
        return pedagogicalId;
    }

    public void setPedagogicalId(String pedagogicalId) {
        this.pedagogicalId = pedagogicalId;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getParentPedagogicalId() {
        return parentPedagogicalId;
    }

    public void setParentPedagogicalId(String parentPedagogicalId) {
        this.parentPedagogicalId = parentPedagogicalId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



    public List<StandardNode> getChildren() {
        return children;
    }

    public void setChildren(List<StandardNode> children) {
        this.children = children;
    }

    public boolean isTaggable() {
        return taggable;
    }

    public void setTaggable(boolean taggable) {
        this.taggable = taggable;
    }
}
