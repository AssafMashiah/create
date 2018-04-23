//package org.t2k.lessons.tests;
//
//import org.springframework.dao.DataAccessException;
//import org.springframework.data.mongodb.core.query.Query;
//import org.t2k.cgs.dao.tocItem.TocItemsMongoDao;
//import org.t2k.cgs.dao.util.GenericDaoOperations;
//
///**
// * Created by IntelliJ IDEA.
// * User: ophir.barnea
// * Date: 09/11/12
// * Time: 16:20
// */
//public class LessonMongoTestDao extends TocItemsMongoDao implements GenericDaoOperations {
//
//    @Override
//    public void removeAllItems(String collectionName) throws DataAccessException {
//        collectionName=collectionName!=null?collectionName: getTocItemCollection();
//        getMongoTemplate().remove(new Query(), getTocItemCollection());
//    }
//
//}
