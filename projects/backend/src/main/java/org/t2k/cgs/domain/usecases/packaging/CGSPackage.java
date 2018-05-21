package org.t2k.cgs.domain.usecases.packaging;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.t2k.common.utils.PublishModeEnum;
import org.apache.log4j.Logger;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.utils.JsonDateSerializer;

import java.io.Serializable;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 10:35
 */
@Document
@JsonAutoDetect
public class CGSPackage implements Serializable {

    @Transient
    private Logger logger = Logger.getLogger(CGSPackage.class);

    /* Package related fields */
    @Id
    private String packId;
    private String version;
    private Date packStartDate;
    private Date packEndDate;
    private String packageOutputLocation;
    private int numberOfResourcesToPack;
    private int numberOfResourcesDone;
    private List<PublishError> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private Map<String, Integer> componentsProgressInPercent = new HashMap<>();
    private short pendingPlace;
    private PackagePhase packagePhase;
    private String zippedFileToDownloadLocation;
    private PublishTarget publishTarget;
    private CatalogName catalogName;
    private String publisherName;
    private String tinyUrl;

    @JsonIgnore
    private List<String> scormExcludeTocItemsIds = new ArrayList<>();
    @JsonIgnore
    private List<TocItemIndicationForScorm> scormSelectedTocItems = new ArrayList<>();
    @JsonIgnore
    private Boolean includeAncestorsStandards = false;

    /* Course related fields */
    private String newVersion_prod;
    private String newVersion_preProd;
    private String courseId;
    private String courseCId;
    private String courseTitle;
    private int publisherId;
    private String userName;

    /* User related fields */
    private PackagingLocalContext localResourcesLocation;
    private String cmsPublisherHomeLocation;
    private String hostName;
    private boolean isShow = true;

    @JsonIgnore
    private List<String> locales;

    //Course structure indicator -
    //an MD5 value consists on the course tree structure.(from lessons to sequences)
    private String csi;
    private String description;
    private String releaseNote;
    private PublishModeEnum publishModeEnum;
    private String eBooksLocation;

    public static final String VERSION_TOKEN = "@VERSION@";

    public CGSPackage() {
    }

    public CGSPackage(String courseId, String courseCId, int publisherId, String username, String publisherName,
                      String cgsCourseVersion, String courseTitle, List<String> locales) {
        this.courseId = courseId;
        this.courseCId = courseCId;
        this.publisherId = publisherId;
        this.version = cgsCourseVersion;
        this.courseTitle = courseTitle;
        this.packStartDate = new Date();
        this.userName = username;
        this.publisherName = publisherName;
        this.packId = generateId(courseCId, cgsCourseVersion, courseTitle);
        this.locales = locales;
        try {
            this.hostName = InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            logger.warn("Cannot find host.", e);
        }
    }

    public String getTinyUrl() {
        return tinyUrl;
    }

    public void setTinyUrl(String tinyUrl) {
        this.tinyUrl = tinyUrl;
    }

    public void setScormExcludeTocItemsIds(List<String> scormExcludeTocItemsIds) {
        this.scormExcludeTocItemsIds = scormExcludeTocItemsIds;
    }

    public List<String> getScormExcludeTocItemsIds() {
        return scormExcludeTocItemsIds;
    }

    public void setScormSelectedTocItems(List<TocItemIndicationForScorm> scormSelectedTocItems) {
        this.scormSelectedTocItems = scormSelectedTocItems;
    }

    public void addHiddenTocItemsToScormSelectedTocItems(List<String> hiddenTocItemsIds) {
        List<TocItemIndicationForScorm> hiddenTocItems = new ArrayList<>();
        for (String hiddenTocItemsId : hiddenTocItemsIds) {
            hiddenTocItems.add(new TocItemIndicationForScorm(hiddenTocItemsId, null, true));
        }

        scormSelectedTocItems = new ArrayList<>(scormSelectedTocItems); // this line was added here to prevent an UnsupportedOperationException
        scormSelectedTocItems.addAll(hiddenTocItems);
    }

    public List<TocItemIndicationForScorm> getScormSelectedTocItems() {
        return scormSelectedTocItems;
    }

