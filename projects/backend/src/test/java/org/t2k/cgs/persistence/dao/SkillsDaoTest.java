package org.t2k.cgs.persistence.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.user.SkillsDao;
import org.testng.annotations.Test;

import static org.testng.Assert.assertNotNull;

/**
 * Created by elad.avidan on 22/07/2014.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class SkillsDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private SkillsDao skillsDao;

    @Test
    public void checkGetSkills() {
        String packageName = skillsDao.getSkillsPackage(1, "skills_us");
        assertNotNull(packageName);
    }
}
