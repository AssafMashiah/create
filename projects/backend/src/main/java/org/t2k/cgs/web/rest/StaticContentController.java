package org.t2k.cgs.web.rest;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.usecases.ClientConfiguration;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.domain.usecases.SkillsService;
import org.t2k.cgs.domain.usecases.standards.StandardsService;
import org.t2k.cgs.domain.usecases.TextToSpeechProviderService;
import org.t2k.cgs.domain.usecases.user.UserService;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 2:27 PM
 */
@RestController
@AllowedForAllUsers
public class StaticContentController {

    private static Logger logger = Logger.getLogger(StaticContentController.class);

    private int SUPER_ADMIN_ID = -1;

    @Autowired
    private Configuration configuration;

    @Autowired
    private StandardsService standardsService;

    @Autowired
    private SkillsService skillsService;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private CGSUserDetails currentUser;

    @Autowired
    private UserService userService;

    @Autowired
    private TextToSpeechProviderService ttsProviderService;

    @Autowired
    private ClientConfiguration clientConfiguration;

    @Autowired
    private CmsService cmsService;

    @RequestMapping(value = "/publishers/getAuthenticationData", method = RequestMethod.GET)
    public String getAuthenticationData() throws Exception {
        JsonObject jsonObject = new JsonObject();
        JsonObject config = new JsonObject();

        Gson globalGson = new Gson();

        config.addProperty("basePath", clientConfiguration.getBasePath());
        config.addProperty("cmsBasePath", clientConfiguration.getCmsBasePath());
        config.addProperty("schemaName", clientConfiguration.getSchemaName());
        config.addProperty("version", clientConfiguration.getCgsVersion());
        config.addProperty("logoutPath", clientConfiguration.getLogoutPath());
        config.addProperty("enableTVEAsImage", configuration.getBooleanProperty("enableTVEAsImage"));
        config.addProperty("isMediaTranscodingAvailable", cmsService.isMediaTranscodingServiceAvailable());
        config.addProperty("maxFileSize", configuration.getLongProperty("cms.ext_limits.default"));
        config.addProperty("maxUtilizationPercentageOfClientDisc", configuration.getIntProperty("maxUtilizationPercentageOfClientDisc"));
        config.addProperty("designatedUtilizationPercentageOfClientDisc", configuration.getIntProperty("designatedUtilizationPercentageOfClientDisc"));
        config.add("pollingIntervals", globalGson.toJsonTree(clientConfiguration.getPollingIntervals()));
        config.addProperty("maxSequencesToDownloadPerRequestOnLessonOpen", configuration.getIntProperty("maxSequencesToDownloadPerRequestOnLessonOpen"));
        config.add("availablePdfConverters", globalGson.toJsonTree(EBookConversionServiceTypes.getPdfConversionOptions()));
        config.add("accountModes", globalGson.toJsonTree(publisherService.getAccountModes()));
        config.addProperty("showPublishToUrlConfigurationsInAdmin", configuration.getBooleanProperty("showPublishToUrlConfigurationsInAdmin", false));

        jsonObject.add("configuration", config);
        SimpleCgsUserDetails user = userService.getById(currentUser.getUserId(), true);
        if (user.getExternalId() != null) {// meaning that the user came from an external source (SSO)
            config.remove("logoutPath");
            config.addProperty("logoutPath", clientConfiguration.getExternalLogoutPath());
        }

        jsonObject.add("user", globalGson.toJsonTree(user));

        List<String> rolesThatDontRetrieveAccountData = Arrays.asList("GROUP_ADMIN", "ACCOUNT_ADMIN", "SYSTEM_ADMIN", "T2K_ADMIN");
        int publisherId = currentUser.getRelatesTo().getId();
        // Don't retrieve account data for users that are any kind of admin
        if (publisherId != SUPER_ADMIN_ID && !rolesThatDontRetrieveAccountData.contains(user.getRole().getName())) {
            JsonElement publisher = globalGson.toJsonTree(publisherService.getAccountAuthenticationData(publisherId, true));

            //TODO: remove the part the modifies the publisher's content, and change frontEnd's model. (between the ++++)
            // +++++++++++++++++++++++++++++++++++++++++++
            JsonObject publisherObject = publisher.getAsJsonObject();
            String CUSTOMIZATION_KEY = "customization";
            if (!publisherObject.has(CUSTOMIZATION_KEY)) {
                logger.error("Publisher does not have a customization node");
            }
            JsonObject customization = publisherObject.get(CUSTOMIZATION_KEY).getAsJsonObject();
            for (Map.Entry<String, JsonElement> entry : customization.entrySet()) { //Modify the customization and moves it into the publisher itself
                publisherObject.add(entry.getKey(), entry.getValue());
            }
            publisherObject.remove(CUSTOMIZATION_KEY);
            // +++++++++++++++++++++++++++++++++++++++++++

            jsonObject.add("account", globalGson.toJsonTree(publisherObject));
        }

        return jsonObject.toString();
    }

//    @RequestMapping(value = "standards/{packageName}/subjectAreas/{subjectArea}", method = RequestMethod.GET)
//    public String getStandardsPackage(@PathVariable String packageName,
//                               @PathVariable String subjectArea,
//                               @RequestParam(required = false) String version) throws Exception {
//
//        if (logger.isDebugEnabled()) {
//            logger.debug(String.format("getStandardsPackage packageName: %s, subjectArea: %s", packageName, subjectArea));
//        }
//
//        try {
//            return standardsService.getStandardsPackage(packageName, subjectArea, version);
//        } catch (DsException e) {
//            logger.error("getStandardsPackage error.", e);
//            throw e;
//        }
//    }

    @RequestMapping(value = "/publishers/{publisherId}/skills/{packageName}", method = RequestMethod.GET)
    public String getSkillsPackage(@PathVariable int publisherId, @PathVariable String packageName) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug(String.format("getSkillsPackage publisherId: %d, packageName: %s", publisherId, packageName));
        }

        try {
            return skillsService.getSkillsPackage(publisherId, packageName);
        } catch (DsException e) {
            logger.error("getSkillsPackage error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/ttsproviders", method = RequestMethod.GET)
    public String getTextToSpeechProviders() throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getTestToSpeechProviders");
        }

        return ttsProviderService.getTextToSpeechProviders();

    }
}