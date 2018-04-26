package org.t2k.cgs.ebooks.pdf;

import com.qoppa.pdf.DocumentInfo;
import com.qoppa.pdfWeb.PDFWeb;
import com.qoppa.pdfWeb.SVGOptions;
import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.ebooks.EBookConversionService;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.ebooks.EbookJobComponent;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookStructure;
import org.t2k.cgs.model.ebooks.Page;
import org.t2k.cgs.model.ebooks.UploadEBookData;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobService;
import org.t2k.cgs.utils.Progress;
import org.t2k.cgs.utils.SystemUtils;

import java.io.File;

/**
 * Created by moshe.avdiel on 1/7/2016.
 */
@Service("pdfToEBookQOPPAConversionService")
public class PdfToEBookQOPPAConversionServiceImpl implements EBookConversionService {

    private Logger logger = Logger.getLogger(this.getClass());

    @Autowired
    private JobService jobService;

    @Autowired
    SystemUtils systemUtils;

    @Autowired
    private Configuration configuration;


    @Override
    public EBookStructure generateEBookStructure(UploadEBookData uploadEBookData) throws Exception {

        File eBookFile = uploadEBookData.getUploadedEBookFile();
        String jobId = uploadEBookData.getJobId();

        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 0, Job.Status.IN_PROGRESS);


        // no password, hence null.
        PDFWeb pdfWeb = new PDFWeb(eBookFile.getAbsolutePath(), null);
        DocumentInfo docInfo = pdfWeb.getDocumentInfo();
        int pageCount = pdfWeb.getPageCount();

        Progress progress = new Progress(pageCount, 13);

        logger.debug(String.format("Qoppa got: Title: %s #Pages: %d Subject:%s\nSaving as SVG...", docInfo.getTitle(), docInfo.getPageCount(), docInfo.getSubject()));

        SVGOptions svgOptions = new SVGOptions();
        svgOptions.setJPEGCompression(true);
        svgOptions.setJPEGQuality(0.5);
        svgOptions.setFontFormat(SVGOptions.FontFormat.SVG);

        String pagePath = uploadEBookData.getEBookDir();

        EBookStructure eBookStructure = new EBookStructure(docInfo.getTitle(), "");
        String eBookId = uploadEBookData.getEBookId();

        for (int pageIndexFromZero=0; pageIndexFromZero<pageCount; ++pageIndexFromZero) {

            int pageNumber = pageIndexFromZero+1;

            String pageHtmlFilename = String.format("Page_%d.html", pageNumber);
            File fullHtmlPath =  new File(pagePath, pageHtmlFilename);
            File thumbDir = new File(pagePath, EBookService.E_BOOKS_THUMBNAILS_FOLDER);
            if (!thumbDir.exists()) {
                thumbDir.mkdirs();
            }
            String thumbName = String.format("Page_%d.jpg", pageNumber);
            File fullThumbPath = new File(thumbDir, thumbName);

            //optional: SVGOptions...
            pdfWeb.savePageAsSVG(pageIndexFromZero, fullHtmlPath.getAbsolutePath());

            // Save Thumbnail Image of this page
            pdfWeb.savePageImage(pageIndexFromZero, 72, PDFWeb.IMGFMT_JPEG, fullThumbPath.getAbsolutePath());

            progress.increment();
            if (progress.hasProgress()) {
                jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), progress.getPercentage(), Job.Status.IN_PROGRESS);
            }

            String pageRelativeHref = String.format("%s/%s/%s", configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER), eBookId, pageHtmlFilename);
            String thumbnailHref = String.format("%s/%s/thumbnails/%s", configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER), eBookId, thumbName);
            Page page = new Page(String.format("page-%d", pageNumber), eBookId, String.format("Page %d", pageNumber), pageRelativeHref, pageNumber, thumbnailHref);

            eBookStructure.addPage(page);
        }

        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 100, Job.Status.IN_PROGRESS);
        return eBookStructure;
    }

    @Override
    public boolean isValid(UploadEBookData uploadEBookData) throws DsException {
        return true;
    }

    @Override
    public void generatePageThumbnails(EBookStructure eBookStructure, UploadEBookData uploadEBookData) throws Exception {
        String jobId = uploadEBookData.getJobId();

        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 0, Job.Status.IN_PROGRESS);
        systemUtils.sleep(100);
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 38, Job.Status.IN_PROGRESS);
        systemUtils.sleep(100);
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 74, Job.Status.IN_PROGRESS);
        systemUtils.sleep(100);
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 100, Job.Status.IN_PROGRESS);
    }


    @Override
    public EBookConversionServiceTypes getEBookConversionServiceType() {
        return EBookConversionServiceTypes.QOPPA;
    }

    @Override
    public String getEbookConversionLibraryVersion() {
        return "1.0";
    }
}
