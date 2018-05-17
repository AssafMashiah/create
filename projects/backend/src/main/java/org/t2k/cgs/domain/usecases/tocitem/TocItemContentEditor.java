package org.t2k.cgs.domain.usecases.tocitem;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.t2k.cgs.domain.usecases.course.StandardsChangeMode;
import org.t2k.cgs.domain.model.classification.StandardsChange;
import org.t2k.cgs.domain.model.classification.StandardsChangeInstance;
import org.t2k.cgs.domain.model.classification.StandardsDiff;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.service.standards.parser.StandardsHelper;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/6/13
 * Time: 2:11 PM
 */
public class TocItemContentEditor {

    private static final String PEDAGOGICAL_IDS = "pedagogicalIds";
    private static final String STANDARDS = "standards";
    private static final String RESOURCES = "resources";

    private static final String LEARNING_OBJECTS = "learningObjects";
    private static final String SEQUENCES = "sequences";
    private static final String SEQUENCE = "sequence";
    private static final String LEVELS = "levels";
    private static final String TASKS = "tasks";


    private static final String STANDARDS_PACKAGES = "standardPackages";
    private static final String STANDARDS_PACKAGE_VERSION = "version";
    private static final String STANDARDS_PACKAGE_ID = "stdPackageId";
    private static final String STANDARDS_PACKAGE_NAME = "name";
    private static final String STANDARDS_PACKAGE_SUBJECT_AREA = "subjectArea";

    private static final String CID = "cid";
    private static final String TYPE = "type";
    private static final String TITLE = "title";
    private static final String DIFFERENTIAL_SEQUENCE_TYPE = "differentiatedSequenceParent";
    private static final String ITEM = "item";

    public static final String RES_ID = "resId";
    public static final String RESOURCE_HREF = "href";

    public static final String SEQUENCE_REF = "sequenceRef";

    private TocItemCGSObject cgsObject;

    private StandardsHelper standardsHelper = new StandardsHelper();

    public TocItemContentEditor(TocItemCGSObject cgsObject) {

        this.cgsObject = cgsObject;
    }

    public Collection<String> getSequenceCids() {

        final Set<String> cids = new HashSet<String>();

        //TODO - refactor traverse to use for other things that are not standards -> remove packageId 'irrelevant'
        traverseStandards("irrelevant", new StandardsTraversalHandler() {

            @Override
            public Collection<String> handleStandardEncountered(Collection<String> pedagogicalIds,
                                                                String sequenceCid,
                                                                String sequenceName,
                                                                String taskCid,
                                                                String taskName) {

                cids.add(sequenceCid);

                //Nothing to delete
                return Collections.emptyList();
            }
        });

        return cids;
    }

    public void deleteStandards(String packageId, Collection<String> pedagogicalIdsToDelete) {

        deleteStandardsRecursive(packageId, pedagogicalIdsToDelete, false);
    }

    public void deleteStandards(String packageId) {

        deleteStandardsRecursive(packageId, null, true);
    }

    public void traverseStandards(String packageId, StandardsTraversalHandler handler) {

        Collection<String> pedagogicalIds = null;
        Collection<String> deleteOrder = null;

        //Toc Item level standards
        DBObject tocItemContentNode = cgsObject.getContentData();

        pedagogicalIds = getStandardsOfNodeByPackage(packageId, tocItemContentNode);

        //call back handler with toc level information
        deleteOrder = handler.handleStandardEncountered(pedagogicalIds, null, null, null, null);  // returns null if we need to delete all
        deleteStandardsOfNodeByPackage(packageId, tocItemContentNode, deleteOrder);

        //Traverse learning objects - (available in lessons)
        BasicDBList losNodeList = (BasicDBList) tocItemContentNode.get(LEARNING_OBJECTS);
        if (losNodeList != null) {
            for (int i = 0; i < losNodeList.size(); i++) {
                DBObject node = (DBObject) losNodeList.get(i);
                traverseSequenceListStandards(packageId, handler, node);
                deleteStandardsOfNodeByPackage(packageId, node, deleteOrder);
            }
        }

        //Flat sequences (available in assessment)
        traverseSequenceListStandards(packageId, handler, tocItemContentNode);

    }

