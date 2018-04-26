package org.t2k.cgs.ebooks;

import net.coobird.thumbnailator.Thumbnailator;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobService;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.Bidi;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * Created by moshe.avdiel on 1/11/2016.
 */
@Service
public class EBookUtil {

    private Logger logger = Logger.getLogger(this.getClass());

    public static final String THUMBNAIL_EXTENSION = ".jpg";
    public static final String FONTS_FOLDER = "fonts";

    @Autowired
    private JobService jobService;

    public String getEBookTitle(File eBookFile) {
        String bookTitle = eBookFile.getName().replaceAll(".pdf$", ""); // remove the ".pdf" from file name
        return bookTitle;
    }

    public int getPageCount(File pdfFile) throws IOException {
        PDDocument pdfDoc = PDDocument.load(pdfFile);
        int numberOfPages = pdfDoc.getNumberOfPages();
        pdfDoc.close();

        return numberOfPages;
    }

    /***
     * returns a list of hrefs to jpg files of the thumbnails for the pdf
     *
     * @param pathToPdf    - absolute path to the PDF file
     * @param outputFolder - the folder to put all the output .jpg thumbnail files (one for each page in the pdf)
     * @param height       - thumbnail height
     * @param width        - thumbnail width
     * @param jobId
     * @return - a list of the file names. the first element in the list is the first page in pdf, second is second, etc.
     * @throws IOException
     */
    public List<String> generateThumbnailsForPdf(String pathToPdf, String outputFolder, int height, int width, String jobId) throws Exception {
        List<String> files = new ArrayList<>();
        File pdfFile = new File(pathToPdf);
        PDDocument document = null;
        try {
            document = PDDocument.load(pdfFile);
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            PDPageTree pages = document.getPages();
            int numberOfPages = pages.getCount();
            int pageCounter = 0;
            for (PDPage page : pages) {
                BufferedImage bufferedImage;
                try {
                    // get the image from the PDF page - in its natural height+width
                    bufferedImage = pdfRenderer.renderImageWithDPI(pageCounter, 300, ImageType.RGB);
                } catch (Throwable e) {
                    /*we catch throwable, because that in centos7 this function sometimes throws a :outofmemoryerror java heap space Error.
                    in this case, we want to continue running the program without the thumbnail.*/
                    pageCounter++;
                    logger.error(String.format("Failed to generate thumbnail for page number :%d", pageCounter), e);
                    int thumbnailProgress = (int) (((double) pageCounter / numberOfPages) * 100);
                    jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), thumbnailProgress, Job.Status.IN_PROGRESS);
                    continue;
                }
                pageCounter++;

                // write the pdf image to file in its natural height+width
                String fileName = String.format("%s/%d%s", outputFolder, pageCounter, THUMBNAIL_EXTENSION);
                ImageIO.write(bufferedImage, "jpg", new File(fileName));

                // use Thumbnailator to resize the natural image to thumbnails size
                BufferedImage thumbnailResized = Thumbnailator.createThumbnail(new File(fileName), width, height);

                // override the image with the thumbnail
                ImageIO.write(thumbnailResized, "jpg", new File(fileName));
                files.add(pageCounter + THUMBNAIL_EXTENSION);

                int thumbnailProgress = (int) (((double) pageCounter / numberOfPages) * 100);
                jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), thumbnailProgress, Job.Status.IN_PROGRESS);
            }
        } finally {
            try {
                if (document != null) {
                    document.close();
                }
            } catch (IOException e) {
                logger.error("failed to close pdf document", e);
                throw e;
            }
        }
        return files;
    }

    public List<String> getCssFontsFacesFromHtml(String htmlPage, String fontFacePattern) {
        Pattern p = Pattern.compile(fontFacePattern); // look for all "@font-face" CSSs elements
        Matcher m = p.matcher(htmlPage);
        List<String> matches = new ArrayList<>();
        while (m.find()) {
            matches.add(m.group());
        }

        return matches;
    }

    public String getFontPathFromFontFace(String fontFace, String srcStartPattern, String srcEndPattern) {
        String fontPath = fontFace.substring(fontFace.indexOf(srcStartPattern) + srcStartPattern.length(), fontFace.length());
        fontPath = fontPath.substring(0, fontPath.indexOf(srcEndPattern));
        return fontPath;
    }

    /**
     * @param fontName - font name to change
     * @param eBookDir - ebook output directory
     * @return - the font file's new name as sha1 representation.
     * @throws DsException
     */
    public String moveFontsToFolderAndRenameToSha1(String fontName, String eBookDir) throws DsException {
        File fontFile = new File(String.format("%s/%s", eBookDir, fontName));
        String fontFileExtension = FilenameUtils.getExtension(fontFile.getName());

        //create sha-1 signature on the font file
        String sha1;
        try {
            sha1 = DigestUtils.sha1Hex(FileUtils.readFileToByteArray(fontFile));
        } catch (IOException e) {
            String msg = String.format("Failed to generate sha1 signature on font file: %s, in eBookStructureOptimization process", fontFile.getAbsolutePath());
            logger.error(msg, e);
            throw new DsException(msg, e);
        }

        //new sha1 name for the font file
        String sha1FontName = String.format("%s.%s", sha1, fontFileExtension);
        File sha1fontFile = new File(String.format("%s/%s/%s", eBookDir, FONTS_FOLDER, sha1FontName));
        if (!sha1fontFile.exists()) { //save sha1 font file under font folder
            try {
                FileUtils.moveFile(fontFile, sha1fontFile);
            } catch (IOException e) {
                String msg = String.format("Failed to move font file with sha1 signature to the font folder: %s, in eBookStructureOptimization process", sha1fontFile.getAbsolutePath());
                logger.error(msg, e);
                throw new DsException(msg, e);
            }
        } else {
            try {
                FileUtils.forceDelete(fontFile);
            } catch (IOException e) {
                String msg = String.format("Failed to delete duplicate font file from its original location: %s, in eBookStructureOptimization process", fontFile.getAbsolutePath());
                logger.error(msg, e);
                throw new DsException(msg, e);
            }
        }

        return sha1FontName;
    }
	//code from:http://www.nesterovsky-bros.com/weblog/2013/07/28/VisualToLogicalConversionInJava.aspx
	//converts visual hebrew to logical - visual is when the letters are written as they should appear if read from left to right, (opposite direction the logical)
    public static String visualToLogical(String text) {
        if ((text == null) || (text.length() == 0)) {
            return text;
        }

        Bidi bidi = new Bidi(text, Bidi.DIRECTION_DEFAULT_LEFT_TO_RIGHT);

        if (bidi.isLeftToRight()) {
            return text;
        }

        int count = bidi.getRunCount();
        byte[] levels = new byte[count];
        Integer[] runs = new Integer[count];

        for (int i = 0; i < count; i++) {
            levels[i] = (byte) bidi.getRunLevel(i);
            runs[i] = i;
        }

        Bidi.reorderVisually(levels, 0, runs, 0, count);

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < count; i++) {
            int index = runs[i];
            int start = bidi.getRunStart(index);
            int end = bidi.getRunLimit(index);
            int level = levels[index];

            if ((level & 1) != 0) {
                for (; --end >= start; ) {
                    result.append(text.charAt(end));
                }
            } else {
                result.append(text, start, end);
            }
        }

        return result.toString();
    }
}