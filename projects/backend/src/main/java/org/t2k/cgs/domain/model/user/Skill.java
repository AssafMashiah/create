package org.t2k.cgs.domain.model.user;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 14:31
 */
public class Skill {
    private String ref;


    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    @Override
    public String toString() {
        return "Skill{" +
                "ref='" + ref + '\'' +
                '}';
    }
}
