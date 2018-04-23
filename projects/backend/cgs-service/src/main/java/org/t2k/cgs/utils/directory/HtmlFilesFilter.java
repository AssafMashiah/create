package org.t2k.cgs.utils.directory;

import java.io.File;
import java.io.FileFilter;

/**
 * Created by Moshe.Avdiel on 11/17/2015.
 */
public class HtmlFilesFilter implements FileFilter {

    @Override
    public boolean accept(File pathname) {
        if (pathname.isDirectory()) {
            return false;
        }

        String upCaseName = pathname.getName().toUpperCase();

        if (upCaseName.endsWith(".HTML") || upCaseName.endsWith(".HTM")) {
            return true;
        }

        return false;
    }

}
