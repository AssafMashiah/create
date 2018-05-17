package org.t2k.cgs.domain.model.course;

/**
 * An object that can be imported from one course to another
 *
 * @param <T> type of the implementor object
 * @author Alex Burdusel on 2016-12-07.
 */
public interface Importable<T> {

    /**
     * Transforms the object so it can be imported into the given course
     *
     * @param sourceCourse      the course from which the object is imported
     * @param destinationCourse the course to witch the object is to be imported
     * @return the transformed object, ready to be imported into the given course
     */
    T transformForImport(Course sourceCourse, Course destinationCourse);
}
