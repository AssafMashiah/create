package org.t2k.cgs.domain.usecases.ebooks;

/**
 * @author Alex Burdusel on 2016-06-23.
 */
public interface EBookHandlingRunnable extends Runnable {

    void cancelProcess();
}
