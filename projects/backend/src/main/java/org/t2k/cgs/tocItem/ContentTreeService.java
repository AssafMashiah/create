package org.t2k.cgs.tocItem;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.tocItem.ContentTree;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 13/11/13
 * Time: 13:25
 */
public interface ContentTreeService {

    ContentTree getSequenceTreeOfHiddenLessons(int publisherId, String courseId) throws DsException;

}
