package org.t2k.cgs.service;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.SkillsService;
import org.t2k.cgs.domain.usecases.user.SkillsDao;
import org.t2k.cgs.domain.model.exceptions.DsException;

import javax.inject.Inject;

/**
 * Created by elad.avidan on 23/07/2014.
 */
@Service
public class SkillsServiceImpl implements SkillsService {

    @Inject
    private SkillsDao skillsDao;

    @Override
    public String getSkillsPackage(int publisherId, String packageName) throws DsException {
        String result;
        try {
            result = skillsDao.getSkillsPackage(publisherId, packageName);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }

        return result;
    }
}
