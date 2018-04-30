package org.t2k.cgs.domain.usecases;

import org.t2k.cgs.domain.model.exceptions.DsException;

/**
 * Created by elad.avidan on 23/07/2014.
 */
public interface SkillsService {

    String getSkillsPackage(int publisherId, String packageName) throws DsException;
}
