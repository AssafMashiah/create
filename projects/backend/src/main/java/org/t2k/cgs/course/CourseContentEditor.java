package org.t2k.cgs.course;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.classification.StandardsChange;
import org.t2k.cgs.model.classification.StandardsChangeInstance;
import org.t2k.cgs.model.classification.StandardsDiff;
import org.t2k.cgs.model.classification.StandardsPackage;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.standards.parser.StandardsHelper;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/6/13
 * Time: 2:17 PM
 */
public class CourseContentEditor {

    private static Logger logger = Logger.getLogger(CourseContentEditor.class);

    private static final String PEDAGOGICAL_IDS = "pedagogicalIds";
    private static final String STANDARDS = "standards";
    private static final String RESOURCES = "resources";

    private static final String STANDARDS_PACKAGES = "standardPackages";
    private static final String STANDARDS_PACKAGE_ID = "stdPackageId";
    private static final String STANDARDS_PACKAGE_NAME = "name";
    private static final String STANDARDS_PACKAGE_SUBJECT_AREA = "subjectArea";
    private static final String STANDARDS_PACKAGE_VERSION = "version";

    private static final String TOC = "toc";
    private static final String TOC_ITEMS = "tocItems";
    private static final String TOC_ITEM_REFS = "tocItemRefs";
    private static final String TOC_ITEMS_RESOURCES = "resources";
    private static final String TOC_ITEMS_STANDARD_PACKAGES = "standardPackages";
    private static final String TOC_ITEMS_STANDARDS = "standards";
    private static final String TOC_ITEMS_CONTENT = "tocItemsContent";
    private static final String TOC_ITEM_CID = "cid";
    private static final String TOC_ITEMS_TEACHER_GUIDE = "teacherGuide";
    private static final String TOC_ITEMS_DESCRIPTION = "description";
    private static final String TOC_ITEMS_KEYWORDS = "keywords";
    private static final String TOC_ITEMS_OBJECTIVE = "objective";
    private static final String TOC_ITEM_TITLE = "title";
    private static final String TOC_ITEM_FORMAT = "format";

    private static final String CID = "cid";
    private static final String TYPE = "type";

    private CourseCGSObject cgsObject;

    private StandardsHelper standardsHelper = new StandardsHelper();
    
    public CourseContentEditor(CourseCGSObject cgsObject) {
        this.cgsObject = cgsObject;
    }

    public Iterator<StandardsPackage> getStandardsPackageIterator() {
        return new StandardPackageIterator(this.cgsObject);
    }

    /**
     * Deletes standard @packageId from course.standardPackages
     * @param packageId
     */
    public void deleteStandardsPackage(String packageId) {
        standardsHelper.deleteStandardsPackageFromCgsContent(packageId,this.cgsObject.getContentData());
    }

    /**
     * Deletes standard @packageId from course.standards
     * if @deleteAll is false, than we remove only the standards from @deletedStandards.
     *
     *
     * @param packageId
     * @param deletedStandards
     * @param deleteAll
     */
    public void deleteStandardFromSelectedStandardList(String packageId, Set<String> deletedStandards, Boolean deleteAll) {
        standardsHelper.deletePedagogicalIdsFromCgsContent(packageId,deletedStandards,deleteAll,this.cgsObject.getContentData());
    }

    /***
     * updates the standardPackage that their id matches @packageIdToModify in the course's tocs.standards,
     * with the @newVersion
     * @param packageIdToModify
     * @param newVersion
     */
    public void updateStandardsInCourseTocs(String packageIdToModify, String newVersion) {
        DBObject toc = (DBObject) cgsObject.getContentData().get(TOC);
        updateStandardVersionForCourseTocsRecursively(toc, packageIdToModify, newVersion);
    }

    private void updateStandardVersionForCourseTocsRecursively(DBObject toc, String packageId,String newVersion) {
        BasicDBList tocItemsList = (BasicDBList) toc.get(TOC_ITEMS);
        for (int i = 0; i < tocItemsList.size(); i++) {    // iterate over tocItems and update version for their standards.
            DBObject tocItem = (DBObject) tocItemsList.get(i);
            standardsHelper.updateStandardVersionForCgsObject(tocItem,packageId,newVersion);
            if (tocItem.containsField(TOC_ITEMS)) {
                updateStandardVersionForCourseTocsRecursively(tocItem, packageId,newVersion);  //continue recursively
            }
        }
    }


