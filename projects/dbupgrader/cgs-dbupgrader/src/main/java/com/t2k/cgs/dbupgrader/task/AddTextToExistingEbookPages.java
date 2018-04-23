package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Required;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: roee.kachila
 * Date: 7/2/16
 * Time: 11:58
 */
public class AddTextToExistingEbookPages extends CommonTask {
    private static Logger logger = Logger.getLogger(AddTextToExistingEbookPages.class);

    private static final String EBOOK_ID = "eBookId";
    private static final String TEXT_KEY = "text";

    private final static String STRUCTURE_ATTR = "structure";
    private final static String PAGES_ATTR = "pages";
    private final static String PAGE_ID_ATTR = "_id";
    private final static String PUBLISHER_ID_ATTR = "publisherId";
    private final static String HREF_ATTR = "href";

    private MigrationDao migrationDao;
    private Configuration configuration;


    @Override
    protected void executeUpInternal() throws Exception {
        fixEbooks();
    }

    public void fixEbooks() {
        // iterate the eBooks, find pages which may be an old eBook (their pages have empty text) and try to reExtract words using JSoup
        List<DBObject> eBooks = migrationDao.getAllEbooks();
        String cmsHome = configuration.getProperty("cmsHome");
        logger.debug("cmsHome is: " + cmsHome);
        // count the number of pages and eBooks that we fixed
        int amountOfFixedPages = 0;
        int skippedPages = 0;
        HashSet amountOfFixedEbooks = new HashSet();

        // iterate eBook
        if (eBooks != null && eBooks.size() > 0) {
            for (DBObject eBookObject : eBooks) {
                DBObject structure = (DBObject) eBookObject.get(STRUCTURE_ATTR);
                // in case the eBook doesn't have pages --> skip the eBook
                if (!structure.containsField(PAGES_ATTR) || ((BasicDBList) structure.get(PAGES_ATTR)).size() == 0) {
                    logger.debug("Ebook " + eBookObject.get(EBOOK_ID) + " has no pages");
                    continue;
                }

                // get the eBook prefix path
                String publisherId = Integer.toString((int) eBookObject.get(PUBLISHER_ID_ATTR));

                String prefixPath = cmsHome + "/publishers/" + publisherId + "/";

                // iterate eBook pages
                BasicDBList pages = (BasicDBList) structure.get(PAGES_ATTR);
                for (Object page : pages) {
                    DBObject pageObject = (DBObject) page;
                    //  in cases the page doesn't have 'text' attribute, text is equal to "" or NULL, try to extract text again (maybe the course was made before we added the JSoup)
//                    if ((!pageObject.containsField(TEXT_KEY)) || (pageObject.get(TEXT_KEY) == null) || (pageObject.get(TEXT_KEY).equals(""))) {

                        // get the eBook page path for extracting its text
                        String pageHref = (String) pageObject.get(HREF_ATTR);
                        String currentAbsoluteHref = prefixPath + pageHref;
                        File htmlFile = new File(currentAbsoluteHref);
                        try {
                            Document doc = Jsoup.parse(htmlFile, "UTF-8");
                            String pageText = doc.body().text();

                            // text search - replace special characters (which seems like the regular char) with their the regular char
                            String extractedText = pageText.replace('\u0060','\'').replace('\u2018','\'').replace('\u201b','\'').replace('\u2019','\''); // handles apostrophe
                            extractedText = extractedText.replace('\u2010','\u002D').replace('\u2013','\u002D').replace('\u2014','\u002D'); // handles hyphen
                            extractedText = extractedText.replace('\u2044','\u002f'); // handles slash
                            extractedText = extractedText.replace('\u00A0',' ').replace('\u2007',' ').replace('\u202F',' '); // handles space

                            if (!extractedText.equals("")) {
                                amountOfFixedPages++;
                                amountOfFixedEbooks.add(eBookObject.get(EBOOK_ID));
                                logger.debug("Ebook " + eBookObject.get(EBOOK_ID) + " in page " + pageObject.get(PAGE_ID_ATTR) + " had empty page text and after re-extracting it's " + pageText);
                            }
                            ((DBObject) page).put(TEXT_KEY, extractedText);
                        } catch (IOException e) {
                            skippedPages++;
                            String errorMsg = String.format("Error parsing html file: %s", htmlFile.getAbsolutePath());
                            logger.error(errorMsg, e);
                        }
//                    }
                }
                // update the eBook in the DB
                migrationDao.saveEbook(eBookObject);
            }
        }
        // after iterating all the eBooks, print to logger the statistics
        logger.debug("AddTextToExistingEbookPages fixed: " + amountOfFixedPages + ", skipped: " + skippedPages + " pages in " + amountOfFixedEbooks.size() + " eBooks. total ebooks: " + eBooks.size());
    }

    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////
    @Required
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }

    @Required
    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }

}
