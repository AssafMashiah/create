package org.t2k.cgs.service.tocitem;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.tocitem.ContentTreeService;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.tocItem.ContentTree;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.packaging.ContentParseUtil;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 13/11/13
 * Time: 13:24
 */
@Service
public class ContentTreeServiceImpl implements ContentTreeService {
    private static Logger logger = Logger.getLogger(ContentTreeServiceImpl.class);

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    @Qualifier("lessonsDao")
    private TocItemDao lessonDao;

    @Override
    public ContentTree getSequenceTreeOfHiddenLessons(int publisherId, String courseId) throws DsException {
        try {
            ContentTree contentTree = new ContentTree();

            CourseCGSObject course = coursesDao.getCourse(publisherId, courseId, null, false);
            if (course == null) {
                throw new ResourceNotFoundException(courseId, "Course " + courseId + "  was not found ");
            }

            DBObject toc = (DBObject) course.getContentData().get(CourseCGSObject.CGS_COURSE_TOC);

            List<TocItemCGSObject> hiddenLessons = lessonDao.getHiddenLessonsWithSequences(publisherId, courseId);
            logger.debug("getSequenceTreeOfHiddenLessons of  " + courseId + ", found " + hiddenLessons.size() + " hidden lessons");
            Map<String, ContentTree.Node> tocRefNodes = convertTocItemsToSequenceTree(hiddenLessons);
            ContentTree.Node root = convertTocTree(toc, tocRefNodes);

            contentTree.setRoot(root);
            return contentTree;

        } catch (Exception e) {
            throw new DsException(e);
        }
    }

    /*
    Converts lesson to lesson->Lo->sequence tree and create index of lesson tree for further processing
     */
    private Map<String, ContentTree.Node> convertTocItemsToSequenceTree(List<TocItemCGSObject> tocItems) throws InvocationTargetException, IllegalAccessException {
        Map<String, ContentTree.Node> tocItemsMap = new HashMap<>();
        for (TocItemCGSObject tocItem : tocItems) {
            DBObject contentData = tocItem.getContentData();
            ContentTree.Node tocItemNode = new ContentTree.Node(contentData);
            tocItemsMap.put(tocItemNode.getCid(), tocItemNode);

            //currently support only lesson, for assessments see TocItemCGSObject.getSequences() example
            BasicDBList los = (BasicDBList) contentData.get(TocItemCGSObject.LEARNING_OBJECTS_FIELD);
            if (los != null) {
                for (Object lo : los) {
                    DBObject loDbObject = (DBObject) lo;
                    ContentTree.Node loNode = new ContentTree.Node(loDbObject);
                    tocItemNode.addChild(loNode);
                    BasicDBList sequencesDbObjects = (BasicDBList) (loDbObject).get(TocItemCGSObject.SEQUENCES_OBJECTS_FIELD);
                    if (sequencesDbObjects != null && !sequencesDbObjects.isEmpty()) {
                        for (Object sequence : sequencesDbObjects) {
                            DBObject sequenceDbObject = (DBObject) sequence;
                            ContentTree.Node sequenceNode = new ContentTree.Node(sequenceDbObject);
                            loNode.addChild(sequenceNode);
                        }
                    }
                }
            }
        }
        return tocItemsMap;
    }

    /*
   Recursively converts TOC tree into ContentTree and binds lesson TocRefs to lesson tree  from  map created by tocItemsMap
    */
    private ContentTree.Node convertTocTree(DBObject tocItem, Map<String, ContentTree.Node> tocRefNodes) throws InvocationTargetException, IllegalAccessException {
        ContentTree.Node tocItemNode = new ContentTree.Node(tocItem);
        BasicDBList tocItems = (BasicDBList) tocItem.get(ContentParseUtil.TOC_ITEMS);
        for (Object childTocItem : tocItems) {
            ContentTree.Node childTocItemNode = convertTocTree((DBObject) childTocItem, tocRefNodes);
            tocItemNode.addChild(childTocItemNode);
        }
        BasicDBList tocItemRefs = (BasicDBList) tocItem.get(ContentParseUtil.TOC_ITEM_REFS);
        for (Object childTocItem : tocItemRefs) {
            String cid = ((DBObject) childTocItem).get(TocItemCGSObject.CID).toString();
            ContentTree.Node childTocItemNode = tocRefNodes.get(cid);
            if (childTocItemNode != null) {
                tocItemNode.addChild(childTocItemNode);
            }
        }
        return tocItemNode;
    }

}