    /**
     * Deletes standards with @packageId from course's tocItems.
     * Also deletes from inner tocItems (toc inside a toc and so on) recursively
     *
     * @param packageId
     * @param deletedStandards
     * @param deleteAll
     */
    public void deleteStandardFromCourseTocItem(String packageId, Set<String> deletedStandards, Boolean deleteAll) {
        DBObject toc = (DBObject) cgsObject.getContentData().get(TOC);
        deleteStandardFromCourseTocItemRecursively(toc, packageId, deletedStandards, deleteAll);
    }

    private void deleteStandardFromCourseTocItemRecursively(DBObject toc, String packageId, Set<String> deletedStandards, Boolean deleteAll) {
        BasicDBList tocItemsList = (BasicDBList) toc.get(TOC_ITEMS);
        for (int i = 0; i < tocItemsList.size(); i++) {
            DBObject tocItem = (DBObject) tocItemsList.get(i);
            standardsHelper.deletePedagogicalIdsFromCgsContent(packageId,deletedStandards,deleteAll,tocItem);
            if (tocItem.containsField(TOC_ITEMS)) {
                deleteStandardFromCourseTocItemRecursively(tocItem, packageId, deletedStandards, deleteAll);
            }
        }
    }

    public Collection<TocItemRef> getAllTocItemRefs() {
        Collection<TocItemRef> tocItemRefs = new LinkedList<TocItemRef>();
        if (this.cgsObject == null) {
            return Collections.emptyList();
        }

        DBObject toc = (DBObject) this.cgsObject.getContentData().get(TOC);
        fillTocItemsRecursive(toc, tocItemRefs);
        return tocItemRefs;
    }

    private void fillTocItemsRecursive(DBObject toc, Collection<TocItemRef> tocItemRefs) {
        BasicDBList tocItemsRefsList = (BasicDBList) toc.get(TOC_ITEM_REFS);

        //If tocItemRefs exists on this node directly add all the refs
        if (tocItemsRefsList != null) {
            for (int i = 0; i < tocItemsRefsList.size(); i++) {
                DBObject tocItemRefNode = (DBObject) tocItemsRefsList.get(i);
                EntityType entityType = EntityType.forName(tocItemRefNode.get(TYPE).toString());
                String cid = tocItemRefNode.get(CID).toString();
                tocItemRefs.add(new TocItemRef(cid, entityType));
            }
        }

        //recursive call on all tocItems
        BasicDBList tocItemsList = (BasicDBList) toc.get(TOC_ITEMS);

        if (tocItemsList != null) {
            for (int i = 0; i < tocItemsList.size(); i++) {
                DBObject tocItemNode = (DBObject) tocItemsList.get(i);
                fillTocItemsRecursive(tocItemNode, tocItemRefs);
            }
        }
    }

