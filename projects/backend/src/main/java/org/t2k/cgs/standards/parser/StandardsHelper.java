package org.t2k.cgs.standards.parser;

import atg.taglib.json.util.JSONException;
import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.classification.ScormStandardsPackage;
import org.t2k.cgs.model.classification.StandardNode;
import org.t2k.cgs.model.classification.StandardPackage;
import org.t2k.cgs.model.classification.TaggedStandards;
import org.t2k.cgs.model.course.CourseCGSObject;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 03/07/14
 * Time: 16:49
 */
@Service
public class StandardsHelper {

    private final String TOC_ITEMS_STANDARDS = "standards";
    private final String PEDAGOGICAL_IDS = "pedagogicalIds";
    private final String STANDARDS_PACKAGES = "standardPackages";
    private final String STANDARDS_PACKAGE_VERSION = "version";
    private final String STANDARDS_PACKAGE_ID = "stdPackageId";
    private final String STANDARDS_PACKAGE_NAME = "name";
    private final String STANDARDS_PACKAGE_SUBJECT_AREA = "subjectArea";

    private ObjectMapper objectMapper = new ObjectMapper();

    public String getPackageNameFromId(String stdPackageId) {
        String name = null;
        int indexOfName = stdPackageId.indexOf('_', 0);
        if (indexOfName > -1) {
            name = stdPackageId.substring(0, indexOfName);
        }
        return name;
    }

    public String getPackageSubjectAreaFromId(String stdPackageId) {
        String subjectArea = null;
        int indexOfName = stdPackageId.indexOf('_', 0);
        int indexOfSubjectArea = stdPackageId.indexOf('_', indexOfName + 1);
        if (indexOfSubjectArea > -1)
            subjectArea = stdPackageId.substring(indexOfName + 1, indexOfSubjectArea);
        return subjectArea;
    }