    public List<String> getScormSelectedTocItemsIds() {
        List<String> scormSelectedTocItemsIds = new ArrayList<>();
        for (TocItemIndicationForScorm itemHiddenIndication : this.scormSelectedTocItems) {
            scormSelectedTocItemsIds.add(itemHiddenIndication.getId());
        }

        return scormSelectedTocItemsIds;
    }

    public List<String> getLocales() {
        return this.locales;
    }

    public void setLocales(List<String> locales) {
        this.locales = locales;
    }

    public void setIncludeAncestorsStandards(Boolean includeAncestorsStandards) {
        this.includeAncestorsStandards = includeAncestorsStandards;
    }

    public Boolean getIncludeAncestorsStandards() {
        return includeAncestorsStandards;
    }

    public boolean getIsShow() {
        return this.isShow;
    }

    public void setIsShow(boolean isShow) {
        this.isShow = isShow;
    }

    public Map<String, Integer> getComponentsProgressInPercent() {
        return this.componentsProgressInPercent;
    }

    public void setComponentsProgressInPercent(PackageStep packageStep, int percentage) {
        this.componentsProgressInPercent.put(packageStep.getName(), percentage);
    }

    @JsonProperty("packageId")
    public String getPackId() {
        return packId;
    }

    public void setPackId(String packId) {
        this.packId = packId;
    }

