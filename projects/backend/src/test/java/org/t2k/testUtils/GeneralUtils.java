package org.t2k.testUtils;

import java.util.Random;

/**
 * Created by Elad.Avidan on 22/09/2014.
 */
public class GeneralUtils {

    public String randomJobId() {
        Random r = new Random();
        int i = r.nextInt(1000);
        return Integer.toString(i);
    }
}
