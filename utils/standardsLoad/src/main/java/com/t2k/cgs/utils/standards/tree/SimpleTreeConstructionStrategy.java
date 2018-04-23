package com.t2k.cgs.utils.standards.tree;

import com.t2k.cgs.utils.standards.errors.TreeParsingException;
import com.t2k.cgs.utils.standards.model.StandardNode;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 12:23 PM
 */
public class SimpleTreeConstructionStrategy implements TreeConstructionStrategy {

    private static Comparator<StandardNode> STANDARDS_COMPARATOR = new StandardsComparator();

    @Override
    public StandardNode constructTree(List<StandardNode> nodes) throws TreeParsingException {

        if(nodes == null) return null;

        StandardNode root = null;
        Map<String, StandardNode> pedagogicalIdToNode = new HashMap<String, StandardNode>();

        //construct map
        for(StandardNode node : nodes){
            pedagogicalIdToNode.put(node.getPedagogicalId(), node);
        }

        //connect all nodes using the map
        for(StandardNode node : nodes){
            if (node.getParentPedagogicalId() != null) {
                try {
                    pedagogicalIdToNode.get(node.getParentPedagogicalId()).getChildren().add(node);
                } catch (Exception e) {
                    String errorMsg = String.format("The pedagogical parent id: \"%s\" of node \"%s\" with pedagogical id: %s, wasn't found",node.getParentPedagogicalId(), node.getName(), node.getPedagogicalId());
                    throw new TreeParsingException(errorMsg, e);
                }
            } else {
                //if no parent it must be root
                root = node;
            }
        }

        //sort every level of children according to the natural order (defined by last number/character)
        traverseAndSortTree(root);

        return root;
    }

    /**
     * Sort all the children in the tree to follow the following rule
     * If the last part of the pedagogical id is a number then sort the children from smallest to biggest
     * If the last part of the pedagogical id is a string then sort the children lexicographically
     *
     * @param node
     */
    private void traverseAndSortTree(StandardNode node) {
        //nothing to do for leaf
        if(node.getChildren().size() == 0) return;

        sortChildren(node);

        for(StandardNode child : node.getChildren()){
            traverseAndSortTree(child);
        }
    }


    /**
     * Sort the children of a node based on the pedagogical ids
     *
     * @param node
     */
    private void sortChildren(StandardNode node) {
        Collections.sort(node.getChildren(),STANDARDS_COMPARATOR);
    }


    /**
     * Comparator to help sort based on the appearance of the standard in the original loaded CSV
     */
    private static class StandardsComparator implements Comparator<StandardNode> {

        @Override
        public int compare(StandardNode o1, StandardNode o2) {
            return o1.getOrderIndex() - o2.getOrderIndex();
        }
    }

}
