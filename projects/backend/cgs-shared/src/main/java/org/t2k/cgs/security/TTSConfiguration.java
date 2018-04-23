package org.t2k.cgs.security;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 17:34
 */
public class TTSConfiguration {
    private List<Object> admin;

    private List<Object> course;

    private Object api;

    private List<Object> getAdmin() {
        return admin;
    }

    private void setAdmin(ArrayList<Object> admin) {
        this.admin = admin;
    }

    private List<Object> getCourse() {
        return course;
    }

    private void setCourse(ArrayList<Object> course) {
        this.course = course;
    }

    private Object getApi() {
        return api;
    }

    private void setApi(Object api) {
        this.api = api;
    }

    @Override
    public String toString() {
        return "TTSConfiguration{" +
                "admin=" + admin +
                ", course=" + course +
                ", api=" + api +
                '}';
    }
}
