package org.t2k.cgs.persistence.dao;

import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.usecases.packaging.PackagingDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.PackagePhase;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 21/11/12
 * Time: 15:59
 */
@Component
public class PackagesMongoDao extends MongoDao implements PackagingDao {

    // package collection name in mongoDb
    protected static final String PACKAGES_COLLECTION = "packages";

    private final String PACK_ID = "_id";
    private final String PACKAGE_PHASE = "packagePhase";
    private final String USERNAME = "userName";
    private final String PUBLISHER_ID = "publisherId";
    private final String COURSE_ID = "courseId";
    private final String VERSION = "version";
    private final String PACKAGE_END_DATE = "packEndDate";
    private final String PACKAGE_START_DATE = "packStartDate";
    private final String PENDING_PLACE = "pendingPlace";
    private final String IS_SHOW = "isShow";
    private final String NUMBER_OF_RESOURCES_TO_PACK = "numberOfResourcesToPack";
    private final String NUMBER_OF_RESOURCES_DONE = "numberOfResourcesDone";

    @Override
    public CGSPackage getCGSPackage(String packageId) throws DataAccessException {
        Query query = new Query(Criteria.where(PACK_ID).is(packageId));
        return getMongoTemplate().findOne(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public void saveCGSPackage(CGSPackage cgsPackage) throws DataAccessException {
        getMongoTemplate().save(cgsPackage, PACKAGES_COLLECTION);
    }

    @Override
    public CGSPackage getCGSPackage(String courseId, String revision) throws DataAccessException {
        Query query = new Query(Criteria.where(COURSE_ID).is(courseId).and(VERSION).is(revision));
        return getMongoTemplate().findOne(query, CGSPackage.class, PACKAGES_COLLECTION);
    }


    @Override
    public List<CGSPackage> getPackagesOfPublisher(int publisherId) throws DataAccessException {
        Query query = new Query(Criteria.where(PUBLISHER_ID).is(publisherId));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByPhase(String courseId, List<String> packagePhases) {
        Query query = new Query(Criteria.where(COURSE_ID).is(courseId).and(PACKAGE_PHASE).in(packagePhases));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public void removeUnEndedPackages() throws DataAccessException {
        Query query = new Query(Criteria.where(PACKAGE_END_DATE).is(null));
        getMongoTemplate().remove(query, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByCourse(String courseId) throws DataAccessException {
        Query query = new Query(Criteria.where(COURSE_ID).is(courseId));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public void removePackagesByPackagePhases(List<String> packagePhases) throws DataAccessException {
        Query query = new Query(Criteria.where(PACKAGE_PHASE).in(packagePhases));
        getMongoTemplate().remove(query, PACKAGES_COLLECTION);
    }

    @Override
    public void removePackageById(String packageId) throws DataAccessException {
        Query query = new Query(Criteria.where(PACK_ID).is(packageId));
        getMongoTemplate().remove(query, PACKAGES_COLLECTION);
    }

    @Override
    public void increasePackageResourceCount(String packId) throws DataAccessException {
        Query query = new Query(Criteria.where(PACK_ID).is(packId));
        Update update = new Update();
        update.inc(NUMBER_OF_RESOURCES_TO_PACK, 1);
        getMongoTemplate().updateFirst(query, update, PACKAGES_COLLECTION);
    }

    @Override
    public void increasePackageResourceDoneCount(String packId) throws DataAccessException {
        Query query = new Query(Criteria.where(PACK_ID).is(packId));
        Update update = new Update();
        update.inc(NUMBER_OF_RESOURCES_DONE, 1);
        getMongoTemplate().updateFirst(query, update, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByUserFromSpecificDate(String username, Date fromDateIso) throws DataAccessException {
        Query query = new Query(Criteria.where(USERNAME).is(username).and(PACKAGE_START_DATE).gte(fromDateIso));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public void updatePackagePendingPlace(String packId, int pendingPlace) {
        Query query = new Query(Criteria.where(PACK_ID).is(packId));
        Update update = new Update();
        update.set(PENDING_PLACE, pendingPlace);
        getMongoTemplate().updateFirst(query, update, PACKAGES_COLLECTION);
    }

    @Override
    public void updatePackagePhase(String packageId, PackagePhase packagePhase) throws DataAccessException {
        Query query = new Query(Criteria.where(PACK_ID).is(packageId));
        Update update = new Update();
        update.set(PACKAGE_PHASE, packagePhase.name());
        getMongoTemplate().updateFirst(query, update, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByUserAndState(String username, List<String> packagePhases) throws DataAccessException {
        Query query = new Query(Criteria.where(USERNAME).is(username)
                .and(IS_SHOW).is(true)
                .and(PACKAGE_PHASE).in(packagePhases));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByUsernameToDisplay(String username, int maxNotifications) throws DataAccessException {
        Query query = new Query(Criteria.where(USERNAME).is(username).and(IS_SHOW).is(true));
        query.with(new Sort(Sort.Direction.DESC, PACKAGE_START_DATE));
        query.limit(maxNotifications);
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByPublisherToDisplay(int publisherId) throws DataAccessException {
        Query query = new Query(Criteria.where(PUBLISHER_ID).is(publisherId).and(IS_SHOW).is(true));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getPackagesByPhase(List<String> packagePhases) {
        Query query = new Query(Criteria.where(PACKAGE_PHASE).in(packagePhases));
        return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
    }

    @Override
    public List<CGSPackage> getOldHiddenPackages(Date dateOfExpiredPackages) throws DaoException {
        try {
            Query query = new Query(Criteria.where(IS_SHOW).is(false).and(PACKAGE_END_DATE).lte(dateOfExpiredPackages));
            return getMongoTemplate().find(query, CGSPackage.class, PACKAGES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removePackage(String packId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(PACK_ID).is(packId));
            getMongoTemplate().remove(query, PACKAGES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }
}
