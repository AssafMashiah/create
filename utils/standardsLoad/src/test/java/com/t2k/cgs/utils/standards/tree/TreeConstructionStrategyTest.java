package com.t2k.cgs.utils.standards.tree;


import com.t2k.cgs.utils.standards.model.StandardNode;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Arrays;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNull;


/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 12:32 PM
 */
@Test
public class TreeConstructionStrategyTest {

    private TreeConstructionStrategy treeConstructionStrategy;

    @BeforeMethod
    private void initTests() {
        treeConstructionStrategy = new SimpleTreeConstructionStrategy();

    }

    @Test
    public void testNull() throws Exception {
        assertNull(treeConstructionStrategy.constructTree(null));
    }

    @Test
    public void testSingleNode() throws Exception {

        StandardNode node = new StandardNode();
        node.setPedagogicalId("AAA");

        assertEquals(treeConstructionStrategy.constructTree(Arrays.asList(node)),node);

    }

    @Test
    public void testSimpleTree() throws Exception {
        StandardNode nodeA = new StandardNode();
        nodeA.setPedagogicalId("A");

        StandardNode nodeB = new StandardNode();
        nodeB.setPedagogicalId("B");
        nodeB.setParentPedagogicalId("A");

        StandardNode nodeC = new StandardNode();
        nodeC.setPedagogicalId("C");
        nodeC.setParentPedagogicalId("A");

        StandardNode root = treeConstructionStrategy.constructTree(Arrays.asList(nodeA,nodeB,nodeC));

        assertEquals(root,nodeA);
        assertEquals(root.getChildren().size(),2);

        StandardNode child1 = root.getChildren().get(0);
        StandardNode child2 = root.getChildren().get(1);

        assertEquals(child1,nodeB);
        assertEquals(child2,nodeC);

    }

    @Test
    public void testChildrenSort() throws Exception {
        StandardNode nodeA = new StandardNode();
        nodeA.setPedagogicalId("A");
        nodeA.setOrderIndex(1);

        StandardNode nodeB = new StandardNode();
        nodeB.setPedagogicalId("A.2");
        nodeB.setParentPedagogicalId("A");
        nodeB.setOrderIndex(3);

        StandardNode nodeC = new StandardNode();
        nodeC.setPedagogicalId("A.1");
        nodeC.setParentPedagogicalId("A");
        nodeC.setOrderIndex(2);

        StandardNode root = treeConstructionStrategy.constructTree(Arrays.asList(nodeA, nodeB, nodeC));

        assertEquals(root, nodeA);
        assertEquals(root.getChildren().size(), 2);

        StandardNode child1 = root.getChildren().get(0);
        StandardNode child2 = root.getChildren().get(1);

        assertEquals(child1, nodeC);
        assertEquals(child2, nodeB);

    }

}
