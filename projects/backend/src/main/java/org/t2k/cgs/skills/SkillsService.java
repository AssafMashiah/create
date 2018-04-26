package org.t2k.cgs.skills;

import org.t2k.cgs.dataServices.exceptions.DsException;

/**
 * Created by elad.avidan on 23/07/2014.
 */
public interface SkillsService {

    String getSkillsPackage(int publisherId, String packageName) throws DsException;
}
