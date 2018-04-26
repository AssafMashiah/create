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


    public static final String ISO8601DATE_FORMAT="yyyy-MM-dd'T'HH:mm:ss.SSSZ";
    private static final SimpleDateFormat simpleDateFormat=new SimpleDateFormat (ISO8601DATE_FORMAT);

    /**
     * Transform Calendar to ISO 8601 string.
     */
    public static String fromDate(final Date date) {
        return simpleDateFormat.format(date);
    }

    /**
     * Transform ISO 8601 string to Calendar.
     */
    public static Date toDate(final String iso8601string)
            throws ParseException {
        if(iso8601string==null || iso8601string.isEmpty()) return null;
        String s = iso8601string.replace("Z", "+0000");
        return simpleDateFormat.parse(s);
    }


   public static void main (String[] s){


       try {
           Date calendar = ISO8601DateFormatter.toDate("2012-11-13T14:08:01.111+0200");
           System.out.println(calendar);


       } catch (ParseException e) {
           e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
       }

   }

}
