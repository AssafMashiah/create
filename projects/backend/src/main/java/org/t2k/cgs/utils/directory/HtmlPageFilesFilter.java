package org.t2k.cgs.utils.directory;

import java.io.File;
import java.io.FileFilter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Moshe.Avdiel on 11/16/2015.
 */
public class HtmlPageFilesFilter implements FileFilter {

    @Override
    public boolean accept(File pathname) {
        // Directory
        if (pathname.isDirectory()) {
            return false;
        }

        // Not HTML
        String upCaseName = pathname.getName().toUpperCase();
        if ( ! (upCaseName.endsWith("HTML") || upCaseName.endsWith("HTM")) ) {
            return false;
        }

        // Number
        return getFileNumber(pathname) > 0;

    }


    private Integer getFileNumber(File file) {
        Integer pageNumber;

        String name = file.getName();
        Matcher numberMatcher = Pattern.compile("\\d+").matcher(name);
        if (numberMatcher.find()) {
            String numberMatched = numberMatcher.group();
            pageNumber = Integer.parseInt(numberMatched);
        } else {
            pageNumber = 0;
        }

        return pageNumber;
    }

}
