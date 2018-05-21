package org.t2k.cgs.domain.usecases.tocItem;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.tocItem.ContentTree;
import org.t2k.cgs.domain.usecases.tocitem.ContentTreeService;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 13/11/13
 * Time: 14:04
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
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
