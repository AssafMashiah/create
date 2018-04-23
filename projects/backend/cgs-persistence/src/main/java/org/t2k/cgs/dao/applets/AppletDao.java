package org.t2k.cgs.dao.applets;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.t2k.cgs.model.applet.AppletManifest;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 03/02/13
 * Time: 13:10
 */
public interface AppletDao {

    AppletManifest getAppletsManifestsByCourseId(String courseId, Date modifiedSince);

    void saveAppletManifest(AppletManifest appletManifest);

    DBObject getApplets(String courseId) throws DaoException;

    void saveAppletDBObject(DBObject applet) throws DaoException;

    DBRef getDBRefOfApplets(String courseId) throws DaoException;

    void deleteAppletManifest(String courseId);
}