package org.t2k.cgs.thumbnails;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.ebooks.EBookThumbnail;
import org.t2k.cgs.model.ebooks.PageInsideLesson;
import org.t2k.cgs.model.ebooks.UploadEBookData;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 10/12/2015
 * Time: 08:37
 */
public interface ThumbnailsGeneratorService {

    void generateThumbnail(EBookThumbnail eBookThumbnail) throws DsException;

    /**
     * Generates thumbnails for each url provided within an EBookThumbnail object from the eBookThumbnails list to the
     * output location defined also in the EBookThumbnail object.
     * @param eBookThumbnails - a list of EBookThumbnail objects. Each EBookThumbnail object contains a URL for a website
     *                          or a file, and an output location in which the generated thumbnail will be saved to.
     */
    void generateThumbnails(List<EBookThumbnail> eBookThumbnails) throws Exception;

    /**
     * Generates thumbnails for each url provided within an EBookThumbnail object from the eBookThumbnails list to the
     * output location defined also in the EBookThumbnail object.
     * @param eBookThumbnails - a list of EBookThumbnail objects. Each EBookThumbnail object contains a URL for a website
     *                          or a file, and an output location in which the generated thumbnail will be saved to.
     * @param uploadEBookData - the data of the eBook upload process that also contains the jobId of the job to be updated with the progress of the thumbnail generation.
     */
    void generateThumbnails(List<EBookThumbnail> eBookThumbnails, UploadEBookData uploadEBookData) throws Exception;

    /**
     * Generates thumbnails for each page provided within the pages list, using the eBook dynamic player, to the output
     * location defined in the outputBasePath.
     * The jobId will be used to update the progress of the job as the thumbnails are being generated.
     * @param pages - a list of eBook pages which we want to generate thumbnails to.
     * @param publisherId - the id of the publisher.
     * @param outputBasePath - the base directory location in which to save the thumbnails.
     * @param jobId - id of the job to be updated with the progress of the thumbnail generation.
     * @return a list of errors which occurred during the thumbnails generation process.
     * @throws Exception
     */
    void generateThumbnailsUsingDynamicPlayer(List<PageInsideLesson> pages, int publisherId, String outputBasePath, String jobId) throws Exception;

//    /**
//     * Generates thumbnails for each url provided within an EBookThumbnail object from the eBookThumbnails list, using the
//     * eBook dynamic player, to the output location defined also in the EBookThumbnail object.
//     * The jobId will be used to update the progress of the job as the thumbnails are being generated.
//     * @param eBookThumbnails - a list of EBookThumbnail objects. Each EBookThumbnail object contains a URL for a website
//     *                          or a file, and an output location in which the generated thumbnail will be saved to.
//     * @param jobId - the id of the job to be updated with the progress of the thumbnail generation.  @return a list of
//     *                errors which occurred during the thumbnails generation process.
//     * @throws Exception
//     */
//    void generateThumbnailsUsingDynamicPlayer(List<EBookThumbnail> eBookThumbnails, int publisherId, String eBookId, String jobId) throws Exception;
}