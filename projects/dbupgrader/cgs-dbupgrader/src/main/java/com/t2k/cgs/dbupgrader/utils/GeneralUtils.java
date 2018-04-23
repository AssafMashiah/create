package com.t2k.cgs.dbupgrader.utils;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by Elad.Avidan on 06/11/2014.
 */
public class GeneralUtils {

    public static String readResourcesAsString(String localPath, Class clazz) throws IOException {
        InputStream resourceAsStream;
        resourceAsStream = null;
        try {
            resourceAsStream = clazz.getClassLoader().getResourceAsStream(localPath);
            java.util.Scanner s = new java.util.Scanner(resourceAsStream).useDelimiter("\\A");

            return s.hasNext() ? s.next() : "";
        } finally {
            resourceAsStream.close();
        }
    }
}
