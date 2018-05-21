package org.t2k.cgs.domain.usecases;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.transcoding.TranscodeProcessData;
import org.t2k.cms.MissingFiles;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 23/10/12
 * Time: 10:25
 */
public interface CmsService {

    String BASE_COURSE_PATH = "/publishers/%d/courses/%s";

    byte[] getZippedFiles(String path, List<String> filenames) throws IOException, DsException;

    byte[] getZippedFiles(List<String> filenames) throws IOException, DsException;

    byte[] getFile(String filePath) throws DsException;

    void deleteFile(String path) throws DsException;

    String uploadFiles(List items, String filePath, boolean isSha1, boolean isTranscode) throws DsException;

    //creates or cleans location for asset
    String prepareAssetDirectory(String cmsLocationPattern, Object... parameters);

    String getCmsLocation();

    String getTmpLocation();

    String getFullFilePath(String filePath) ;

    /***
     * @param publisherId - publisherId
     * @param courseId - courseId
     *@param fileNames - a list of file names to check  @return an object containing only the file names of files from @filenames that doesn't exist on server
     */
    MissingFiles getNonExistingFileNames(int publisherId, String courseId, List<String> fileNames);

    void deleteCourseContents(String courseId, int publisherId) throws IOException;

    boolean isMediaTranscodingServiceAvailable();

    TranscodeProcessData getUploadStatus(String processId) throws DsException;

    void cancelTranscodingProcess(String processId) throws DsException;

    String getPublisherPath(int publisherId);

    String getCustomizationPackCmsPath(int publisherId, String courseId, String customizationPackLocale, String customizationPackVersion);

    String getCoursePath(int publisherId, String courseId);
}