package org.t2k.ebooks;

import nl.siegmann.epublib.domain.Book;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.service.ebooks.EBookConversionServiceFactory;
import org.t2k.cgs.domain.usecases.ebooks.EBookService;
import org.t2k.cgs.service.ebooks.epub.EPubToEBookConversionServiceImpl;
import org.t2k.cgs.service.ebooks.epub.JouveEpubReader;
import org.t2k.cgs.domain.model.ebooks.EBookFormat;
import org.t2k.cgs.domain.model.ebooks.EBookStructure;
import org.t2k.cgs.domain.model.ebooks.Page;
import org.t2k.cgs.domain.usecases.ebooks.conversion.EBookToCourseTOC;
import org.t2k.cgs.domain.usecases.ebooks.conversion.EBookToCourseTocStructure;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;
import java.util.zip.ZipFile;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class EBookToCourseTOCTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private EBookService eBookService;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private EBookConversionServiceFactory eBookConversionServiceFactory;

    @Test
    public void testCreation() throws Exception {
        String bookPath = testUtils.getResourcePath(EBookManagerTest.BOOKS_DIR + "/epub3_accessible.epub");
        // nl.siegmann.epublib library does not generate toc directly from book, since it is custom
        Book book = new JouveEpubReader().readEpub(new ZipFile(bookPath));

        List<Page> pages;
        try {
            EPubToEBookConversionServiceImpl ePubToEBookConversionService = (EPubToEBookConversionServiceImpl) eBookConversionServiceFactory
                    .getEBookConversionService(EBookFormat.EPUB, null);
            pages = ePubToEBookConversionService.getPagesFromSpine(book, false, null, null, null, 0);
        } catch (DsException e) {
            logger.error("Error reading the pages from the EBook spine", e);
            return;
        }

        EBookStructure eBookStructure = new EBookStructure(null, null);
        eBookStructure.addPages(pages);
        EBookToCourseTocStructure structure = new EBookToCourseTocStructure.Builder(true)
                .setMinDepthThresholdForTocCreation(1)
                .build();
        EBookToCourseTOC eBookToCourseTOC = EBookToCourseTOC.newInstance(eBookStructure, book.getTableOfContents(), structure);
//        eBookToCourseTOC.getRefsCount();
//        eBookToCourseTOC.getTocItems().size();
//        eBookToCourseTOC.getPagesCount();

        Assert.assertEquals(eBookToCourseTOC.getRefsCount(), 22);
        Assert.assertEquals(eBookToCourseTOC.getTocItems().size(), 5);
        Assert.assertEquals(eBookToCourseTOC.getPagesCount(), 48);
        Assert.assertEquals(eBookToCourseTOC.getTocItems().get(0).getTitle(), "Preface");
        Assert.assertNotSame(eBookToCourseTOC.getTocItems().get(0)
                .getTocItemRefs().get(0)
                .getLearningObjects().get(0)
                .getPages().size(), 0);
        Assert.assertNotSame(eBookToCourseTOC.getTocItems().get(4)
                .getTocItemRefs().size(), 0);
    }

    @Test
    public void testRestructuringByMaxPage() throws Exception {
        String bookPath = testUtils.getResourcePath(EBookManagerTest.BOOKS_DIR + "/epub3_POC_PER_JOUVE_ECRAN.epub");
        // nl.siegmann.epublib library does not generate toc directly from book, since it is custom
        Book book = new JouveEpubReader().readEpub(new ZipFile(bookPath));

        List<Page> pages;
        try {
            EPubToEBookConversionServiceImpl ePubToEBookConversionService = (EPubToEBookConversionServiceImpl) eBookConversionServiceFactory
                    .getEBookConversionService(EBookFormat.EPUB, null);
            pages = ePubToEBookConversionService.getPagesFromSpine(book, false, null, null, null, 0);
        } catch (DsException e) {
            logger.error("Error reading the pages from the EBook spine", e);
            return;
        }

        EBookStructure eBookStructure = new EBookStructure(null, null);
        eBookStructure.addPages(pages);
        EBookToCourseTocStructure structure = new EBookToCourseTocStructure.Builder(true)
                .setMinDepthThresholdForTocCreation(1)
                .build();
        EBookToCourseTOC eBookToCourseTOC = EBookToCourseTOC.newInstance(eBookStructure, book.getTableOfContents(), structure);
        eBookToCourseTOC = EBookToCourseTOC.newInstance(eBookToCourseTOC, 3);
        Assert.assertEquals(eBookToCourseTOC.getTocItems().get(1).getTocItemRefs().get(1).getTitle(), "Welcome back!2");
        Assert.assertEquals(eBookToCourseTOC.getTocItems().get(1).getTocItemRefs().get(0).getPagesCount(), 3);
        Assert.assertEquals(eBookToCourseTOC.getTocItems().get(2).getTocItemRefs().get(0).getPagesCount(), 1);
    }
}
