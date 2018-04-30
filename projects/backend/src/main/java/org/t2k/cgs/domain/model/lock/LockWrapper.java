package org.t2k.cgs.domain.model.lock;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 12/2/12
 * Time: 12:12 PM
 * To change this template use File | Settings | File Templates.
 */
public class LockWrapper {

    private Lock lock;
    private String courseName;
    private String lessonName;

    private String entityName;

    public LockWrapper(Lock lock , String courseName , String lessonName){
        this.lock = lock;
        this.entityName = lock.getEntityName();
        this.courseName=courseName;
        this.lessonName=lessonName;
//        EntityType entityType = lock.getEntityType();
//        if (entityType.equals(EntityType.COURSE)) {
//            this.courseName = lock.getEntityName();
//            this.lessonName = null;
//        } else if (entityType.equals(EntityType.LESSON)) {
//            this.courseName = null;
//            this.lessonName = lock.getEntityName();
//        } else {
//            this.courseName = null;
//            this.lessonName = null;
//        }
    }

    public String getCourseName() {
        return courseName;
    }

    public String getLessonName() {
        return lessonName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public void setLessonName(String lessonName) {
        this.lessonName = lessonName;
    }

    public String getEntityId() {
           return lock.getEntityId();
    }

   public String getEntityType() {
       return lock.getEntityType().name();
   }

   public String getUserName() {
       return lock.getUserName();
   }

   public String getUserEmail() {
       return lock.getUserEmail();
   }

    public long getAquireDate() {
        return lock.getLockDate().getTime();
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

}
