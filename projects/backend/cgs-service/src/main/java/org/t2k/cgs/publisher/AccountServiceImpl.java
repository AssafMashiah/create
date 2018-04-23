package org.t2k.cgs.publisher;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.customIcons.PublisherCustomIconsPack;
import org.t2k.cgs.dao.publisher.AccountDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.enums.AccountMode;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.utils.CustomIconFiles;
import org.t2k.cgs.security.AccountCustomization;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.RelatesTo;
import org.t2k.cgs.user.UserService;
import org.t2k.cgs.utils.FilesUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 2:57 PM
 */
@Service
public class AccountServiceImpl implements PublisherService {

    private static Logger logger = Logger.getLogger(AccountServiceImpl.class);

    private static final String ACCOUNT_ID_PROPERTY = "accountId";

    @Autowired
    private AccountDao publisherDao;

    @Autowired
    @Qualifier(value = "accountDataValidator")
    private Validator accountDataValidator;

    @Autowired
    @Qualifier(value = "groupDataValidator")
    private Validator groupDataValidator;

    @Autowired
    private UserService userService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    @Autowired
    private PublisherRepository publisherRepository;

    @Override
    public String getPublisher(int publisherId) {
        return publisherDao.getPublisher(publisherId);
    }

    public CGSAccount getPublisherById(int publisherId) {
       return publisherRepository.findByAccountId(publisherId);
    }

    @Override
    public String getPublishers() {
        return publisherDao.getPublishers();
    }

    @Override
    public String getPublisherName(int publisherId) {
        return publisherDao.getPublisherName(publisherId);
    }

    @Override
    public String getGroups() {
        return publisherDao.getGroups();
    }

    @Override
    public String getPublishersByRelatesTo(int accountId, String type) {
        return publisherDao.getPublishersByRelatesTo(accountId, type);
    }

