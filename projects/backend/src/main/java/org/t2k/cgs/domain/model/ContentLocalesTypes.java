package org.t2k.cgs.domain.model;

/**
 * Created by thalie.mukhtar on 4/1/2016.
 */
public enum ContentLocalesTypes {

    EN_US("en_US"),
    FR_FR("fr_FR"),
    PT_BR("pt_BR"),
    IW_IL("iw_IL"),
    AR_IL("ar_IL"),
    NL_NL("nl_NL"),
    JA_JP("ja_JP"),
    ZN_CN("zn_CN"),
    ZN_HK("zn_HK"),
    KO_KR("ko_KR");

    public static ContentLocalesTypes forName(String name) {
        for (ContentLocalesTypes type : ContentLocalesTypes.values()) {
            if (type.getName().equalsIgnoreCase(name)) {
                return type;
            }
        }
        return null;
    }

    private String name;

    ContentLocalesTypes(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