    public void setCourseTitle(String title) {
        this.courseTitle = title;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public PackagePhase getPackagePhase() {
        return this.packagePhase;
    }

    public void setPackagePhase(PackagePhase packagePhase) {
        this.packagePhase = packagePhase;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @JsonIgnore
    public String getCmsPublisherHomeLocation() {
        return cmsPublisherHomeLocation;
    }

    public void setCmsPublisherHomeLocation(String cmsPublisherHomeLocation) {
        this.cmsPublisherHomeLocation = cmsPublisherHomeLocation;
    }

    @JsonIgnore
    public PackagingLocalContext getLocalResourcesLocation() {
        return localResourcesLocation;
    }

    public void setLocalResourcesLocation(PackagingLocalContext localResourcesLocation) {
        this.localResourcesLocation = localResourcesLocation;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    @JsonSerialize(using = JsonDateSerializer.class)
    public Date getPackStartDate() {
        return packStartDate;
    }

    public void setPackStartDate(Date packStartDate) {
        this.packStartDate = packStartDate;
    }

    @JsonSerialize(using = JsonDateSerializer.class)
    public Date getPackEndDate() {
        return packEndDate;
    }

    public void setPackEndDate(Date packEndDate) {
        this.packEndDate = packEndDate;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public List<PublishError> getErrors() {
        return errors;
    }

    public void setErrors(List<PublishError> errors) {
        this.errors = errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public void addError(PublishError error) {
        getErrors().add(error);
    }

    public void addWarning(String warnMsg) {
        getWarnings().add(warnMsg);
    }

    public void addErrors(List<PublishError> error) {
        getErrors().addAll(error);
    }

    public void addWarnings(List<String> warnMsgs) {
        getWarnings().addAll(warnMsgs);
    }

    public String getPackageOutputLocation() {
        return packageOutputLocation;
    }

    public void setPackageOutputLocation(String packageOutputLocation) {
        this.packageOutputLocation = packageOutputLocation;
    }

    public String getEBooksLocation() {
        return eBooksLocation;
    }

    public void setEBooksLocation(String eBooksLocation) {
        this.eBooksLocation = eBooksLocation;
    }

    @JsonIgnore
    public int getNumberOfResourcesToPack() {
        return numberOfResourcesToPack;
    }

    public void setNumberOfResourcesToPack(int numberOfResourcesToPack) {
        this.numberOfResourcesToPack = numberOfResourcesToPack;
    }

    @JsonIgnore
    public int getNumberOfResourcesDone() {
        return numberOfResourcesDone;
    }

    public void setNumberOfResourcesDone(int numberOfResourcesDone) {
        this.numberOfResourcesDone = numberOfResourcesDone;
    }

    private String generateId(String courseCId, String version, String courseTitle) {
        if (courseTitle.length() > 30) {
            courseTitle = courseTitle.substring(0, 30);
        }
        courseTitle = courseTitle.replaceAll("\\W+", "_");
        return String.format("%s_%s_ver_%s_%s", courseTitle, courseCId, version,
                LocalDateTime.now().toString().replaceAll(":", "-"));
    }

    public short getPendingPlace() {
        return pendingPlace;
    }

    public void setPendingPlace(short pendingPlace) {
        this.pendingPlace = pendingPlace;
    }

    public void setCsi(String courseStructureIndicator) {
        this.csi = courseStructureIndicator;
    }

    public String getCsi() {
        return this.csi;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReleaseNote() {
        return releaseNote;
    }

    public void setReleaseNote(String releaseNote) {
        this.releaseNote = releaseNote;
    }

    public PublishModeEnum getPublishModeEnum() {
        return publishModeEnum;
    }

    public void setPublishModeEnum(PublishModeEnum publishModeEnum) {
        this.publishModeEnum = publishModeEnum;
    }

    public String getNewVersion_prod() {
        return newVersion_prod;
    }

    public void setNewVersion_prod(String newVersion_prod) {
        this.newVersion_prod = newVersion_prod;
    }

    public String getNewVersion_preProd() {
        return newVersion_preProd;
    }

    public void setNewVersion_preProd(String newVersion_preProd) {
        this.newVersion_preProd = newVersion_preProd;
    }

    public String getCourseCId() {
        return courseCId;
    }

    public void setCourseCId(String courseCId) {
        this.courseCId = courseCId;
    }

    @JsonIgnore
    public void setPublishTarget(PublishTarget publishTarget) {
        this.publishTarget = publishTarget;
    }

    @JsonIgnore
    public PublishTarget getPublishTarget() {
        return publishTarget;
    }

    public String getZippedFileToDownloadLocation() {
        return zippedFileToDownloadLocation;
    }

    public void setZippedFileToDownloadLocation(String zippedFileToDownloadLocation) {
        this.zippedFileToDownloadLocation = zippedFileToDownloadLocation;
    }

    public CatalogName getCatalogName() {
        return catalogName;
    }

    public void setCatalogName(CatalogName catalogName) {
        this.catalogName = catalogName;
    }

    public String getPublisherName() {
        return publisherName;
    }

    @Override
    public String toString() {
        return "CGSPackage{" +
                "packId='" + packId + '\'' +
                ", version='" + version + '\'' +
                ", packStartDate=" + packStartDate +
                ", packEndDate=" + packEndDate +
                ", packageOutputLocation='" + packageOutputLocation + '\'' +
                ", numberOfResourcesToPack=" + numberOfResourcesToPack +
                ", numberOfResourcesDone=" + numberOfResourcesDone +
                ", errors=" + errors +
                ", warnings=" + warnings +
                ", componentsProgressInPercent=" + componentsProgressInPercent +
                ", pendingPlace=" + pendingPlace +
                ", packagePhase=" + packagePhase +
                ", zippedFileToDownloadLocation='" + zippedFileToDownloadLocation + '\'' +
                ", publishTarget=" + publishTarget +
                ", scormExcludeTocItemsIds=" + scormExcludeTocItemsIds +
                ", scormSelectedTocItems=" + scormSelectedTocItems +
                ", includeAncestorsStandards=" + includeAncestorsStandards +
                ", newVersion_prod='" + newVersion_prod + '\'' +
                ", newVersion_preProd='" + newVersion_preProd + '\'' +
                ", courseId='" + courseId + '\'' +
                ", courseCId='" + courseCId + '\'' +
                ", courseTitle='" + courseTitle + '\'' +
                ", publisherId=" + publisherId +
                ", userName='" + userName + '\'' +
                ", localResourcesLocation=" + localResourcesLocation +
                ", localResourcesLocationStrinified=" + localResourcesLocation +
                ", cmsPublisherHomeLocation='" + cmsPublisherHomeLocation + '\'' +
                ", hostName='" + hostName + '\'' +
                ", isShow=" + isShow +
                ", locales=" + locales +
                ", csi='" + csi + '\'' +
                ", description='" + description + '\'' +
                ", releaseNote='" + releaseNote + '\'' +
                ", publishModeEnum=" + publishModeEnum +
                ", publisherName=" + publisherName +
                '}';
    }

}