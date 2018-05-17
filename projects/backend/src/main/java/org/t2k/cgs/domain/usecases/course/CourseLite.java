package org.t2k.cgs.domain.usecases.course;

import org.t2k.cgs.domain.model.CGSData;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.course.CourseToc;

import java.util.Date;

/**
 * A lite version of the course to be used for fast retrieving from repository
 *
 * @author Alex Burdusel on 2016-10-13.
 */
public class CourseLite {

    private CGSData cgsData;
    private CourseContentDataLite contentData;

    public Date getCreationDate() {
        return getHeader().getCreationDate();
    }

    public Date getLastModified() {
        return getHeader().getLastModified();
    }

    public int getPublisherId() {
        return cgsData.getPublisherId();
    }

    public String getCourseId() {
        return contentData.courseId;
    }

    public Header getHeader() {
        return contentData.header;
    }

    public CourseToc getToc() {
        return contentData.toc;
    }

    private static class CourseContentDataLite {
        private String courseId;
        private Header header;
        private CourseToc toc;
    }
}
