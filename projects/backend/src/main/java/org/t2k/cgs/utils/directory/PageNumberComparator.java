package org.t2k.cgs.utils.directory;

import java.io.File;
import java.util.Comparator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Moshe.Avdiel on 11/17/2015.
 */
public class PageNumberComparator implements Comparator<File> {

    public int compare(File leftFile, File rightFile) {
        Integer leftNumber = getFileNumber(leftFile);
        Integer rightNumber = getFileNumber(rightFile);

        return leftNumber.compareTo(rightNumber);
    }


    private Integer getFileNumber(File file) {
        Integer pageNumber;

        String name = file.getName();
        Matcher numberMatcher = Pattern.compile("\\d+").matcher(name);
        if (numberMatcher.find()) {
            String numberMatched = numberMatcher.group();
            pageNumber = Integer.parseInt(numberMatched);
        }
        else {
            pageNumber = 0;
        }

        return pageNumber;
    }

}
