package org.t2k.cgs.model.packaging;

import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;

import java.util.Iterator;
import java.util.List;

/**
 * Created by Moshe.Avdiel on 5/5/2016.
 */
public class PackageUtil {

    public static TocItemIndicationForScorm getFirstLesson(CGSPackage cgsPackage) {

        // if not found, it's null.
        TocItemIndicationForScorm lesson = null;

        List<TocItemIndicationForScorm> lessons = cgsPackage.getScormSelectedTocItems();
        if (lessons != null) {
            Iterator<TocItemIndicationForScorm> lessonItr = lessons.iterator();
            if (lessonItr.hasNext()) {
                lesson = lessonItr.next();
            }
        }

        return lesson;
    }

    public static String getFirstLessonId(CGSPackage cgsPackage) {
        // if not found, it's null.
        String lessonId = null;
        TocItemIndicationForScorm firstLesson = getFirstLesson(cgsPackage);
        if (firstLesson != null) {
            lessonId = firstLesson.getId();
        }
        return lessonId;
    }

    public static String getFirstLessonTitle(CGSPackage cgsPackage) {
        // if not found, it's null.
        String title = null;

        TocItemIndicationForScorm firstLesson = getFirstLesson(cgsPackage);
        if (firstLesson != null) {
            title = firstLesson.getTitle();
        }

        return title;
    }
}
