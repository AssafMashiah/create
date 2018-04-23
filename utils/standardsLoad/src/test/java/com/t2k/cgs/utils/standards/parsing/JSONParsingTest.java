package com.t2k.cgs.utils.standards.parsing;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.utils.standards.model.PackageDetails;
import com.t2k.cgs.utils.standards.model.StandardNode;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 11:15 AM
 */
@Test
public class JSONParsingTest {


    private JSONConverter converter;

    @BeforeMethod
    private void initTests() {
        converter = new SimpleJSONConverter();
    }

    @Test
    public void testSimpleSanity(){

        StandardNode node = new StandardNode();
        node.setPedagogicalId("A");
        node.setParentPedagogicalId("C");

        StandardNode child1 = new StandardNode();
        child1.setPedagogicalId("2P");
        child1.setGradeLevel("2GL");
        child1.setParentPedagogicalId("2PD");
        child1.setTaggable(true);
        child1.setDescription("2DSC");

        StandardNode child2 = new StandardNode();
        child2.setPedagogicalId("3P");
        child2.setGradeLevel("3GL");
        child2.setParentPedagogicalId("3PD");
        child2.setTaggable(false);
        child2.setDescription("3DSC");

        node.getChildren().add(child1);
        node.getChildren().add(child2);


        PackageDetails packageDetails = new PackageDetails();
        packageDetails.setName("P");
        packageDetails.setSubjectArea("SA");
        packageDetails.setCountry("C");
        packageDetails.setState("ST");
        packageDetails.setVersion("1.7");
        packageDetails.setCreated("12/12/12");
        packageDetails.setRootId("C");
        packageDetails.setLatest(false);

        //Make sure this doesn't throw an exception
        DBObject obj = (DBObject)JSON.parse(converter.convertToJson(node,packageDetails));
    }


}