    @Override
    public String createPublisher(String publisherJson) throws DsException {
        try {
            BeanPropertyBindingResult errors = new BeanPropertyBindingResult(publisherJson, "publisher");

            ValidationUtils.invokeValidator(this.accountDataValidator, publisherJson, errors);

            if (errors.hasErrors()) {
                throw new ValidationException(errors, ErrorCodes.FIELD_NOT_VALID, "Not a valid publisher");
            }

            Integer publisherId = null;

            // add an externalPartnerSettings item to external partners collection
            String publisherJsonWithAccountId = publisherDao.createPublisher(publisherJson);
            try {
                publisherId = Integer.parseInt(((DBObject) JSON.parse(publisherJsonWithAccountId)).get("accountId").toString());
                externalPartnersService.addBaseExternalPartnersDataForPublisherId(publisherId);
                return publisherJsonWithAccountId;
            } catch (Exception e) {
                publisherDao.deletePublisher(publisherId);
                throw e;
            }

        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    @Override
    public String createGroup(String groupJson) throws DsException {
        try {
            BeanPropertyBindingResult errors = new BeanPropertyBindingResult(groupJson, "group");

            ValidationUtils.invokeValidator(this.groupDataValidator, groupJson, errors);

            if (errors.hasErrors()) {
                throw new ValidationException(errors, ErrorCodes.FIELD_NOT_VALID, "Not a valid group");
            }

            return publisherDao.createGroup(groupJson);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }

    }

    @Override
    public void updateGroup(String groupJson) throws DsException {
        try {
            BeanPropertyBindingResult errors = new BeanPropertyBindingResult(groupJson, "group");

            ValidationUtils.invokeValidator(this.groupDataValidator, groupJson, errors);

            if (errors.hasErrors()) {
                throw new ValidationException(errors, ErrorCodes.FIELD_NOT_VALID, "Not a valid group");
            }

            publisherDao.updateGroup(groupJson);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    @Override
    public String getPublisherCmsHomeLocation(int publisherId) {
        return String.format("%s/publishers/%d", configuration.getProperty("cmsHome"), publisherId);
    }

    @Override
    public String getPublisherCourseCmsHomeLocation(int publisherId, String courseId) {
        return String.format("%s/courses/%s", getPublisherCmsHomeLocation(publisherId), courseId);
    }

    @Override
    public void updatePublisher(String newPublisherJson) throws DsException {
        try {
            BeanPropertyBindingResult errors = new BeanPropertyBindingResult(newPublisherJson, "publisher");

            ValidationUtils.invokeValidator(this.accountDataValidator, newPublisherJson, errors);

            if (errors.hasErrors()) {
                logger.error("Publisher is not valid:" + errors.getAllErrors());
                throw new ValidationException(errors, ErrorCodes.FIELD_NOT_VALID, "Not a valid publisher");
            }

            publisherDao.updatePublisher(newPublisherJson);

        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void deletePublisher(int publisherId) throws DsException {
        try {
            publisherDao.deletePublisher(publisherId);
            externalPartnersService.deleteAllDataRegardingPublisherId(publisherId);
            userService.removeUsersByPublisherAccountId(publisherId);
            deletePublisherFolderFromPublisherCmsHome(publisherId);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    private void deletePublisherFolderFromPublisherCmsHome(int publisherId) {
        String publisherCmsHomeLocation = getPublisherCmsHomeLocation(publisherId);
        File publisherFolder = new File(publisherCmsHomeLocation);
        if (publisherFolder.exists()) {
            try {
                FileUtils.forceDelete(publisherFolder);
            } catch (IOException e) {
                logger.warn(String.format("Failed to remove publisher folder: %s", publisherCmsHomeLocation), e);
            }
        }
    }

    @Override
    public CGSAccount getAccountAuthenticationData(int publisherId, Boolean isSecured) {
        CGSAccount publisher = publisherDao.getAccountAuthenticationData(publisherId);
        if (isSecured) {
            //TODO: remove passwords
        }
        return publisher;
    }

    @Override
    public CGSAccount getCurrentPublisherAccount() {
        CGSUserDetails currentUser = userService.getCurrentUser() == null ? null : userService.getCurrentUser();
        if (currentUser == null || currentUser.getRelatesTo() == null) {
            return null;
        }
        RelatesTo relatesTo = currentUser.getRelatesTo();
        if (!relatesTo.getType().equals("PUBLISHER")) {
            return null;
        }
        return publisherDao.getAccountAuthenticationData(relatesTo.getId());
    }

    @Override
    public EBookConversionServiceTypes getSelectedPdfConverter(int publisherId) {
        EBookConversionServiceTypes pdfVendor;
        pdfVendor = this.getAccountAuthenticationData(publisherId, false).getAccountCustomization().getPdfConversionLibrary();
        return pdfVendor;
    }

    @Override
    public List<AccountMode> getAccountModes() {
        return Arrays.asList(AccountMode.values());
    }

    @Override
    public void deleteGroup(int groupId) throws DsException {
        try {
            String publishersByGroup = publisherDao.getPublishersByGroupId(groupId);
            BasicDBList publishersDBObjects = (BasicDBList) JSON.parse(publishersByGroup);
            if (publishersDBObjects != null) {
                for (Object object : publishersDBObjects) {
                    Integer publisherId = (Integer) ((DBObject) object).get(ACCOUNT_ID_PROPERTY);
                    deletePublisher(publisherId);
                }
            }
            publisherDao.deleteGroup(groupId);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    @Override
    public List<Integer> getAllPublisherIds() {
        return publisherDao.getAllPublisherIds();
    }

    /**
     * @param multipartFile The Multipart file that must be saved temporary.
     * @return The file that was saved on a temporary location (cmsHome/tmp).
     */
    public File saveTemporaryCustomIconFile(MultipartFile multipartFile) {
        String cmsLocation = configuration.getProperty("cmsHome");
        String cmsTmpLocation = String.format("%s/tmp/", cmsLocation);
        String fileName = String.format("customIcons_%s.zip", UUID.randomUUID());
        File fontFile;
        try {
            fontFile = FilesUtils.saveMultipartFileToDisk(multipartFile, cmsTmpLocation + fileName, true);
        } catch (IOException e) {
            logger.error("Failed to save multipart file to disk: " + multipartFile.getOriginalFilename(), e);
            return null;
        }
        return fontFile;
    }

    /**
     * @param fontFile The font file that needs to be validated.
     * @param fontType The font type, it can be "PLAYER" or "ENRICHMENT".
     * @return A list of errors found in font files. It checks for inconsistency, valid ZIP file, font extensions.
     */
    public List<String> validateCustomIconFile(File fontFile, PublisherCustomIconsPack.Type fontType) {
        Set<String> errorStack = new HashSet<>(3);
        String fontFileExtensions = configuration.getProperty("customIconsAcceptedExtensions");
        List<String> acceptedFontFileExtensions = new ArrayList<>(Arrays.asList(fontFileExtensions.split(",")));
        List<String> existingFontFileExtensions = new ArrayList<>();

        ZipFile zipFontFile = null;
        try {
            //reading the zip files
            zipFontFile = new ZipFile(fontFile);
            Enumeration<ZipEntry> zipEntryEnumeration = (Enumeration<ZipEntry>) zipFontFile.entries();
            while (zipEntryEnumeration.hasMoreElements()) {
                ZipEntry entry = zipEntryEnumeration.nextElement();
                String filePath = entry.getName();
                existingFontFileExtensions.add(FilenameUtils.getExtension(filePath));
                //checking for name integrity
                if (!FilenameUtils.getBaseName(filePath).equals(fontType.getFontFamily())) {
                    errorStack.add("bookaliveCustomization.inconsistent");
                }
            }
            //checking for extensions integrity
            if (!existingFontFileExtensions.containsAll(acceptedFontFileExtensions)) {
                errorStack.add("bookaliveCustomization.notAll");
            }
        } catch (IOException e) {
            //if failed to open it is not a valid ZIP file
            errorStack.add("bookaliveCustomization.notZip");
            logger.error("Failed to open zip file: " + fontFile.getPath(), e);
        } finally {
            if (zipFontFile != null) {
                try {
                    zipFontFile.close();
                } catch (IOException e) {
                    logger.error("Failed to close zip file: " + fontFile.getPath(), e);
                }
            }
        }
        return new ArrayList<>(errorStack);
    }

    /**
     * @param fontFile    Font file that you want to move to CMS/Publisher directory.
     * @param fontType    The font type, It can be "PLAYER" or "ENRICHMENT".
     * @param publisherId The publisher ID for selecting right publisher directory.
     * @return The {@link CustomIconFiles}  model containing a list of saved files and publisher directory.
     */
    public CustomIconFiles moveCustomIconFiles(File fontFile, PublisherCustomIconsPack.Type fontType, int publisherId) {
        List<String> outputFiles = new ArrayList<>();
        String publisherPath = this.getPublisherCmsHomeLocation(publisherId);
        CustomIconFiles outputCustomIconFiles;
        String outputPath = String.format("%s/customizations/customIcons/%s", publisherPath, fontType.getFontFamily());
        String baseDir = String.format("/customizations/customIcons/%s", fontType.getFontFamily());
        ZipFile zipFontFile = null;
        try {
            //reading the zip files
            zipFontFile = new ZipFile(fontFile);
            Enumeration<ZipEntry> zipEntryEnumeration = (Enumeration<ZipEntry>) zipFontFile.entries();
            while (zipEntryEnumeration.hasMoreElements()) {
                ZipEntry entry = zipEntryEnumeration.nextElement();
                String destinationPath = String.format("%s/%s", outputPath, entry.getName());
                com.t2k.common.utils.FileUtils.copy(zipFontFile.getInputStream(entry),
                        destinationPath, true);
                outputFiles.add(entry.getName());
            }
        } catch (IOException e) {
            logger.error("Failed to open zip file: " + fontFile.getPath(), e);
            return null;
        } finally {
            //deleting the temporary file
            try {
                if (zipFontFile != null) {
                    zipFontFile.close();
                }
                FileUtils.forceDelete(fontFile);
            } catch (IOException e) {
                logger.error("Failed to close zip file: " + fontFile.getPath(), e);
                return null;
            }
        }
        outputCustomIconFiles = new CustomIconFiles(baseDir, outputFiles);
        return outputCustomIconFiles;
    }

    /**
     * NOTE: This operation of updating the publisher is not atomic
     *
     * @param publisherId     The publisher ID.
     * @param fontType        The font type, It can be "PLAYER" or "ENRICHMENT".
     * @param customIconFiles The {@link CustomIconFiles} model containing a list of saved files and publisher directory.
     * @return
     */
    @Override
    public PublisherCustomIconsPack addCustomIconPackToPublisher(int publisherId,
                                                                 PublisherCustomIconsPack.Type fontType,
                                                                 CustomIconFiles customIconFiles) {

        CGSAccount publisher = publisherRepository.findByAccountId(publisherId);
        if (publisher == null) {
            return null;
        }
        PublisherCustomIconsPack lastCustomIconPack = null;

        //checking if exists a previous version of custom icon pack
        AccountCustomization accountCustomization = publisher.getAccountCustomization();
        for (PublisherCustomIconsPack item : accountCustomization.getCustomIconsPacks()) {
            if (item.getType().equals(fontType)) {
                lastCustomIconPack = item;
            }
        }
        Date creationDate = new Date();
        //building the new CustomIconsPack object
        PublisherCustomIconsPack newCustomIconsPack = PublisherCustomIconsPack.newInstance(customIconFiles.getBaseDir(),
                creationDate.getTime(),
                customIconFiles.getHrefs(),
                fontType,
                creationDate);
        //adding new CustomIconsPack to the publisher
        accountCustomization.addCustomIconsPack(newCustomIconsPack);
        publisher.setCustomization(accountCustomization);
        publisherRepository.save(publisher);
        return newCustomIconsPack;
    }
}
