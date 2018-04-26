package org.t2k.cgs.packaging;

import org.apache.log4j.Logger;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagingLocalContext;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Set;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * A Util class to compress a package content. it uses the cgsPackage details as for the
 * meta-data contextual information. The compressed resources are provided as a Set of URL strings
 * The Zipper manipulate the entries file paths according to the cgsPackage information.
 * Also the output zip will be located according to the cgsPackage.
 * User: Ophir.Barnea
 * Date: 20/12/12
 * Time: 13:50
 */

public class PackageZipper {

    private static Logger logger = Logger.getLogger(PackageZipper.class);

    private PackageStepsUpdater packageStepsUpdater;

    private CGSPackage cgsPackage;
    private Set<String> filesUrls;
    private boolean isCanceled;

    public PackageZipper(PackageStepsUpdater packageStepsUpdater, CGSPackage cgsPackage) {
        this.packageStepsUpdater = packageStepsUpdater;
        this.cgsPackage = cgsPackage;
    }

    public PackageZipper(PackageStepsUpdater packageStepsUpdater, CGSPackage cgsPackage, Set<String> filesUrls) {
        this.packageStepsUpdater = packageStepsUpdater;
        this.cgsPackage = cgsPackage;
        this.filesUrls = filesUrls;
    }

    public void compress() throws Exception {
        logger.info("compress: starting ");
        ZipOutputStream zipOut = null;
        FileInputStream fin = null;

        try {
            if(logger.isDebugEnabled()){
                if (!filesUrls.isEmpty()) {
                    logger.debug(String.format("compressing %d resources for packageId: %s. course %s, by user %s.", filesUrls.size(), cgsPackage.getPackId(), cgsPackage.getCourseCId(), cgsPackage.getUserName()));
                }
            }
            String zipOutputFileName = this.cgsPackage.getPackageOutputLocation();
            OutputStream out = new FileOutputStream(new File(zipOutputFileName));
            zipOut = new ZipOutputStream(out);

            zipOut.setLevel(Deflater.DEFAULT_COMPRESSION);
            zipOut.setComment(String.format("CGS course version: %s\non: %s", this.cgsPackage.getVersion(), this.cgsPackage.getHostName()));

            int numberOfFiles = filesUrls.size();
            String[] filesUrlsArray = filesUrls.toArray(new String[numberOfFiles]);
            for (int i = 0 ; i < numberOfFiles ; i++) {
                String fileName = filesUrlsArray[i];
                if (isCanceled()) {
                    logger.info(String.format("compress: canceled while compressing. courseId: %s", this.cgsPackage.getCourseId()));
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
                    for (int n ; (n = fin.read(buffer)) > 0 ; ) {
                        zipOut.write(buffer, 0, n);
                    }
                    fin.close();
                } else {
                    ze = new ZipEntry(zipName + '/');
                    ze.setTime(file.lastModified());
                    zipOut.putNextEntry(ze);
                }

                if (i % 100 == 0) // Update  job process percentage every 100 files
                    updatePackagingProgressPercentage(i, numberOfFiles);
            }

            zipOut.flush();
            logger.info(String.format("compress: writing to :%s", zipOutputFileName));
        } catch (Exception e) {
            logger.error("compress: error while compressing...", e);
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

    private void updatePackagingProgressPercentage(int numberOfFilesZipped, int totalNumberOfFiles) throws DsException {
        int percentage = (int) (((float) numberOfFilesZipped / totalNumberOfFiles) * 100);
        packageStepsUpdater.changePackagePhaseToInProgressPackaging(cgsPackage, percentage);
    }

    private String modifyEntryZipName(String fileName) {
        PackagingLocalContext localResourcesLocation = cgsPackage.getLocalResourcesLocation();
        String cmsPublisherHomeLocation = cgsPackage.getCmsPublisherHomeLocation();
        String eBooksLocation = cgsPackage.getEBooksLocation();

        String zipName = fileName;
        if (File.separatorChar != '/') {
            zipName = zipName.replace(File.separatorChar, '/');
        }
        if (zipName.startsWith(localResourcesLocation.getBasePath())) {
            zipName = zipName.substring(zipName.indexOf(localResourcesLocation.getBasePath()) + localResourcesLocation.getBasePath().length() + 1);
        } else if (eBooksLocation != null && zipName.startsWith(eBooksLocation)) {
            zipName = zipName.substring(zipName.indexOf("ebooks"));
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
     * @param canceled
     */
    public void setCanceled(boolean canceled) {
        isCanceled = canceled;
    }

    public CGSPackage getCgsPackage() {
        return cgsPackage;
    }

    public Set<String> getFilesUrls() {
        return filesUrls;
    }

    public void setFilesUrls(Set<String> urls) {
        this.filesUrls = urls;
    }
}