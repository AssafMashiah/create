package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.apache.commons.beanutils.BeanUtils;
import org.codehaus.jackson.map.annotate.JsonSerialize;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 13/11/13
 * Time: 12:24
 */
@org.codehaus.jackson.map.annotate.JsonSerialize(include= JsonSerialize.Inclusion.NON_NULL)
@com.fasterxml.jackson.annotation.JsonInclude(JsonInclude.Include.NON_NULL)
public class ContentTree {
    private Node root;

    public Node getRoot() {
        return root;
    }

    public void setRoot(Node root) {
        this.root = root;
    }

    @org.codehaus.jackson.map.annotate.JsonSerialize(include= JsonSerialize.Inclusion.NON_NULL)
    @com.fasterxml.jackson.annotation.JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Node{
        private String cid;
        private String title;
        private String type;
        private List<Node> children;
        public Node(Object mapOfProperties) throws InvocationTargetException, IllegalAccessException {
            BeanUtils.populate(this, (Map) mapOfProperties);
        }

        public Node(String cid, String title, String type) {
            this.cid = cid;
            this.title = title;
            this.type = type;
        }

        public String getCid() {
            return cid;
        }

        public void setCid(String cid) {
            this.cid = cid;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public List<Node> getChildren() {
            return children;
        }

        public void setChildren(List<Node> children) {
            this.children = children;
        }
        public void addChild(Node child){
            if (children == null){
                children = new ArrayList<Node>();
            }
            children.add(child);
        }
    }


}
