package org.t2k.cgs.security;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.enums.AccountMode;

import javax.persistence.Id;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 12:29
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Document(collection = "publishers")
public class CGSAccount {

    @Id
    /**
     * generated automatically by mongo, not used in the project as id. accountId as identifier
     */
    protected ObjectId _id;

    private String _class;
    private int accountId;
    private String name;
    private List<Object> customMetadata;
    private List<CustomMetadataPackage> customMetadataPackages;
    private AccountCustomization customization;
    private List<LocaleGradeLevels> gradeLevels;
    private List<LocaleSubjectArea> subjectAreas;
    private List<TTSProvider> ttsProviders;
    private List<LoType> loTypes;
    private List<FileSizeLimit> fileSizeLimits;
    private Skill skills;
    private RelatesTo relatesTo;
    private PublisherContentLocales contentLocales;
    private Object interfaceLocales;
    private Object sequenceExposureDefault;
    private HashMap<String, Object> elementsLimit;
    private AccountMode accountMode;

    public RelatesTo getRelatesTo() {
        return relatesTo;
    }

    public void setRelatesTo(RelatesTo relatesTo) {
        this.relatesTo = relatesTo;
    }

    public String get_class() {
        return _class;
    }

    public void set_class(String _class) {
        this._class = _class;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Object getInterfaceLocales() {
        return interfaceLocales;
    }

    public void setContentLocales(PublisherContentLocales contentLocales) {
        this.contentLocales = contentLocales;
    }

    public PublisherContentLocales getContentLocales() {
        return contentLocales;
    }

    public void setInterfaceLocales(Object interfaceLocales) {
        this.interfaceLocales = interfaceLocales;
    }

    public void setCustomization(AccountCustomization customization) {
        this.customization = customization;
    }

    public AccountCustomization getAccountCustomization() {
        return customization;
    }

    public List<Object> getCustomMetadata() {
        return customMetadata;
    }

    public void setCustomMetadata(ArrayList<Object> customMetadata) {
        this.customMetadata = customMetadata;
    }

    public List<LocaleGradeLevels> getGradeLevels() {
        return gradeLevels;
    }

    public void setGradeLevels(ArrayList<LocaleGradeLevels> gradeLevels) {
        this.gradeLevels = gradeLevels;
    }

    public List<LocaleSubjectArea> getSubjectAreas() {
        return subjectAreas;
    }

    public void setSubjectAreas(ArrayList<LocaleSubjectArea> subjectArea) {
        this.subjectAreas = subjectArea;
    }

    public List<TTSProvider> getTtsProviders() {
        return ttsProviders;
    }

    public void setTtsProviders(ArrayList<TTSProvider> ttsProviders) {
        this.ttsProviders = ttsProviders;
    }

    public List<LoType> getLoTypes() {
        return loTypes;
    }

    public void setLoTypes(ArrayList<LoType> loTypes) {
        this.loTypes = loTypes;
    }

    public List<FileSizeLimit> getFileSizeLimits() {
        return fileSizeLimits;
    }

    public void setFileSizeLimits(ArrayList<FileSizeLimit> fileSizeLimits) {
        this.fileSizeLimits = fileSizeLimits;
    }

    public Skill getSkills() {
        return skills;
    }

    public void setSkills(Skill skills) {
        this.skills = skills;
    }

    public int getAccountId() {
        return accountId;
    }

    public void setAccountId(int accountId) {
        this.accountId = accountId;
    }

    public List<CustomMetadataPackage> getCustomMetadataPackages() {
        return customMetadataPackages;
    }

    public void setCustomMetadataPackages(List<CustomMetadataPackage> customMetadataPackages) {
        this.customMetadataPackages = customMetadataPackages;
    }

    public Object getSequenceExposureDefault() {
        return sequenceExposureDefault;
    }

    public void setSequenceExposureDefault(Object sequenceExposureDefault) {
        this.sequenceExposureDefault = sequenceExposureDefault;
    }

    public HashMap<String, Object> getElementsLimit() {
        return elementsLimit;
    }

    public AccountMode getAccountMode() {
        return accountMode;
    }

    public void setAccountMode(AccountMode accountMode) {
        this.accountMode = accountMode;
    }

    @Override
    public String toString() {
        return "CGSAccount{" +
                "_class='" + _class + '\'' +
                ", accountId=" + accountId +
                ", name='" + name + '\'' +
                ", customMetadata=" + customMetadata +
                ", customMetadataPackages=" + customMetadataPackages +
                ", customization=" + customization +
                ", gradeLevels=" + gradeLevels +
                ", subjectAreas=" + subjectAreas +
                ", ttsProviders=" + ttsProviders +
                ", loTypes=" + loTypes +
                ", fileSizeLimits=" + fileSizeLimits +
                ", skills=" + skills +
                ", relatesTo=" + relatesTo +
                ", contentLocales=" + contentLocales +
                ", interfaceLocales=" + interfaceLocales +
                ", sequenceExposureDefault=" + sequenceExposureDefault +
                ", elementsLimit=" + elementsLimit +
                '}';
    }
}