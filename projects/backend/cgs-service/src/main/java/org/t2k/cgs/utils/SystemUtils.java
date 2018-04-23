package org.t2k.cgs.utils;

import org.springframework.stereotype.Service;

/**
 * Created by moshe.avdiel on 12/3/2015.
 */
@Service
public class SystemUtils {

    /**
     * ---[  Default Constructor  ]---
     */
    public SystemUtils() {
        // Empty
    }

    /**
     * Sleep for the given time in Millis.
     * @param millis
     * @return True, if interrupted before the requested time point reached.
     */
    public boolean sleep(long millis) {
        boolean isInterruped = false;

        Object waiter = new Object();
        synchronized (waiter) {
            try {
                waiter.wait(millis);
            }
            catch (InterruptedException e) {
                isInterruped = true;
            }
        }

        return isInterruped;
    }
}
