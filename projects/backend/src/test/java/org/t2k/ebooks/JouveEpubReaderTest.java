package org.t2k.ebooks;

import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.epub.EpubReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.ebooks.epub.JouveEpubReader;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.zip.ZipFile;

/**
 * @author Alex Burdusel on 2016-06-08.
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class JouveEpubReaderTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TestUtils testUtils;

    @Test
    public void testReadEpub() throws Exception {
        String bookPath = testUtils.getResourcePath(TestEBookFile.EPUB_3_MOBY_DICK.getFilePath());
        // nl.siegmann.epublib library does not generate toc directly from book, since it is custom
        Book book = new EpubReader().readEpub(new ZipFile(bookPath));
        Assert.assertEquals(book.getTableOfContents().size(), 0);
        // we parse the custom toc and add it to book object generated using nl.siegmann.epublib using EditisEpubReader class
        book = new JouveEpubReader().readEpub(bookPath);
        Assert.assertEquals(book.getTableOfContents().size(), 141);
    }
}