    private void traverseSequenceListStandards(String packageId, StandardsTraversalHandler handler, DBObject node) {

        //Traverse sequence level standards
        BasicDBList sequencesNodeList = (BasicDBList) node.get(SEQUENCES);
        if (sequencesNodeList != null) {
            for (int j = 0; j < sequencesNodeList.size(); j++) {
                DBObject sequenceNode = (DBObject) sequencesNodeList.get(j);
                if (!SEQUENCE_REF.equals(sequenceNode.get(TYPE).toString())) {
                    if (!DIFFERENTIAL_SEQUENCE_TYPE.equals(sequenceNode.get(TYPE).toString())) {
                        traverseSequenceStandards(packageId, handler, sequenceNode);
                    } else { // If we have a differential sequence than we ignore it and iterate on it's children
                        BasicDBList levelsNodeList = (BasicDBList) sequenceNode.get(LEVELS);

                        if (levelsNodeList != null) {
                            for (int k = 0; k < levelsNodeList.size(); k++) {
                                DBObject levelNode = (DBObject) levelsNodeList.get(k);
                                DBObject innerSequenceNode = (DBObject) levelNode.get(SEQUENCE);

                                traverseSequenceStandards(packageId, handler, innerSequenceNode);
                            }
                        }
                    }
                }
            }
        }
    }

    private void traverseSequenceStandards(String packageId, StandardsTraversalHandler handler, DBObject sequenceNode) {

        Collection<String> pedagogicalIds;
        Collection<String> deleteOrder = null;

        String sequenceCid = sequenceNode.get(CID).toString();
        String sequenceName = sequenceNode.get(TITLE).toString();

        pedagogicalIds = getStandardsOfNodeByPackage(packageId, sequenceNode);

        //call back handler with standard level information
        deleteOrder = handler.handleStandardEncountered(pedagogicalIds, sequenceCid, sequenceName, null, null);
        deleteStandardsOfNodeByPackage(packageId, sequenceNode, deleteOrder);


        //traverse the tasks of a sequence
        BasicDBList tasksNodeList = (BasicDBList) sequenceNode.get(TASKS);

        if (tasksNodeList != null) {
            for (int i = 0; i < tasksNodeList.size(); i++) {
                DBObject taskNode = (DBObject) tasksNodeList.get(i);

                String taskCid = taskNode.get(CID).toString();
                String taskName = null;
                if (taskNode.get(TITLE) != null) {
                    taskName = taskNode.get(TITLE).toString();
                }

                pedagogicalIds = getStandardsOfNodeByPackage(packageId, taskNode);

                //call back handler with standard level information
                deleteOrder = handler.handleStandardEncountered(pedagogicalIds, sequenceCid, sequenceName, taskCid, taskName);
                deleteStandardsOfNodeByPackage(packageId, taskNode, deleteOrder);
            }
        }
    }

    private void deleteStandardsOfNodeByPackage(String packageId, DBObject node, Collection<String> standardsToDelete) {

        if (standardsToDelete == null) return;
        BasicDBList standardsNodeList = (BasicDBList) node.get(STANDARDS);

        if (standardsNodeList != null) {

            Iterator<Object> packagesItr = standardsNodeList.iterator();
            while (packagesItr.hasNext()) {
                DBObject packageNode = (DBObject) packagesItr.next();
                String standardPackageId = (String) packageNode.get(STANDARDS_PACKAGE_ID);

                //Ignore other packages
                if (!packageId.equals(standardPackageId)) continue;

                BasicDBList pedagogicalIdsNodeList = (BasicDBList) packageNode.get(PEDAGOGICAL_IDS);

                Iterator<Object> pedagogicalIdsItr = pedagogicalIdsNodeList.iterator();
                while (pedagogicalIdsItr.hasNext()) {
                    String pedagogicalId = (String) pedagogicalIdsItr.next();

                    //remove pedagogical Id if it's in the standards to delete list
                    if (standardsToDelete.contains(pedagogicalId)) {
                        pedagogicalIdsItr.remove();
                    }
                }

                //if package is empty after all the deletes of pedagogical ids, remove the entire package
                if (pedagogicalIdsNodeList.size() == 0) {
                    packagesItr.remove();
                }

            }
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
                if (!packageId.equals(standardPackageId)) continue;

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

    public void deleteStandardsPackage(String packageId) {

        BasicDBList packages = (BasicDBList) cgsObject.getContentData().get(STANDARDS_PACKAGES);

        for (int i = 0; i < packages.size(); i++) {
            DBObject packageDBObj = (DBObject) packages.get(i);
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageId)) {
                packages.remove(i);
                break;
            }
        }
    }