    public void deleteStandardsPackageFromCgsContent(String packageId, DBObject cgsContentData) {
        BasicDBList packages = (BasicDBList) cgsContentData.get(STANDARDS_PACKAGES);
        if (packages == null)
            return;
        for (int i = 0; i < packages.size(); i++) {
            DBObject packageDBObj = (DBObject) packages.get(i);
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageId)) {
                packages.remove(i);
                break;
            }
        }
    }

    public void deletePedagogicalIdsFromCgsContent(String packageId, Collection<String> deletedStandards, Boolean deleteAll, DBObject cgsObject) {
        BasicDBList standardsList = (BasicDBList) cgsObject.get(TOC_ITEMS_STANDARDS);
        if (standardsList == null)
            return;
        for (int i = 0; i < standardsList.size(); i++) {
            DBObject packageDBObj = (DBObject) standardsList.get(i);
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageId)) {
                if (deleteAll) {
                    standardsList.remove(i);
                } else {
                    BasicDBList pedagogicalIds = (BasicDBList) packageDBObj.get(PEDAGOGICAL_IDS);
                    for (String standard : deletedStandards) {
                        pedagogicalIds.remove(standard);
                    }
                }
                break;
            }
        }
    }

    public void updateStandardVersionForCgsObject(DBObject cgsObject, String packageId, String newVersion) {
        BasicDBList packages = (BasicDBList) cgsObject.get(TOC_ITEMS_STANDARDS);
        if (packages == null)
            return;
        for (Object singlePackage : packages) {
            DBObject packageDBObj = (DBObject) singlePackage;
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageId)) {
                updateElementWithNewStandardsId(packageDBObj, newVersion);
                break;
            }
        }
    }

    public void updateElementWithNewStandardsId(DBObject packageDBObj, String newVersion) {
        String currencePackageId = packageDBObj.get(STANDARDS_PACKAGE_ID).toString();
        String name = this.getPackageNameFromId(currencePackageId);
        String subjectArea = this.getPackageSubjectAreaFromId(currencePackageId);
        String newStdPackageId = name + "_" + subjectArea + "_" + newVersion;
        packageDBObj.put(STANDARDS_PACKAGE_ID, newStdPackageId);
    }

    public void updateStandardsPackageVersionInCgsObject(String packageId, String newVersion, DBObject cgsObject) {
        BasicDBList packages = (BasicDBList) cgsObject.get(STANDARDS_PACKAGES);
        for (Object singlePackage : packages) {
            DBObject packageDBObj = (DBObject) singlePackage;
            if (packageDBObj.get(STANDARDS_PACKAGE_ID).equals(packageId)) {
                packageDBObj.put(STANDARDS_PACKAGE_VERSION, newVersion);
                String newStdPackageId = String.format("%s_%s_%s", packageDBObj.get(STANDARDS_PACKAGE_NAME), packageDBObj.get(STANDARDS_PACKAGE_SUBJECT_AREA), newVersion);
                packageDBObj.put(STANDARDS_PACKAGE_ID, newStdPackageId);
                break;
            }
        }
    }

    /**
     * returns a set of tagged standards from the root course node (standards that are tagged in course level)
     * and taggs from all level leading to the toc item with cid: @tocCid
     *
     * @param courseCGSObject  - the course that we search in
     * @param tocCid  - cid of the tocItem we want to search
     * @return a set of tagged standards from the root course node
     * @throws IOException
     */
    public Set<TaggedStandards> getTaggedStandardsFromRootToTocItem(CourseCGSObject courseCGSObject, String tocCid) throws IOException {
        Set<TaggedStandards> standards = new HashSet<>();
        List<DBObject> tocs = courseCGSObject.getTocsLeadingToTocItem(tocCid); // getting all tocs leading to the cid
        if (!tocs.isEmpty())
            tocs.add(0, courseCGSObject.getContentData()); // adding the root node as the first node
        for (DBObject toc : tocs) {
            updateStandardIdsFromCgsObject(toc, standards);
        }
        return standards;
    }

    public void updateStandardIdsFromCgsObject(DBObject cgsObject, Set<TaggedStandards> standards) throws IOException {
        BasicDBList packages = (BasicDBList) cgsObject.get(TOC_ITEMS_STANDARDS);
        if (packages == null)
            return;
        Set<TaggedStandards> secondaryStandards = new HashSet<>();
        for (Object singlePackage : packages) {
            DBObject packageDBObj = (DBObject) singlePackage;
            TaggedStandards taggedStandard = objectMapper.readValue(packageDBObj.toString(), TaggedStandards.class);
            secondaryStandards.add(taggedStandard);
        }
        addAllTaggedStandardsToSet(standards, secondaryStandards);
    }

    /**
     * Aggregates taggedStandards of two sets, the first set  @standardsSetToModified will be modified,
     * so that it will contain all pedIds and packageIds from @standardsToBeAdded
     *
     * @param standardsSetToModified
     * @param standardsToBeAdded
     */
    public void addAllTaggedStandardsToSet(Set<TaggedStandards> standardsSetToModified, Set<TaggedStandards> standardsToBeAdded) {
        for (TaggedStandards secondaryStandard : standardsToBeAdded) {
            Boolean stdPackageFound = false;
            for (TaggedStandards baseStandard : standardsSetToModified) {
                if (baseStandard.getStdPackageId().equals(secondaryStandard.getStdPackageId())) { // if the packageId exists add only pedIds that are new
                    for (String pedId : secondaryStandard.getPedagogicalIds())
                        if (!baseStandard.getPedagogicalIds().contains(pedId))
                            baseStandard.getPedagogicalIds().add(pedId);
                    stdPackageFound = true;
                }
            }

            if (!stdPackageFound) {
                standardsSetToModified.add(secondaryStandard); // if the packageId doesn't exist add all standards as a whole
            }
        }
    }

    /**
     * @param stdPackagesAndPedIds - a map where the key is the package id, and the value is a list of pedagogical ids in that package
     * @param standardsFolder      - a folder containing the standard JSON files, where the file name is the standard's id.
     * @return a list of ScormStandardsPackage objects that contains the necessary data for the SCORM manifest.
     * @throws DsException
     * @throws IOException
     * @throws JSONException
     */
    public List<ScormStandardsPackage> getPedagogicalIdsDescriptionFromStandardsFolder(Map<String, Collection<String>> stdPackagesAndPedIds, File standardsFolder) throws DsException, IOException, JSONException {
        List<ScormStandardsPackage> scormStandardsPackages = new ArrayList<>();
        for (Map.Entry<String, Collection<String>> packIdStandards : stdPackagesAndPedIds.entrySet()) {
            String packageId = packIdStandards.getKey();
            File packageFile = new File(standardsFolder, String.format("%s.json", packageId));
            if (!packageFile.exists()) {
                throw new DsException(String.format("Standards json for packageId: %s was not found in: %s", packageId, packageFile.getAbsoluteFile()));
            }
            StandardPackage standardPackage = objectMapper.readValue(packageFile, StandardPackage.class);
            HashMap<String, String> pedagogicalIdsDescriptionForSinglePackageId = getPedagogicalIdsDescriptionForSinglePackageId(packIdStandards.getValue(), standardPackage.getStandards());
            ScormStandardsPackage scormStandardsPackage = new ScormStandardsPackage(packageId, standardPackage.getName(), standardPackage.getPurpose(),
                    standardPackage.getDescription(), pedagogicalIdsDescriptionForSinglePackageId);
            scormStandardsPackages.add(scormStandardsPackage);
        }

        return scormStandardsPackages;
    }

    private HashMap<String, String> getPedagogicalIdsDescriptionForSinglePackageId(Collection<String> pedIds, StandardNode standardsNodeToLookIn) throws DsException, IOException, JSONException {
        HashMap<String, String> pedIdsNames = new HashMap<>();

        for (String pedId : pedIds) {
            StandardNode pedIdNode = findStandardNodeById(standardsNodeToLookIn, pedId);
            if (pedIdNode == null) // didn't find the pedId anywhere
                throw new DsException(String.format("Could not find pedagogical id: %s in standards node.", pedId));
            if (pedIdNode.getName() != null && !pedIdNode.getName().isEmpty()) { //if there is a name - use it, otherwise - use the description
                pedIdsNames.put(pedId, pedIdNode.getName());
            } else {
                pedIdsNames.put(pedId, pedIdNode.getDescription());
            }
        }

        return pedIdsNames;
    }

    /**
     * runs recursively on the standard node's children array. returns the child node where node.pedagogicalId=pedId.
     * if it doesn't exist in the standardsNode passed to the method - return null
     *
     * @param standardsNodeToSearch - a StandardNode object that we try to find the pedId in.
     * @param pedId                 - pedagogicalId that we are looking for
     * @return the child node where node.pedagogicalId=pedId.
     *         if it doesn't exist in the standardsNode passed to the method - return null
     */
    private StandardNode findStandardNodeById(StandardNode standardsNodeToSearch, String pedId) {
        if (standardsNodeToSearch.getPedagogicalId().equals(pedId))   // if this is the standardNode with the pedId, return it
            return standardsNodeToSearch;
        if (standardsNodeToSearch.getChildren() == null || standardsNodeToSearch.getChildren().isEmpty())  // if it is not the one we are looking for, and it has no children - return null;
            return null;
        for (StandardNode innerStandard : standardsNodeToSearch.getChildren()) { //continue the search recursively
            StandardNode innerNode = findStandardNodeById(innerStandard, pedId);
            if (innerNode != null) // if we found a node with the pedId - return it.
                return innerNode;
        }
        // if none of the children matches the pedId, return null
        return null;
    }
}