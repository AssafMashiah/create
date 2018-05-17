package org.t2k.cgs.domain.model.user;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 07/07/14
 * Time: 11:17
 */
public class LocaleGradeLevels {

    private List<GradeLevel> value;

    private String locale;

    public List<GradeLevel> getValue() {
        return value;
    }

    public void setValue(List<GradeLevel> value) {
        this.value = value;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }
}
