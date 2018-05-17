package org.t2k.cgs.domain.model.user;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 07/07/14
 * Time: 14:12
 */
public class LocaleSubjectArea {
    private String locale;
    private List<SubjectArea> value;


    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public List<SubjectArea> getValue() {
        return value;
    }

    public void setValue(List<SubjectArea> value) {
        this.value = value;
    }
}
