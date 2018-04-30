package org.t2k.cgs.domain.usecases.packaging.packageResponses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.PackagePhase;
import org.t2k.cgs.domain.usecases.packaging.PackageUtil;
import org.t2k.cgs.domain.usecases.packaging.PublishTarget;
import org.t2k.cgs.domain.usecases.publisher.PublishError;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: elad.avidan
 * Date: 12/11/2014
 * Time: 15:01
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class PackageResponseBase {
    private String packageId;
    private String courseId;
    private String courseName;
    private String lessonName;
    private String courseVersion;
    private PackagePhase packagePhase;
    private PublishTarget publishTarget;
    private Map<String, Integer> componentsProgressInPercent;
    private List<PublishError> errors = new ArrayList<>();

    public PackageResponseBase(CGSPackage cgsPackage) {
        this.packageId = cgsPackage.getPackId();
        this.courseId = cgsPackage.getCourseId();
        this.courseName = cgsPackage.getCourseTitle();
        this.lessonName = PackageUtil.getFirstLessonTitle(cgsPackage);
        this.courseVersion = cgsPackage.getVersion();
        this.packagePhase = cgsPackage.getPackagePhase();
        this.publishTarget = cgsPackage.getPublishTarget();
        this.componentsProgressInPercent = cgsPackage.getComponentsProgressInPercent();
        this.errors = cgsPackage.getErrors();
    }
}
