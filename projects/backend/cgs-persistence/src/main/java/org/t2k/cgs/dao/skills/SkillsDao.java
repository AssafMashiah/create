package org.t2k.cgs.dao.skills;

import org.springframework.dao.DataAccessException;

/**
 * Created by elad.avidan on 22/07/2014.
 */
public interface SkillsDao {

    String getSkillsPackage(int publisherId, String packageName) throws DataAccessException;
}
