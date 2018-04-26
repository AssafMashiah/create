package org.t2k.utils;

import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.t2k.cgs.utils.GeneralUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.IOException;
import java.util.List;

/**
 * @author Alex Burdusel on 2017-01-25.
 */
public class GeneralUtilsTest {

    @Test
    public void getClassStructure() throws IOException {
        String aClassStructureJSON = "{\"type\":\"org.t2k.utils.GeneralUtilsTest$A\", \"annotations\":[{\"name\":\"javax.persistence.Entity\", \"params\":[{\"name\":\"name\", \"value\":\"\"}]}], \"fields\":{\"field1\" :{\"type\":\"int\", \"annotations\":[{\"name\":\"javax.persistence.Id\", \"params\":[]}]}, \"field2\" :{\"type\":\"java.lang.String\", \"annotations\":[]}, \"field3\" :{\"type\":\"org.t2k.utils.GeneralUtilsTest$B\", \"annotations\":[{\"name\":\"org.springframework.data.elasticsearch.annotations.Field\", \"params\":[{\"name\":\"format\", \"value\":\"none\"}, {\"name\":\"includeInParent\", \"value\":\"false\"}, {\"name\":\"index\", \"value\":\"analyzed\"}, {\"name\":\"indexAnalyzer\", \"value\":\"\"}, {\"name\":\"pattern\", \"value\":\"\"}, {\"name\":\"searchAnalyzer\", \"value\":\"\"}, {\"name\":\"store\", \"value\":\"false\"}, {\"name\":\"type\", \"value\":\"Nested\"}]}], \"fields\":{\"type\":\"org.t2k.utils.GeneralUtilsTest$B\", \"annotations\":[], \"fields\":{\"field1\" :{\"type\":\"int\", \"annotations\":[{\"name\":\"javax.persistence.Id\", \"params\":[]}]}, \"field2\" :{\"type\":\"java.lang.String\", \"annotations\":[]}}}}, \"circularReference\" :{\"type\":\"org.t2k.utils.GeneralUtilsTest$A\", \"annotations\":[]}, \"list\" :{\"type\":\"java.util.List<org.t2k.utils.GeneralUtilsTest$B>\", \"annotations\":[], \"genericType\":{\"org.t2k.utils.GeneralUtilsTest$B\":{\"type\":\"org.t2k.utils.GeneralUtilsTest$B\", \"annotations\":[], \"fields\":{\"field1\" :{\"type\":\"int\", \"annotations\":[{\"name\":\"javax.persistence.Id\", \"params\":[]}]}, \"field2\" :{\"type\":\"java.lang.String\", \"annotations\":[]}}}}}}}";
        String aClassStructure = GeneralUtils.getClassStructure(A.class);
        Assert.assertEquals(aClassStructure, aClassStructureJSON);
    }

    @Entity
    private static class A {
        @Id
        private int field1;

        private String field2;
        @Field(type = FieldType.Nested)
        private B field3;
        private A circularReference;
        private List<B> list;
    }

    private static class B {
        @Id
        private int field1;
        private String field2;
    }
}
