package org.t2k.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/11/12
 * Time: 09:09
 */
public class ISO8601DateFormatter {

    private static final String ISO8601DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";
    private static final SimpleDateFormat simpleDateFormat = new SimpleDateFormat(ISO8601DATE_FORMAT);

    /**
     * Transform Calendar to ISO 8601 string.
     */
    public static String fromDate(final Date date) {
        return simpleDateFormat.format(date);
    }

    /**
     * Transform ISO 8601 string to Calendar.
     */
    public static Date toDate(final String iso8601string) throws ParseException {
        if (iso8601string == null || iso8601string.isEmpty()) return null;
        String s = iso8601string.replace("Z", "+0000");
        return simpleDateFormat.parse(s);
    }
}
