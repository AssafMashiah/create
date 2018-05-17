package org.t2k.cgs.domain.usecases.packaging.packageResponses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.PackageUtil;

/**
 * Created with IntelliJ IDEA.
 * User: elad.avidan
 * Date: 03/11/2014
 * Time: 11:36
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class PackageResponseTinyKey extends PackageResponseBase {

    private String tinyKey;
    private String lessonId;
    private String lessonName;
    private String courseName;


    public PackageResponseTinyKey(CGSPackage cgsPackage) {
        super(cgsPackage);
        this.tinyKey = cgsPackage.getTinyUrl();
        this.lessonName = PackageUtil.getFirstLessonTitle(cgsPackage);
        this.lessonId   = PackageUtil.getFirstLessonId(cgsPackage);
        this.courseName = cgsPackage.getCourseTitle();
    }

}
