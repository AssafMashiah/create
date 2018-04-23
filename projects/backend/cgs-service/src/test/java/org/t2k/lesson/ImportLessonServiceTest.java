package org.t2k.lesson;

import org.springframework.test.context.ContextConfiguration;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 04/06/13
 * Time: 14:23
 */

@ContextConfiguration("/springContext/CmsServiceTest-context.xml")
@Test(groups = "ignore")
public class ImportLessonServiceTest {
    @Test()
    public void testCopy() {

    }
}
