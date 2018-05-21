package org.t2k.cgs.domain.usecases.ebooks;

import com.mongodb.DBRef;
import org.apache.commons.fileupload.FileItemStream;
import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.ebooks.*;
import org.t2k.cgs.domain.usecases.ebooks.ebookForClientResponse.EbookForClient;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 18/10/2015
 * Time: 15:34
 */
public interface EBookService {

    String E_BOOKS_BASE_FOLDER = "eBooksBaseFolder";
    String E_BOOKS_TEMP_SUBFOLDER = "eBooksTempSubFolder";
    String E_BOOKS_THUMBNAILS_FOLDER = "thumbnails";

    String PROP_CHECK_EBOOK_EXISTS_BEFORE_SAVING = "checkIsEbookAlreadyExistsBeforeSaving";

    /**
     * Creates the Job
     *
     * @return job ID
     */
    String createJobForUploadProcess(int publisherId, String eBookId, String username);

    /**
     * @param uploadEbookData properties used during the conversion
     * @param eBookManager    service handling the task execution
     * @return the converted EBook as an internal object representation
     */
    EBook uploadEBookFile(UploadEBookData uploadEbookData, EBookManager eBookManager);

    /**
     * Service method for updating an eBook on one, or all courses where it is being used, by uploading a newer version
     * of the eBook
     *
     * @param uploadEBookData    properties used during the conversion new eBook conversion
     * @param eBookManager       service handling the task execution
     * @param existingEBook      existing eBook on course/courses, whose references will be changed with those of the new uploaded one
     * @param courseIds           ID of the courses on which to update the eBook
     */
    void uploadNewEBookVersion(UploadEBookData uploadEBookData, EBookManager eBookManager, EBook existingEBook, Set<String> courseIds);

    /**
     * @param updateEBookData properties used during the eBook update
     * @param eBookManager    service handling the task execution
     * @return true if the update completed successfully, false otherwise
     */
    boolean updateEBook(UpdateEBookData updateEBookData, EBookManager eBookManager);

    /**
     * Service method for handling epub conversion to course by using its table of contents.
     *
     * @param eBookConversionData properties used during the conversion
     * @param eBookManager        service handling the task execution
     */
    void convertEpubAndGenerateToc(EBookConversionData eBookConversionData, EBookManager eBookManager);

    void saveEBook(EBook eBook);

    void cancelProcess(EBookManagerData uploadEBookData);

    List<BasicEBookDTO> getAllPublisherBasicEBooksInfo(int publisherId) throws DsException;

    List<BasicEBookDTO> getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(int publisherId, String courseId, String additionalEBooks);

    List<EBook> getPublisherEBooksByCourse(int publisherId, String courseId);

    /***
     * @param publisherId - publisher Id
     * @param courseId    - course Id that we want to get all the books used in
     * @return a map between Ebook-ID and EBook (data) for all the books used in a course
     * @throws DsException
     */
    HashMap<String, EBook> getPublisherEBooksAndIdsByCourse(int publisherId, String courseId) throws DsException;

    DBRef getDBRefByEBook(EBook eBook) throws DsException;

    String getBlankPageTemplate() throws IOException;

    String getPageTextByPageId(EBook eBook, String pageId);

    EBookStructure extractTextFromPages(EBookStructure eBookStructure, int publisherId);

    EBook createEbookFromFile(File eBookFile, int publisherId) throws IOException;

    EbookForClient getEbookForClientResponseByEBookId(String eBookId, int publisherId) throws DsException;

    EBook getByPublisherAndEBookId(String eBookId, int publisherId);

    void addErrorToJob(String massage, String jobId);

    File saveFileItemStreamToDisk(FileItemStream fileItemStream, int publisherId, String jobId, String eBookId);

    File saveMultipartFileToDisk(MultipartFile multipartFile, int publisherId, String jobId, String eBookId);
}