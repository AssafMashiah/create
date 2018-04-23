package org.t2k.cgs.model.utils;

import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 09/12/12
 * Time: 14:36
 */
public class ContentJsonUtils {



    public static String createContentDataJsonArrayForCourse(final List<CourseCGSObject> contentItems) {
        StringBuffer stringBuffer = new StringBuffer("[");
        for (int i = 0; i < contentItems.size(); i++) {
            stringBuffer.append(contentItems.get(i).serializeContentData());
            if (i + 1 < contentItems.size()) {
                stringBuffer.append(",");
            }
        }
        stringBuffer.append("]");
        return stringBuffer.toString();
    }



    public static String createContentDataJsonArrayForLesson(final List<TocItemCGSObject> contentItems) {
        StringBuffer stringBuffer = new StringBuffer("[");
        for (int i = 0; i < contentItems.size(); i++) {
            stringBuffer.append(contentItems.get(i).serializeContentData());
            if (i + 1 < contentItems.size()) {
                stringBuffer.append(",");
            }
        }
        stringBuffer.append("]");
        return stringBuffer.toString();
    }

}
