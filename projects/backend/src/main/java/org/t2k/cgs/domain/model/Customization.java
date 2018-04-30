package org.t2k.cgs.domain.model;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 12/05/14
 * Time: 16:54
 */
public class Customization  implements Serializable {
    String cgsHintsShowMode;

    public Customization(String showHintsMode) {
        this.setCgsHintsShowMode(showHintsMode);
    }

    public Customization() {
    }

    public String getCgsHintsShowMode() {
        return cgsHintsShowMode;
    }

    public void setCgsHintsShowMode(String showHintsMode) {
        this.cgsHintsShowMode = showHintsMode;
    }

    public List<ExternalSetting> getExternalSettings() {
        return externalSettings;
    }

    public void setExternalSettings(List<ExternalSetting> externalSettings) {
        this.externalSettings = externalSettings;
    }

    private List<ExternalSetting> externalSettings;

    @Override
    public String toString() {
        return "Customization{" +
                "cgsHintsShowMode=" + cgsHintsShowMode +
                '}';
    }
}
