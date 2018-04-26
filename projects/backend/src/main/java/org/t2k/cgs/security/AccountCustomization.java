package org.t2k.cgs.security;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.t2k.cgs.customIcons.PublisherCustomIconsPack;
import org.t2k.cgs.enums.EBookConversionServiceTypes;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 23/06/14
 * Time: 17:12
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class AccountCustomization {

    private boolean enableCoachMarks;

    private boolean enableHints;

    private boolean enableHiddenLessons;

    private boolean enableLivePage;

    private boolean enablePdf2t2k;

    private boolean enableQuiz;

    private boolean enableFullSpellChecker;

    private boolean isSecured;

    private PublishSettings publishSettings;

    private LogLevel logLevel;

    private boolean enablePdfConversionLibrarySelection;

    private EBookConversionServiceTypes pdfConversionLibrary;

    private boolean enableMediaEncoding;

    private boolean enableDemoPublishView;

    private boolean enableLearningObjects;

    private boolean enableStandards;
    private boolean enableReferences;
    private boolean enableCourseMiscSettings;
    private boolean enableReviewTab;
    private boolean enableTextToSpeach;
    private boolean enableNarrationAdditionalLanguages;
    private boolean enableAssetOrdering;
    private boolean enableDiffLevels;
    private boolean enableAssessment;
    private boolean enableBookAlive;
    private boolean enableBornDigital;
    private boolean enablePlacementAssessment;
    private boolean enableIndependentAssessment;
    private boolean enableEpubConversion;
    private int ePubConversionConfDelay;
    private Set<PublisherCustomIconsPack> customIconsPacks = new HashSet<>();
    private boolean enableSampleCourse;

    public boolean isEnableStandards() {
        return enableStandards;
    }

    public void setEnableStandards(boolean enableStandards) {
        this.enableStandards = enableStandards;
    }

    public boolean isEnableReferences() {
        return enableReferences;
    }

    public void setEnableReferences(boolean enableReferences) {
        this.enableReferences = enableReferences;
    }

    public boolean isEnableCourseMiscSettings() {
        return enableCourseMiscSettings;
    }

    public void setEnableCourseMiscSettings(boolean enableCourseMiscSettings) {
        this.enableCourseMiscSettings = enableCourseMiscSettings;
    }

    public boolean isEnableReviewTab() {
        return enableReviewTab;
    }

    public void setEnableReviewTab(boolean enableReviewTab) {
        this.enableReviewTab = enableReviewTab;
    }

    public boolean isEnableTextToSpeach() {
        return enableTextToSpeach;
    }

    public void setEnableTextToSpeach(boolean enableTextToSpeach) {
        this.enableTextToSpeach = enableTextToSpeach;
    }

    public boolean isEnableNarrationAdditionalLanguages() {
        return enableNarrationAdditionalLanguages;
    }

    public void setEnableNarrationAdditionalLanguages(boolean enableNarrationAdditionalLanguages) {
        this.enableNarrationAdditionalLanguages = enableNarrationAdditionalLanguages;
    }

    public boolean isEnableAssetOrdering() {
        return enableAssetOrdering;
    }

    public void setEnableAssetOrdering(boolean enableAssetOrdering) {
        this.enableAssetOrdering = enableAssetOrdering;
    }

    public boolean isEnableDiffLevels() {
        return enableDiffLevels;
    }

    public void setEnableDiffLevels(boolean enableDiffLevels) {
        this.enableDiffLevels = enableDiffLevels;
    }

    public void setSecured(boolean secured) {
        isSecured = secured;
    }

    public boolean isEnableCoachMarks() {
        return enableCoachMarks;
    }

    public void setEnableCoachMarks(boolean enableCoachMarks) {
        this.enableCoachMarks = enableCoachMarks;
    }

    public boolean isEnableHints() {
        return enableHints;
    }

    public void setEnableHints(boolean enableHints) {
        this.enableHints = enableHints;
    }

    public boolean isEnableHiddenLessons() {
        return enableHiddenLessons;
    }

    public void setEnableHiddenLessons(boolean enableHiddenLessons) {
        this.enableHiddenLessons = enableHiddenLessons;
    }

    public boolean isEnableLivePage() {
        return enableLivePage;
    }

    public void setEnableLivePage(boolean enableLivePage) {
        this.enableLivePage = enableLivePage;
    }

    public boolean isEnablePdf2t2k() {
        return enablePdf2t2k;
    }

    public void setEnablePdf2t2k(boolean enablePdf2t2k) {
        this.enablePdf2t2k = enablePdf2t2k;
    }

    public boolean isEnableQuiz() {
        return enableQuiz;
    }

    public void setEnableQuiz(boolean enableQuiz) {
        this.enableQuiz = enableQuiz;
    }

    public boolean isEnableFullSpellChecker() {
        return enableFullSpellChecker;
    }

    public LogLevel getLogLevel() {
        return this.logLevel;
    }

    public void setLogLevel(LogLevel logLevel) {
        this.logLevel = logLevel;
    }

    public void setEnableFullSpellChecker(boolean enableFullSpellChecker) {
        this.enableFullSpellChecker = enableFullSpellChecker;
    }

    public boolean isSecured() {
        return isSecured;
    }

    public void setIsSecured(boolean secured) {
        isSecured = secured;
    }

    public PublishSettings getPublishSettings() {
        return publishSettings;
    }

    public void setPublishSettings(PublishSettings publishSettings) {
        this.publishSettings = publishSettings;
    }

    public boolean isEnableMediaEncoding() {
        return enableMediaEncoding;
    }

    public void setEnableMediaEncoding(boolean enableMediaEncoding) {
        this.enableMediaEncoding = enableMediaEncoding;
    }

    public boolean isEnablePdfConversionLibrarySelection() {
        return enablePdfConversionLibrarySelection;
    }

    public void setEnablePdfConversionLibrarySelection(boolean enablePdfConversionLibrarySelection) {
        this.enablePdfConversionLibrarySelection = enablePdfConversionLibrarySelection;
    }

    public EBookConversionServiceTypes getPdfConversionLibrary() {
        return pdfConversionLibrary;
    }

    public void setPdfConversionLibrary(EBookConversionServiceTypes pdfConversionLibrary) {
        this.pdfConversionLibrary = pdfConversionLibrary;
    }

    public boolean isEnableDemoPublishView() {
        return enableDemoPublishView;
    }

    public void setEnableDemoPublishView(boolean enableDemoPublishView) {
        this.enableDemoPublishView = enableDemoPublishView;
    }

    public boolean isEnableLearningObjects() {
        return enableLearningObjects;
    }

    public void setEnableLearningObjects(boolean enableLearningObjects) {
        this.enableLearningObjects = enableLearningObjects;
    }

    public boolean isEnableAssessment() {
        return enableAssessment;
    }

    public void setEnableAssessment(boolean enableAssessment) {
        this.enableAssessment = enableAssessment;
    }

    public boolean isEnableBookAlive() {
        return enableBookAlive;
    }

    public void setEnableBookAlive(boolean enableBookAlive) {
        this.enableBookAlive = enableBookAlive;
    }

    public boolean isEnableBornDigital() {
        return enableBornDigital;
    }

    public void setEnableBornDigital(boolean enableBornDigital) {
        this.enableBornDigital = enableBornDigital;
    }

    public boolean isEnableEpubConversion() {
        return enableEpubConversion;
    }

    public void setEnableEpubConversion(boolean enableEpubConversion) {
        this.enableEpubConversion = enableEpubConversion;
    }

    public int getEPubConversionConfDelay() {
        return ePubConversionConfDelay;
    }

    public void setEPubConversionConfDelay(int ePubConversionConfDelay) {
        this.ePubConversionConfDelay = ePubConversionConfDelay;
    }

    public Set<PublisherCustomIconsPack> getCustomIconsPacks() {
        return customIconsPacks;
    }

    public boolean isEnableIndependentAssessment() {
        return enableIndependentAssessment;
    }

    public void setEnableIndependentAssessment(boolean enableIndependentAssessment) {
        this.enableIndependentAssessment = enableIndependentAssessment;
    }

    public boolean isEnablePlacementAssessment() {
        return enablePlacementAssessment;
    }

    public boolean isEnableSampleCourse() {
        return enableSampleCourse;
    }

    public void setEnableSampleCourse(boolean enableSampleCourse) {
        this.enableSampleCourse = enableSampleCourse;
    }

    /**
     * Adds a {@link PublisherCustomIconsPack}. This will override existing {@link PublisherCustomIconsPack}s of the same type the account
     * already has
     */
    public void addCustomIconsPack(PublisherCustomIconsPack customIconsPack) {
        for (Iterator<PublisherCustomIconsPack> iterator = this.customIconsPacks.iterator(); iterator.hasNext(); ) {
            PublisherCustomIconsPack iconsPack = iterator.next();
            if (iconsPack.equals(customIconsPack)) {
                iterator.remove();
            }
        }
        this.customIconsPacks.add(customIconsPack);
    }
}
