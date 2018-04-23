package org.t2k.cgs.exportImport;

import org.apache.log4j.Logger;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobComponentDefault;
import org.t2k.cgs.model.job.JobService;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 02/10/13
 * Time: 14:08
 */
public class ExportImportZipper {

    private static Logger logger = Logger.getLogger(ExportImportZipper.class);

    private ExportImportPackage exImPackage;
    private JobService jobService;
    private boolean isCanceled;

    public ExportImportZipper(ExportImportPackage exImPackage, JobService jobService) {
        this.exImPackage = exImPackage;
        this.jobService = jobService;
    }

    public void compress(Set<String> filesUrls) throws Exception {
        int filesUrlsSize = filesUrls.size();
        logger.info(String.format("compress %d files :starting ", filesUrlsSize));
        ZipOutputStream zipOut = null;
        FileInputStream fin = null;
        try {
            exImPackage.getJobId();
            String zipOutputFileName = exImPackage.getZipFileFullPathName();
            OutputStream out = new FileOutputStream(new File(zipOutputFileName));
            zipOut = new ZipOutputStream(out);

            zipOut.setLevel(Deflater.DEFAULT_COMPRESSION);
            zipOut.setComment(String.format("CGS course ver. 1.0.0 on: %s", exImPackage.getHostName()));

            List<String> urls = new ArrayList<>(filesUrls);
            for (int i = 0; i < filesUrls.size(); i++) {
                String fileName = urls.get(i);
                if (isCanceled) {
                    logger.info(String.format("compress: canceled while compressing. courseId: %s", exImPackage.getCourseId()));
                    break;
                }
                File file = new File(fileName);
                //modify entry name to avoid full path and references separatorChar
                String zipName = modifyEntryZipName(fileName);
                ZipEntry ze;
                if (file.isFile()) {
                    ze = new ZipEntry(zipName);
                    ze.setTime(file.lastModified());
                    ze.setSize(file.length());
                    zipOut.putNextEntry(ze);
                    fin = new FileInputStream(file);
                    byte[] buffer = new byte[4096];
                    for (int n; (n = fin.read(buffer)) > 0; ) {
                        zipOut.write(buffer, 0, n);
                    }

                    fin.close();
                    if (jobService != null && (i % 100) == 0) {
                        jobService.updateJobProgress(exImPackage.getJobId(), JobComponentDefault.ZIP_FILE_CREATION.getValue(), i * 100 / filesUrlsSize, Job.Status.IN_PROGRESS);
                    }
                } else {
                    ze = new ZipEntry(String.format("%s/", zipName));
                    ze.setTime(file.lastModified());
                    zipOut.putNextEntry(ze);
                }
            }

            zipOut.flush();
            logger.info(String.format("compress: writing to :%s", zipOutputFileName));
        } catch (Exception e) {
            logger.error("compress: error while compressing..", e);
            throw e;
        } finally {
            if (zipOut != null) {
                zipOut.close();
            }
            if (fin != null) {
                fin.close();
            }

            logger.info("compress: ended");
        }
    }

    private String modifyEntryZipName(String fileName) {
        ExportImportLocalContext localResourcesLocation = exImPackage.getLocalResourcesLocation();
        String cmsPublisherHomeLocation = exImPackage.getCmsPublisherHomeLocation();
        String eBooksLocation = exImPackage.getCmsEBooksHomeLocation();
        String eBooksBaseFolderLocation = exImPackage.getEBooksBaseFolderLocation();

        String zipName = fileName;
        if (File.separatorChar != '/') {
            zipName = zipName.replace(File.separatorChar, '/');
        }
        if (zipName.startsWith(localResourcesLocation.getBasePath())) {
            zipName = zipName.substring(zipName.indexOf(localResourcesLocation.getBasePath()) + localResourcesLocation.getBasePath().length() + 1);
        } else if (eBooksLocation != null && zipName.startsWith(eBooksLocation)) {
            zipName = zipName.substring(zipName.indexOf(eBooksBaseFolderLocation));
        } else {
            zipName = zipName.substring(zipName.indexOf(cmsPublisherHomeLocation) + cmsPublisherHomeLocation.length() + 1);
        }
        return zipName;
    }

    public boolean isCanceled() {
        return isCanceled;
    }

    /**
     * When true. the compress process will be
     * halted before handling the next file to compress
     *
     * @param canceled
     */
    public void setCanceled(boolean canceled) {
        isCanceled = canceled;
    }
}