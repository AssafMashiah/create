package org.t2k.cgs.domain.usecases.publisher;

import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.service.AccountServiceImpl;
import org.t2k.cgs.domain.model.user.AccountDao;
import org.t2k.cgs.domain.model.utils.UniqueIdDao;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;

import static org.mockito.Mockito.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 3:44 PM
 */
@Test
public class PublisherServiceTest {

    private static final String PACKAGE_PATH = "jsons/publishers";

    private AccountServiceImpl publisherService;
    private UniqueIdDao uniqueIdDao;
    private AccountDao publisherDao;
    private Validator validator;
    private ExternalPartnersService externalPartnersService;

    private String defaultPublisher;
    private static final Integer DEFAULT_PUBLISHER_ID = 6;

    @BeforeMethod
    private void beforeTest() throws Exception {
        publisherService = new AccountServiceImpl();
        uniqueIdDao = mock(UniqueIdDao.class);
        publisherDao = mock(AccountDao.class);
        externalPartnersService = mock(ExternalPartnersService.class);
        validator = mock(Validator.class);
//        publisherService.setExternalPartnersService(externalPartnersService);
        ReflectionTestUtils.setField(this.publisherService, "externalPartnersService", externalPartnersService);
//        publisherService.setPublisherDao(publisherDao);
        ReflectionTestUtils.setField(this.publisherService, "publisherDao", publisherDao);
//        publisherService.setAccountDataValidator(validator);
        ReflectionTestUtils.setField(this.publisherService, "accountDataValidator", validator);
        when(validator.supports(String.class)).thenReturn(true);
        when(uniqueIdDao.getNextId(anyString())).thenReturn(DEFAULT_PUBLISHER_ID);

        InputStream is = getFileInputStream("add_publisher_request.json");
        defaultPublisher = getInputStreamAsString(is);

        when(uniqueIdDao.getNextId(anyString())).thenReturn(DEFAULT_PUBLISHER_ID);
    }

    @Test
    public void testAddPublisherSuccessfully() throws Exception {
        when(publisherDao.createPublisher(anyString())).thenReturn("{\"accountId\":1}");

        publisherService.createPublisher(defaultPublisher);

        verify(publisherDao, times(1)).createPublisher(eq(defaultPublisher));
    }

    private void testUpdatePublisherWithNewName() throws Exception {
        String oldPublisher = defaultPublisher.replace("\"name\": \"test\"", "\"name\": \"test\", \"publisherId\": 1");
        String newPublisher = defaultPublisher.replace("\"name\": \"test\"", "\"name\": \"newName\", \"publisherId\": 1");

        System.out.println(newPublisher);

        AccountServiceImpl publisherServiceMock = new AccountServiceImpl();
        AccountDao publisherDaoMock = mock(AccountDao.class);
        Validator validatorMock = mock(Validator.class);
//        publisherServiceMock.setPublisherDao(publisherDaoMock);
        ReflectionTestUtils.setField(this.publisherService, "publisherDao", publisherDaoMock);
//        publisherServiceMock.setAccountDataValidator(validatorMock);
        ReflectionTestUtils.setField(this.publisherService, "accountDataValidator", validatorMock);

        when(validatorMock.supports(any(Class.class))).thenReturn(true);
        when(publisherDaoMock.getPublisher(1)).thenReturn(oldPublisher);

        publisherServiceMock.updatePublisher(newPublisher);

        verify(publisherDaoMock, times(1)).getPublisher(eq(1));
    }

    private FileInputStream getFileInputStream(String path) throws URISyntaxException, FileNotFoundException {
        String relativePath = PACKAGE_PATH + "/" + path;
        System.out.println(relativePath);
        URL url = ClassLoader.getSystemResource(relativePath);
        File file = new File(url.toURI());
        FileInputStream is = new FileInputStream(file);
        return is;
    }

    private String getInputStreamAsString(InputStream inputStream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }

        String res = out.toString();
        inputStream.close();
        return res;
    }
}