    public void updateStandardsPackageVersion(String packageIdToChange, String newVersion) {
        BasicDBList packages = (BasicDBList) this.cgsObject.getContentData().get(STANDARDS_PACKAGES);

        for (int i = 0; i < packages.size(); i++) {
            DBObject packageDBObj = (DBObject) packages.get(i);
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageIdToChange)) {
                packageDBObj.put(STANDARDS_PACKAGE_VERSION, newVersion);
                standardsHelper.updateElementWithNewStandardsId(packageDBObj, newVersion);
                break;
            }
        }
    }

    public void replaceTocItemRefsWithTocItemsHeadersAndKeepOnlyMinimalDataInCourse(List<TocItemCGSObject> tocItems) {
        DBObject toc = (DBObject) cgsObject.getContentData().get(TOC);
        toc = createNewMinimizedTOCDBObject(toc);

        //create tocItems map by cid
        Map<String, TocItemCGSObject> tocItemsById = new HashMap<>();

        for (TocItemCGSObject tocItem : tocItems) {
            tocItemsById.put(tocItem.getContentId(), tocItem);
        }

        replaceTocItemRefsWithTocItemHeadersRecursive(tocItemsById, toc);
        cgsObject.getContentData().put(TOC,toc); // replace the "toc" element with the modified one
    }

    private DBObject createNewMinimizedTOCDBObject(DBObject toc) {
        DBObject result = new BasicDBObject();
        List<String> keysToKeep = Arrays.asList("cid","title","tocItemRefs","tocItems");
        for (String keyToKeep : keysToKeep){
            if (toc.containsField(keyToKeep))
                result.put(keyToKeep,toc.get(keyToKeep));
        }
        return result;
    }

    private void replaceTocItemRefsWithTocItemHeadersRecursive(Map<String, TocItemCGSObject> tocItemsById, DBObject tocNode) {
        BasicDBList tocItems = (BasicDBList) tocNode.get(TOC_ITEMS);
        BasicDBList tocItemsRef = (BasicDBList) tocNode.get(TOC_ITEM_REFS);

        if (tocItemsRef != null) {
            BasicDBList tocItemsContent = new BasicDBList();

            for (int i = 0; i < tocItemsRef.size(); i++) {
                DBObject minimizedTocItem = new BasicDBObject();
                DBObject tocItemRef = (DBObject) tocItemsRef.get(i);
                if (!tocItemsById.containsKey(tocItemRef.get(CID))){ // if the tocItemsById doesn't contain the data for this tocItem, don't include it in the output
                    continue;
                }
                try { // taking only cid, type, format and title from each lesson
                    minimizedTocItem.put(CID,tocItemRef.get(CID));
                    minimizedTocItem.put(TYPE, tocItemRef.get(TYPE));
                    minimizedTocItem.put(TOC_ITEM_TITLE,tocItemsById.get(tocItemRef.get(CID)).getContentData().get(TOC_ITEM_TITLE));
                    if (EntityType.forName((String) tocItemRef.get(TYPE)) == EntityType.LESSON) {
                        minimizedTocItem.put(TOC_ITEM_FORMAT, tocItemsById.get(tocItemRef.get(CID)).getContentData().get(TOC_ITEM_FORMAT));
                    }
                } catch (NullPointerException e) {
                    logger.warn("Wasn't able to find the data for lesson, ignoring Cid: " + tocItemRef.get(CID));
                }
                tocItemsContent.add(minimizedTocItem);
            }

            //Add tocItems, remove refrences
            tocNode.removeField(TOC_ITEM_REFS);
            tocNode.put(TOC_ITEMS_CONTENT, tocItemsContent);
        }

        if (tocItems != null) {
            for (int i = 0; i < tocItems.size(); i++) {
                DBObject toc = (DBObject) tocItems.get(i);
                toc = createNewMinimizedTOCDBObject(toc); // keeps only the name, title, tocItem & tocItemRefs in the DBObject
                replaceTocItemRefsWithTocItemHeadersRecursive(tocItemsById, toc);
                tocItems.set(i,toc);
            }
        }
    }

    public StandardsChange getChangesListForStandardPackage(StandardsDiff diff, String updatedPackageId, StandardsChange change, StandardsChangeMode changeMode) {
        DBObject nodeToCheck = cgsObject.getContentData();
        String id = cgsObject.getContentId();
        String title = cgsObject.getTitle();
        updateStandardChangesToTocNode(diff, updatedPackageId, id, title, nodeToCheck, change, changeMode);
        return change;
    }

    private void updateStandardChangesToTocNode(StandardsDiff diff, String updatedPackageId, String nodeId, String nodeTitle, DBObject nodeToCheck, StandardsChange change, StandardsChangeMode changeMode) {
        StandardsChangeInstance updates = new StandardsChangeInstance();
        updates.setTocId(nodeId);
        updates.setTocName(nodeTitle);

        StandardsChangeInstance deletes = new StandardsChangeInstance();
        deletes.setTocId(nodeId);
        deletes.setTocName(nodeTitle);

        Collection<String> pedagogicalIds = getStandardsOfNodeByPackage(updatedPackageId, nodeToCheck);
        for (String pedagogicalId : pedagogicalIds) {
            if (changeMode == StandardsChangeMode.DELETE_ONLY) { // deleting only doesn't have a diff object
                deletes.addStandard(pedagogicalId);
            } else {   // need to see if the change is a modification or a deletion
                if (diff.getUpdatedStandards().contains(pedagogicalId)) {
                    updates.addStandard(pedagogicalId);
                }
                if (diff.getDeletedStandards().contains(pedagogicalId)) {
                    deletes.addStandard(pedagogicalId);
                }
            }
        }

        if (!updates.getStandardIds().isEmpty())
            change.addUpdateChange(updates);
        if (!deletes.getStandardIds().isEmpty())
            change.addDeleteChange(deletes);
        BasicDBList tocItemsList = null;
        if (nodeToCheck.containsField(TOC) && ((DBObject)nodeToCheck.get(TOC)).get(TOC_ITEMS) !=null) // root course node
            tocItemsList = (BasicDBList) ((DBObject)nodeToCheck.get(TOC)).get(TOC_ITEMS);
        else if (nodeToCheck.containsField(TOC_ITEMS))      // inside a toc node
            tocItemsList = (BasicDBList) (nodeToCheck.get(TOC_ITEMS));
        if (tocItemsList==null)
            return;   //no toc items found
        for (int i = 0; i < tocItemsList.size(); i++) {
            DBObject tocItem =((DBObject) tocItemsList.get(i));
            String cid = tocItem.get(TOC_ITEM_CID).toString();
            String title = tocItem.get(TOC_ITEM_TITLE).toString();
            updateStandardChangesToTocNode(diff, updatedPackageId, cid, title, (DBObject) tocItemsList.get(i), change, changeMode);
        }
    }

    private Collection<String> getStandardsOfNodeByPackage(String packageId, DBObject node) {
        Collection<String> pedagogicalIds;
        BasicDBList standardsNodeList = (BasicDBList) node.get(STANDARDS);
        pedagogicalIds = new LinkedList<String>();

        if (standardsNodeList != null) {
            Iterator<Object> packagesItr = standardsNodeList.iterator();
            while (packagesItr.hasNext()) {
                DBObject packageNode = (DBObject) packagesItr.next();
                String standardPackageId = (String) packageNode.get(STANDARDS_PACKAGE_ID);

                //Ignore other packages
                if (!packageId.equals(standardPackageId)) {
                    continue;
                }

                BasicDBList pedagogicalIdsNodeList = (BasicDBList) packageNode.get(PEDAGOGICAL_IDS);
                Iterator<Object> pedagogicalIdsItr = pedagogicalIdsNodeList.iterator();
                while (pedagogicalIdsItr.hasNext()) {
                    String pedagogicalId = (String) pedagogicalIdsItr.next();
                    pedagogicalIds.add(pedagogicalId);
                }
            }
        }
        return pedagogicalIds;
    }

    public void deleteStandards(String packageId) {
        deleteStandards(packageId, null, true);
    }

    public void deleteStandards(String packageId, Set<String> deletedStandards, Boolean deleteAll) {
        // delete tagging of standards from course entities
        deleteStandardFromSelectedStandardList(packageId, deletedStandards, deleteAll);

        //delete tagging of standards from course->toc->tocItems
        deleteStandardFromCourseTocItem(packageId, deletedStandards, deleteAll);
    }

    public void updateStandardsInCourseRoot(String packageIdToModify, String newVersion) throws DsException {
        BasicDBList packages = (BasicDBList) this.cgsObject.getContentData().get(STANDARDS);
        if (packages == null) {
            String errMsg = String.format("The course %s has no standards field.", this.cgsObject.getEntityId());
            logger.error(errMsg);
            throw new DsException(errMsg);
        }

        for (int i = 0; i < packages.size(); i++) {
            DBObject packageDBObj = (DBObject) packages.get(i);
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageIdToModify)) {
                standardsHelper.updateElementWithNewStandardsId(packageDBObj, newVersion);
                break;
            }
        }
    }



    /**
     * Standard package iterator
     */
    private static class StandardPackageIterator implements Iterator<StandardsPackage> {

        private Iterator<Object> dbIterator;

        public StandardPackageIterator(CourseCGSObject cgsObject) {
            DBObject courseDBObject = cgsObject.getContentData();
            BasicDBList packages = (BasicDBList) courseDBObject.get(STANDARDS_PACKAGES);
            dbIterator = packages.iterator();
        }

        @Override
        public boolean hasNext() {
            return this.dbIterator.hasNext();
        }

        @Override
        public StandardsPackage next() {
            DBObject nextDbObject = (DBObject) dbIterator.next();

            StandardsPackage sp = new StandardsPackage();
            sp.setName(nextDbObject.get(STANDARDS_PACKAGE_NAME).toString());
            sp.setStdPackageId(nextDbObject.get(STANDARDS_PACKAGE_ID).toString());
            sp.setSubjectArea(nextDbObject.get(STANDARDS_PACKAGE_SUBJECT_AREA).toString());
            sp.setVersion(nextDbObject.get(STANDARDS_PACKAGE_VERSION).toString());

            return sp;
        }

        @Override
        public void remove() {
            dbIterator.remove();
        }
    }

    public static class TocItemRef {

        private String cid;
        private EntityType type;

        public TocItemRef(String cid, EntityType type) {
            this.cid = cid;
            this.type = type;
        }

        public String getCid() {
            return cid;
        }

        public void setCid(String cid) {
            this.cid = cid;
        }

        public EntityType getType() {
            return type;
        }

        public void setType(EntityType type) {
            this.type = type;
        }
    }

}