package org.t2k.cgs.service.packaging;

import com.t2k.dtp.courseutils.converter.ConverterFactory;
import com.t2k.dtp.courseutils.converter.CourseConverter;
import com.t2k.dtp.courseutils.converter.CourseConverterType;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.zippers.PackageZipper;
import org.t2k.cgs.utils.ZipHelper;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 22/06/14
 * Time: 14:38
 */
@Service
public class StandAlonePackageZipper implements PackageZipper {

    private static Logger logger = Logger.getLogger(StandAlonePackageZipper.class);

    @Override
    public String createPackage(CGSPackage cgsPackage) throws Exception {
        FileSystemResource packageFile = new FileSystemResource(cgsPackage.getPackageOutputLocation());
        CourseConverter courseConverter = ConverterFactory.getConverter(CourseConverterType.GCR2LMS);
        File targetDir = new File(packageFile.getFile().getParent(), String.format("download/%s", packageFile.getFile().getName().replace(".cgs", "")));
        courseConverter.convert(packageFile.getFile(), targetDir);
        String zipFile = targetDir.getPath() + ".zip";
        List<String> foldersToZip = new ArrayList<>();
        foldersToZip.add(targetDir.getPath());
        ZipHelper.zipDir(foldersToZip, zipFile);
        File tempFilesPath = null;
        try { // Cleanup
            tempFilesPath = new File(targetDir.getPath());
            FileUtils.forceDelete(tempFilesPath);
        } catch (Exception e) {
            logger.error(String.format("Could not delete folder: %s after publishing to stand alone for packageId: %s, courseId: %s",tempFilesPath.getAbsolutePath(), cgsPackage.getPackId(), cgsPackage.getCourseId()),e);
            throw e;
        }

        return zipFile;
    }
}