    public void updateStandardsPackageVersion(String packageId, String newVersion) {
        standardsHelper.updateStandardsPackageVersionInCgsObject(packageId,newVersion, cgsObject.getContentData());
    }


    public void updateStandardsPackageId(String packageName, String packageSubjectArea, String version) {

        // Update the standardPackageId of the lesson,seq,task

        Map<String, DBObject> contentDataMap = (Map<String, DBObject>) cgsObject.getContentData();

        updateStandardLinks(contentDataMap, packageName, packageSubjectArea, version);

        BasicDBList learningObjectsList = (BasicDBList) contentDataMap.get(LEARNING_OBJECTS);

        if (learningObjectsList != null) {
            for (Object los : learningObjectsList) {

                Map<String, DBObject> losMap = (Map<String, DBObject>) los;
                if (losMap != null) {
                    BasicDBList sequencesList = (BasicDBList) losMap.get(SEQUENCES);


                    if (sequencesList != null) {

                        BasicDBList sequencesLevelList = new BasicDBList();

                        for (Object sequence : sequencesList) {
                            Map<String, DBObject> sequenceMap = (Map<String, DBObject>) sequence;
                            if (sequenceMap.containsKey(LEVELS)) {

                                List<DBObject> levels = (List<DBObject>) sequenceMap.get(LEVELS);
                                for (DBObject level : levels) {
                                    Object seq = level.get(SEQUENCE);
                                    sequencesLevelList.add(seq);
                                }
                            } else {
                                sequencesLevelList.add(sequenceMap);
                            }
                        }


                        for (Object sequence : sequencesLevelList) {

                            Map<String, DBObject> sequenceMap = (Map<String, DBObject>) sequence;
                            if (sequenceMap != null) {
                                updateStandardLinks(sequenceMap, packageName, packageSubjectArea, version);
                            }
                            BasicDBList tasksList = (BasicDBList) sequenceMap.get(TASKS);

                            if (tasksList != null) {
                                for (Object task : tasksList) {

                                    Map<String, DBObject> tasksMap = (Map<String, DBObject>) task;
                                    if (tasksMap != null) {
                                        updateStandardLinks(tasksMap, packageName, packageSubjectArea, version);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        //Support flat sequence (for assessments)

        BasicDBList sequencesList = (BasicDBList) contentDataMap.get(SEQUENCES);

        if (sequencesList != null) {
            for (Object sequence : sequencesList) {

                Map<String, DBObject> sequenceMap = (Map<String, DBObject>) sequence;
                if (sequenceMap != null) {
                    updateStandardLinks(sequenceMap, packageName, packageSubjectArea, version);
                }
                BasicDBList tasksList = (BasicDBList) sequenceMap.get(TASKS);

                if (tasksList != null) {
                    for (Object task : tasksList) {

                        Map<String, DBObject> tasksMap = (Map<String, DBObject>) task;
                        if (tasksMap != null) {
                            updateStandardLinks(tasksMap, packageName, packageSubjectArea, version);
                        }
                    }
                }
            }
        }
    }


    // This function will update the field stdPackageid in the standards links
    // to the new convention for every lesson/sequence/task that contain standard links

    public void updateStandardLinks(Map<String, DBObject> ObjectsMap, String packageName, String packageSubjectArea, String version) {

        String newStandardPackageid = packageName + "_" + packageSubjectArea + "_" + version;
        String name = "";
        String subjectArea = "";

        BasicDBList standardsList = (BasicDBList) ObjectsMap.get(STANDARDS);

        if (standardsList != null) {
            for (Object standards : standardsList) {

                Map<String, String> standardsMap = (Map<String, String>) standards;
                if (standardsMap != null) {

                    String stdPackageId = standardsMap.get(STANDARDS_PACKAGE_ID);

                    int indexOfName = stdPackageId.indexOf('_', 0);
                    if (indexOfName > -1) {
                        name = new String(stdPackageId.substring(0, indexOfName));
                    }
                    int indexOfSubjectArea = stdPackageId.indexOf('_', indexOfName + 1);
                    if (indexOfSubjectArea > -1) {
                        subjectArea = new String(stdPackageId.substring(indexOfName + 1, indexOfSubjectArea));
                    }


                    if (name.equals(packageName) && subjectArea.equals(packageSubjectArea)) {
                        standardsMap.put(STANDARDS_PACKAGE_ID, newStandardPackageid);
                    }
                }

            }
        }
    }


    public void deleteStandardsRecursive(String packageId, final Collection<String> pedagogicalIdsToDelete, final boolean deleteAll) {

        traverseStandards(packageId, new StandardsTraversalHandler() {
            @Override
            public Collection<String> handleStandardEncountered(Collection<String> pedagogicalIds,
                                                                String sequenceCid,
                                                                String sequenceName,
                                                                String taskCid,
                                                                String taskName) {


                if (deleteAll) {
                    //delete all the found pedagogicalIds
                    return pedagogicalIds;
                } else {
                    // delete only the pedagogicalIds provided
                    return pedagogicalIdsToDelete;
                }

            }
        });

    }

    public void deleteStandardsFromLearningObjects(String packageId){
        BasicDBList learningObjectsList = (BasicDBList) cgsObject.getContentData().get(LEARNING_OBJECTS);
        if (learningObjectsList == null)
            return;
        for (int i = 0; i < learningObjectsList.size(); i++) { // iterate over the LOs in a TOC and update deleted/updated items

            DBObject lo = (DBObject) learningObjectsList.get(i);
            standardsHelper.deletePedagogicalIdsFromCgsContent(packageId, null, true,lo);

        }
    }

    public void getStandardsChangesInLearningObjects(StandardsChange standardsChange, StandardsDiff diff, String deletedPackageId, StandardsChangeMode standardsChangeMode,String tocItemName, String tocItemCid) {
        BasicDBList learningObjectsList = (BasicDBList) cgsObject.getContentData().get(LEARNING_OBJECTS);
        if (learningObjectsList == null)
            return;
        for (int i = 0; i < learningObjectsList.size(); i++) { // iterate over the LOs in a TOC and update deleted/updated items

            DBObject lo = (DBObject) learningObjectsList.get(i);
            Collection<String> pedagogicalIds = Collections.emptyList();
            if (lo.containsField(ITEM))
                pedagogicalIds = getStandardsOfNodeByPackage(deletedPackageId, (DBObject)lo.get(ITEM));
            else {
                pedagogicalIds = getStandardsOfNodeByPackage(deletedPackageId, lo);
            }
            String name = lo.containsField(TITLE) ? lo.get(TITLE).toString() : "";
            String id = lo.get(CID).toString();

            StandardsChangeInstance deletes = new StandardsChangeInstance();
            deletes.setLoName(name);
            deletes.setLoId(id);
            deletes.setTocItemCid(tocItemCid);
            deletes.setTocItemName(tocItemName);

            StandardsChangeInstance updates = new StandardsChangeInstance();
            updates.setLoName(name);
            updates.setLoId(id);
            updates.setTocItemCid(tocItemCid);
            updates.setTocItemName(tocItemName);

            for (String pedagogicalId : pedagogicalIds) {
                if (standardsChangeMode == StandardsChangeMode.DELETE_ONLY) { // deleting only doesn't have a diff object
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
                standardsChange.addUpdateChange(updates);
            if (!deletes.getStandardIds().isEmpty())
                standardsChange.addDeleteChange(deletes);
        }
    }

    public void updateLearningObjectStandards(String packageId, String newVersion) {
        Map<String, DBObject> contentDataMap = (Map<String, DBObject>) cgsObject.getContentData();
        BasicDBList learningObjectsList = (BasicDBList) contentDataMap.get(LEARNING_OBJECTS);
        if (learningObjectsList != null) {
            for (int i=0;i<learningObjectsList.size();i++) {
                DBObject lo = (DBObject) learningObjectsList.get(i);
                standardsHelper.updateStandardVersionForCgsObject(lo,packageId,newVersion);
            }
        }
    }

    public static interface StandardsTraversalHandler {

        /**
         * traverse the different entities that have standards
         * with the ability to delete some of them during the traversing
         *
         * @param pedagogicalIds
         * @param sequenceCid
         * @param sequenceName
         * @param taskCid
         * @param taskName
         * @return - the standards to be deleted on the encountered node
         */
        public Collection<String> handleStandardEncountered(Collection<String> pedagogicalIds,
                                                            String sequenceCid,
                                                            String sequenceName,
                                                            String taskCid,
                                                            String taskName);

    }

}