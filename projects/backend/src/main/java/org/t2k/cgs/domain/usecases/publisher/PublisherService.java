package org.t2k.cgs.domain.usecases.publisher;

import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.AccountMode;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.utils.CustomIconFiles;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.model.course.PublisherCustomIconsPack;

import java.io.File;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 2:56 PM
 */
public interface PublisherService {

    CGSAccount getAccountAuthenticationData(int publisherId, Boolean isSecured);

    CGSAccount getCurrentPublisherAccount();

    String getPublisher(int publisherId);

    CGSAccount getPublisherById(int publisherId);

    String getPublishers();

    String getPublisherName(int publisherId);

    String getPublishersByRelatesTo(int accountId, String type) throws DsException;

    String createPublisher(String publisherJson) throws DsException;

    void updatePublisher(String publisherJson) throws DsException;

    /**
     * removes the publisher, its users and data from externalPartnersSettings collection
     *
     * @throws DsException
     */
    void deletePublisher(int publisherId) throws DsException;

    String createGroup(String groupJson) throws DsException;

    void updateGroup(String groupJson) throws DsException;

    String getPublisherCmsHomeLocation(int publisherId);

    String getPublisherCourseCmsHomeLocation(int publisherId, String courseId);

    String getGroups();

    void deleteGroup(int groupId) throws DsException;

    List<Integer> getAllPublisherIds();

    EBookConversionServiceTypes getSelectedPdfConverter(int publisherId);

    List<AccountMode> getAccountModes();

    File saveTemporaryCustomIconFile(MultipartFile multipartFile);

    List<String> validateCustomIconFile(File fontFile, PublisherCustomIconsPack.Type fontType);

    CustomIconFiles moveCustomIconFiles(File fontFile, PublisherCustomIconsPack.Type fontType, int publisherId);

    PublisherCustomIconsPack addCustomIconPackToPublisher(int publisherId, PublisherCustomIconsPack.Type fontType, CustomIconFiles customIconFiles);
}


