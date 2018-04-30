package org.t2k.cgs.domain.model.user;

import java.util.List;

/**
 * Created by thalie.mukhtar on 30/12/2015.
 */
public class PublisherContentLocales {
    private String selected;
    private List<String> options;

    public String getSelected() {
        return selected;
    }

    public void setSelected(String selected) {
        this.selected = selected;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

}
