package org.t2k.cgs.tocItem.tocimport;

import org.t2k.cgs.model.job.JobComponent;

/**
 * @author Alex Burdusel on 2016-11-28.
 */
public enum ImportTocItemComponent implements JobComponent {

    TRANSFORM_TOC_ITEMS,
    COPY_ASSETS;

    @Override
    public String getValue() {
        return toString();
    }
}
