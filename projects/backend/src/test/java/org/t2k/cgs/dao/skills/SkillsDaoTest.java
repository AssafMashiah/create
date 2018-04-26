package org.t2k.cgs.dao.skills;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

import static org.testng.Assert.assertNotNull;

/**
 * Created by elad.avidan on 22/07/2014.
 */
@ContextConfiguration
@Test(groups = "ignore")
public class SkillsDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private SkillsDao skillsDao;

    @Test
    public void checkGetSkills(){
        String packageName = skillsDao.getSkillsPackage(1, "skills_us");
        assertNotNull(packageName);
    }


}
