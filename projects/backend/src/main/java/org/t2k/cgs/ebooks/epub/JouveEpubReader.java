package org.t2k.cgs.ebooks.epub;

import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.TOCReference;
import nl.siegmann.epublib.domain.TableOfContents;
import nl.siegmann.epublib.epub.EpubReader;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Class used to read Editis epub3 EBook and build table of contents. Since Editis is using a custom epub generator
 * (Jouve Studio) and is placing the table of contents in TOC.xhtml or toc.xhtml, separate processing is required to
 * add it to the Book generated using epublib library
 *
 * @author Alex Burdusel on 2016-06-08.
 */
public class JouveEpubReader {

    private final Logger logger = Logger.getLogger(this.getClass());

    private static final String TOC_ELEMENT_CSS_QUERY = "nav[epub:type=toc]";

    public Book readEpub(File epubFile) throws IOException {
        return readEpub(epubFile.getAbsolutePath());
    }

    public Book readEpub(String epubFilePath) throws IOException {
        try (ZipFile zipFile = new ZipFile(epubFilePath)) {
            return readEpub(zipFile);
        }
    }

    public Book readEpub(ZipFile epubZipFile) throws IOException {
//        Book book = new EpubReader().readEpub(epubZipFile); // out of memory
        Book book = new EpubReader().readEpubLazy(epubZipFile.getName(), "UTF-8");
        //System.gc(); // we call the garbage collector here because if the upload process had failed due to an invalid version,
        // then the input stream which locks the epub file when we use the EpubReader.readEpubLazy() method, never
        // unlock it. The GC release this lock and then we can delete the file. This only applies for Windows
        TableOfContents tableOfContents = buildTableOfContents(epubZipFile, book);
        if (tableOfContents != null) {
            book.setTableOfContents(tableOfContents);
        }
        return book;
    }

//    /**
//     * @param zipFile zip epub file
//     * @return document for the TOC XML file
//     */
//    private org.w3c.dom.Document getTocDomDocument(ZipFile zipFile) {
//        ZipEntry tocZipEntry = findTocZipEntry(zipFile);
//        if (tocZipEntry == null) {
//            return null;
//        }
//        org.w3c.dom.Document document = null;
//        InputStream inputStream = null;
//        try {
//            inputStream = zipFile.getInputStream(tocZipEntry);
//            document = EpubProcessorSupport.createDocumentBuilder().parse(inputStream);
//        } catch (SAXException | IOException e) {
//            logger.error("Unable to open toc xml file from epub zip", e);
//            return null;
//        } finally {
//            if (inputStream != null) {
//                try {
//                    inputStream.close();
//                } catch (IOException e) {
//                    logger.error("Unable to close InputStream from epub zip", e);
//                }
//            }
//        }
//        return document;
//    }

    /**
     * @param zipFile zip epub file
     * @return document for the TOC XML file
     */
    private Document getTocDocument(ZipFile zipFile) {
        ZipEntry tocZipEntry = findTocZipEntry(zipFile);
        if (tocZipEntry == null) {
            return null;
        }
        try {
            InputStream inputStream = zipFile.getInputStream(tocZipEntry);
            return Jsoup.parse(inputStream, "UTF-8", tocZipEntry.getName());
        } catch (IOException e) {
            logger.error("Unable to open toc xml file from epub zip " + zipFile.getName(), e);
            return null;
        }
    }

    /**
     * @param zipFile zip epub file
     * @return ZipEntry for the TOC XML file or null if none found
     */
    private ZipEntry findTocZipEntry(ZipFile zipFile) {
        Enumeration<ZipEntry> zipEntryEnumeration = (Enumeration<ZipEntry>) zipFile.entries();
        while (zipEntryEnumeration.hasMoreElements()) {
            ZipEntry entry = zipEntryEnumeration.nextElement();
            if (entry.getName().contains("TOC.xhtml") || entry.getName().contains("toc.xhtml")) {
                logger.debug(String.format("TOC XML for %s found at: %s", zipFile.getName(), entry.getName()));
                return entry;
            }
        }
        return null;
    }

    /**
     * @param zipFile zip epub file
     * @return table of contents built from toc xml found inside the zip file
     */
    private TableOfContents buildTableOfContents(ZipFile zipFile, Book book) {
        Document tocDocument = getTocDocument(zipFile);
        if (tocDocument == null) {
            return null;
        }
        // get toc element. there should be only one toc element with one nested ordered/unordered list inside it
        Element tocParent = tocDocument.select(TOC_ELEMENT_CSS_QUERY).get(0);
        Elements orderedLists = tocParent.select(":root > ol");
        Element tocRootElement = orderedLists.isEmpty()
                ? tocParent.select(":root > ul").first()
                : orderedLists.first();

        Elements tocElements = tocRootElement.select(":root > li");
        List<TOCReference> tocReferences = new ArrayList<>(tocElements.size());
        for (Element element : tocElements) {
            tocReferences.add(buildTOCReferenceFromElement(element, book));
        }
        return new TableOfContents(tocReferences);
    }

    /**
     * @param element the li element of the toc reference
     * @param book    book used to link references to toc items
     * @return
     */
    private TOCReference buildTOCReferenceFromElement(Element element, Book book) {
        Element aElement = element.select(":root > a").get(0);
        String hrefValue = aElement.attr("href");
        String title = aElement.text();
        TOCReference tocReference = new TOCReference(title, book.getResources().getByHref(hrefValue));

        Elements childrenTOCs = element.select(":root > ol > li");
        if (childrenTOCs.isEmpty()) {
            childrenTOCs = element.select(":root > ul > li");
        }
        // check if it has children, build toc references from each of them and add to the parent toc reference recursively
        if (childrenTOCs.size() > 0) {
            tocReference.setChildren(childrenTOCs.stream()
                    .map(childElement -> buildTOCReferenceFromElement(childElement, book))
                    .collect(Collectors.toList()));
        }
        return tocReference;
    }
}
