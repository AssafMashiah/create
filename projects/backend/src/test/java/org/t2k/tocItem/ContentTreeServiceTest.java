package org.t2k.tocItem;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.tocItem.ContentTree;
import org.t2k.cgs.tocItem.ContentTreeService;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 13/11/13
 * Time: 14:04
 */
@ContextConfiguration("/springContext/applicationContext-service.xml")
@Test(groups = "ignore")
public class ContentTreeServiceTest extends AbstractTestNGSpringContextTests {
    @Autowired
    private ContentTreeService contentTreeService;

    private ObjectMapper objectMapper = new ObjectMapper();

    public void testGetSequenceTreeOfHiddenLessons() throws DsException, JsonProcessingException {
        String courseId = "c6fad558-cb86-4cf6-969f-dd221b24f5fd";
        int publisherId = 2;

        ContentTree contentTree = contentTreeService.getSequenceTreeOfHiddenLessons(publisherId, courseId);
        String actual = objectMapper.writeValueAsString(contentTree);
        actual.getBytes() ;
    }

}
