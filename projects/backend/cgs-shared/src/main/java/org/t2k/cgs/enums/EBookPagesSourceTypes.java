package org.t2k.cgs.enums;

/**
 * Created by Moshe.Avdiel on 1/20/2016.
 */
public enum EBookPagesSourceTypes {
    JOUVE {
        @Override
        public String pagesSource() {
            return "JOUVE";
        }
    };

    public abstract String pagesSource();

}
