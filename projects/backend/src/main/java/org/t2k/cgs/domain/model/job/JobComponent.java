package org.t2k.cgs.domain.model.job;

/**
 * Object used by a {@link Job} to track its (job's) progress
 *
 * @author Alex Burdusel on 2016-09-06.
 */
public interface JobComponent {

    /**
     * @return Value/name of the component as a {@link String}
     */
    String getValue();
}
