package org.t2k.cgs.bundles;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.DirectoryFileFilter;
import org.apache.commons.io.filefilter.RegexFileFilter;
import org.apache.log4j.Logger;
import org.jgrapht.alg.CycleDetector;
import org.jgrapht.graph.DefaultDirectedGraph;
import org.jgrapht.graph.DefaultEdge;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.bundles.BundlesDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.model.bundle.Bundle;
import org.t2k.cgs.model.bundle.Plugin;
import org.t2k.cgs.cms.CmsService;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.cgs.utils.ZipHelper;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipInputStream;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 06/08/14
 * Time: 09:38
 */
@Service
public class BundlesDataServiceImpl implements BundlesDataService {

    private Logger logger = Logger.getLogger(BundlesDataServiceImpl.class);

    @Autowired
    private BundlesDao bundlesDao;

    private final ArrayList<String> MIME_TYPE_FILES = new ArrayList<>(Arrays.asList("application/zip", "application/octet-stream", "application/x-zip-compressed"));

    // the temporary directory the bundle files will be extracted (define inside t2k.properties)
    private final String PLUGINS_TEMPORARY_DIR_KEY = "pluginsTempDir";

    // each plugins has a manifest file names manifest.json
    private final String MANIFEST_FILE_NAME = "manifest.json";

    // each plugins has a index.html file
    private final String INDEX_JS_FILE_NAME = "index.js";

    // manifest for the bundle container
    private final String PLUGINS_DIRECTORY = "plugins";
    private final String BUNDLE_MANIFEST_NAME = "bundle.json";
    private final String DUPLICATE_BUNDLE_VERSION_ERROR = "bundles.duplicate_version";
    private final String BUNDLE_OLD_VERSION_ERROR = "bundles.old_version";
    private final String BUNDLES_INTERNAL_ERROR = "bundles.internal_error";

    // manifest properties
    private final String NAME = "name";
    private final String FOLDER = "folder";
    private final String DEPENDENCIES = "dependencies";

    @Autowired
    private CmsService cmsService;

    @Override
    public void validateAndSave(int publisherId, FileItem fileItem) throws DsException, IOException {
        validateUploadedFileMimeTypeAndHasFormField(fileItem);
        logger.info(String.format("Basic file validation passed for file: %s", fileItem.getName()));

        // generate uuid for bundle's temp file name
        String uuid = UUID.randomUUID().toString();

        // create temp zip file
        String bundleDestinationZipFilePath = String.format("%s/%s.zip", getTempPluginsLocation(), uuid);

        // create the bundle temp folder
        createBundlesTempResourcesFolder(fileItem.getName());

        // transform the uploaded file into a file on file system
        File bundleTempFile = new File(bundleDestinationZipFilePath);
        FileUtils.copyInputStreamToFile(fileItem.getInputStream(), bundleTempFile);

        try {
            // perform save and add bundle to DB using the file passed from client
            save(publisherId, bundleTempFile);
        } catch (Exception e) {
            logger.error(String.format("Error saving bundle zip file %s.", bundleTempFile.getAbsolutePath()), e);
            throw e;
        } finally {
            if (bundleTempFile.exists()) {
                boolean deleteSuccess = FileUtils.deleteQuietly(bundleTempFile);
                if (deleteSuccess) {
                    logger.info(String.format("Deleted bundle zip file from path: %s", bundleTempFile.getAbsolutePath()));
                } else {
                    logger.error(String.format("Error deleting bundle zip file from path: %s", bundleTempFile.getAbsolutePath()));
                }
            }
        }
    }

    public void save(int publisherId, File bundleFile) throws DsException, IOException {
        createPublisherBundlesFolderIfNecessary(publisherId);

        // get the bundle manifest
        Bundle manifest = getBundleManifest(bundleFile, publisherId);

        // validate manifest
        validateBundleManifest(publisherId, manifest);

        String extractDirectory = String.format("%s/%s", getBundleDirectory(publisherId, manifest.getId()), manifest.getVersion());
        String filename = bundleFile.getName();
        try {
            unzipBundleFileToPluginsDirectory(bundleFile, extractDirectory);
            logger.info(String.format("Unzipped bundle file: %s into folder: %s.", filename, bundleFile.getAbsolutePath()));
            validateBundleDirectoriesStructure(extractDirectory);
            validateBundleDependencies(extractDirectory);
            logger.debug(String.format("Bundle dependencies validation passed for bundle: %s.", filename));
            try {
                bundlesDao.save(manifest);
                logger.info(String.format("Saved bundle to DB completed. Bundle info: %s", manifest.toString()));
            } catch (DaoException e) {
                logger.error(String.format("Error saving bundle %s into DB.", filename), e);
                throw new ValidationException(ErrorCodes.INTERNAL_SERVER_ERROR, BUNDLES_INTERNAL_ERROR);
            }
        }
        catch (DsException e) { // rethrowing DsExceptions
            throw e;
        }
        catch (Exception e) {
            logger.error(String.format("Saving bundle %s, for account %d failed. deleting temp files from directory %s.", manifest.getId(), manifest.getAccountId(), extractDirectory));
            deleteBundleFiles(extractDirectory);
            throw new DsException(e);
            // throw new VA(message,e);
        }

        logger.info(String.format("Uploading and saving bundle file: %s into file system and DB completed successfully", filename));
    }

    private void validateBundleDirectoriesStructure(String bundleDirectory) throws ValidationException {
        File bundleFolder = new File(bundleDirectory);
        // validate base dir contains bundle.json
        if (!(new File(bundleFolder, BUNDLE_MANIFEST_NAME)).exists()) {
            String m = String.format("%s is missing from bundle folder %s.", BUNDLE_MANIFEST_NAME, bundleDirectory);
            logger.error(m);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, m);
        }

        // validate plugins dir exists
        if (!(new File(bundleFolder, PLUGINS_DIRECTORY)).exists()) {
            String m = String.format("%s directory is missing from bundle folder %s.", PLUGINS_DIRECTORY, bundleDirectory);
            logger.error(m);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, m);
        }

        validateManifestJsonExistsInPluginFolders(new File(bundleFolder, PLUGINS_DIRECTORY));
    }

    private void validateManifestJsonExistsInPluginFolders(File pluginDir) throws ValidationException {
        File[] pluginFolders = pluginDir.listFiles();
        if (pluginFolders == null) {
            String errorMsg = "Plugins directory is empty.";
            logger.error(errorMsg);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, errorMsg);
        }

        for (File folder : pluginFolders) {  // all files and folders inside dir
            if (folder.isDirectory() && folder.listFiles() != null) {    // validate every plugin dir contains manifest.json
                for (File innerfolder : folder.listFiles()) {
                    if (!(new File(innerfolder, MANIFEST_FILE_NAME)).exists()) {
                        String m = String.format("%s is missing from plugin folder %s.", MANIFEST_FILE_NAME, folder.getName());
                        logger.error(m);
                        throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, m);
                    }
                }
            }
        }
    }

    private void createBundlesTempResourcesFolder(String filename) throws DsException {
        // get handle for bundle resources directory
        File resourcesDir = new File(getTempPluginsLocation());

        // if the resource directory isn't exists - create it
        if (!resourcesDir.exists()) {
            try {
                if (resourcesDir.mkdirs()) {
                    logger.debug(String.format("Created directory %s for bundle: %s.", resourcesDir.getAbsolutePath(), filename));
                } else {
                    String message = String.format("Could not create directory %s for bundle: %s.", resourcesDir.getAbsolutePath(), filename);
                    logger.error(message);
                    throw new DsException(message);
                }
            } catch (SecurityException e) {
                String message = String.format("Error creating directory %s on file system for bundle: %s.", resourcesDir.getAbsolutePath(), filename);
                logger.error(message, e);
                throw new DsException(message, e);
            }
        }
    }

    private void validateBundleManifest(int publisherId, Bundle manifest) throws ValidationException {
        try {
            Float.parseFloat(manifest.getVersion());
        } catch (NumberFormatException e) {
            String message = String.format("Invalid bundle version: %s from bundle zip. bundle details: %s.", manifest.getVersion(), manifest.toString());
            logger.error(message);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, message, e);
        }

        try {
            logger.debug(String.format("Starting to validate bundle file: %s.", manifest.getName()));
            validateBundleVersionIsBiggerThanCurrentVersion(publisherId, manifest.getId(), manifest.getVersion());
            logger.debug(String.format("Completed bundle validation for file: %s.", manifest.getName()));
        } catch (ValidationException e) {
            logger.error(String.format("Error validating bundle: %s.", manifest.getName()), e);
            throw e;
        } catch (DaoException e) {
            logger.error(String.format("Error accessing bundles DB, in the validating bundle process: %s.", manifest.getName()), e);
            throw new ValidationException(ErrorCodes.INTERNAL_SERVER_ERROR, BUNDLES_INTERNAL_ERROR);
        }
    }

    private void createPublisherBundlesFolderIfNecessary(int publisherId) throws DsException {
        File basePluginsDirectory = new File(getPublisherBundleDirectoryPath(publisherId));
        if (!basePluginsDirectory.exists()) {
            try {
                FileUtils.forceMkdir(basePluginsDirectory);
            } catch (IOException e) {
                throw new DsException(String.format("Could not create plugin directory in publisher's directory: %s", basePluginsDirectory.getAbsoluteFile()), e);
            }
        }
    }

    /**
     * Gets the temp directory for the zipped bundles
     * @return the temp directory for the zipped bundles
     */
    private String getTempPluginsLocation() {
        return String.format("%s/%s", cmsService.getTmpLocation(), PLUGINS_TEMPORARY_DIR_KEY);
    }

    @Override
    public String getPublisherBundleDirectoryPath(int publisherId) {
        //return the bundles directory to extract to
        return String.format("%s/publishers/%d/plugins", cmsService.getCmsLocation(), publisherId);
    }

    @Override
    public void validateUploadedFileMimeTypeAndHasFormField(FileItem file) throws DsException {
        logger.info(String.format("Validating plugin for file: %s.", file.getName()));

        String contentType = file.getContentType();
        if (!MIME_TYPE_FILES.contains(contentType)) {
            logger.error(String.format("Error validating plugin for file: %s. Invalid mime-type: %s.", file.getName(), contentType));
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, String.format("Error validating plugin for file: %s. Invalid mime-type: %s.", file.getName(), contentType));
        }

        if (file.isFormField()) {
            // Process regular form field (input type="text|radio|checkbox|etc", select, etc).
            String errorMsg = String.format("Bundle upload form is an invalid format. Form contains field %s with value %s.\nshould not contain any fields except the file itself", file.getFieldName(), file.getString());
            logger.error(errorMsg);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, errorMsg);
        }

        // Process form file field (input type="file").
        logger.info(String.format("Saving bundle start for bundle from file: %s.", file.getName()));
    }

    @Override
    public void deleteBundle(int publisherId, String bundleId) throws IOException {
        logger.info(String.format("Starting to remove bundle %s for publisher %d.", bundleId, publisherId));
        deleteBundleFiles(getBundleDirectory(publisherId, bundleId));
        bundlesDao.remove(publisherId, bundleId);
        logger.info(String.format("Removed bundle %s for publisher %d.", bundleId, publisherId));
    }

    @Override
    public String getBundleDirectory(int publisherId, String bundleId) {
        return String.format("%s/%s", getPublisherBundleDirectoryPath(publisherId), bundleId);
    }

    @Override
    public List<Bundle> getBundlesByAccountId(int publisherId) {
        try {
            return bundlesDao.getByAccountId(publisherId);
        } catch (DaoException e) {
            logger.error(String.format("Error getting bundles by accountId %d.", publisherId), e);
            return null;
        }
    }

    @Override
    public List<Bundle> getByAccountId(int accountId) throws DsException {
        try {
            return bundlesDao.getByAccountId(accountId);
        } catch (Exception e) {
            throw new DsException(e);
        }
    }

    @Override
    public Bundle getByAccountId(int publisherId, String bundleName) throws DsException {
        try {
            return bundlesDao.getByAccountId(publisherId, bundleName);
        } catch (Exception e) {
            throw new DsException(e);
        }
    }

    @Override
    public void deleteOldBundlesFolders(int xDaysAgo) throws DsException {
        logger.debug(String.format("deleteOldBundlesFolders. About to delete folders of bundles which their versions had expired %d days ago.", xDaysAgo));
        Date beforeDate = new DateTime().minusDays(xDaysAgo).toDate();
        Date afterDate = new DateTime().minusDays(xDaysAgo + 1).toDate();
        int counter = 0;
        try {
            List<Bundle> bundlesCreatedBeforeDate = bundlesDao.getBundlesCreatedBetweenDates(afterDate, beforeDate);
            for (Bundle bundle : bundlesCreatedBeforeDate) {
                String bundleDirectoryPath = getBundleDirectory(bundle.getAccountId(), bundle.getId());
                File bundleDirectory = new File(bundleDirectoryPath);
                if (!bundleDirectory.exists()) {
                    continue;
                }

                for (File bundleVersionDir : bundleDirectory.listFiles()) {
                    if (!bundleVersionDir.getName().equals(bundle.getVersion())) {
                        FileUtils.deleteDirectory(bundleVersionDir);
                        counter++;
                    }
                }
            }
        } catch (Exception e) {
            throw new DsException(e);
        }

        logger.debug(String.format("deleteOldBundlesFolders. Finished to delete %d folders of bundles which their versions had expired.", counter));
    }

    // return generic mapped json by class using jackson object mapper
    public <T> T getMappedJson(String json, Class<T> mapType) throws JSONException, IOException {
        return new ObjectMapper().readValue(json, mapType);
    }

    // map the bundle manifest json to bundle model
    public Bundle getBundleManifest(File bundleTempFile, int publisherId) throws DsException, IOException {
        String manifestJson;
        try {
            ZipFile zipFile = new ZipFile(bundleTempFile);
            ZipArchiveEntry manifest = zipFile.getEntry(BUNDLE_MANIFEST_NAME);
            if (manifest == null) {
                String m = String.format("Could not find manifest file in bundle zip %s, publisher ID: %d", bundleTempFile, publisherId);
                logger.error(m);
                throw new DsException(m);
            }

            try (InputStream manifestFileInputStream = zipFile.getInputStream(manifest)) {   // after opening the inputstream (on "try"), we want to close it on finally.
                manifestJson = new JSONObject(IOUtils.toString(manifestFileInputStream)).toString();
            } catch (JSONException e) {
                throw new DsException(e);
            } catch (ZipException ze) {
                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, "Zip file compression type is not supported, please use deflate or stored compression methods.", ze);
            } finally {
                zipFile.close();
            }
        } catch (IOException e) {
            logger.error(String.format("Error reading bundle zip file from path: %s, accountId %d.", bundleTempFile, publisherId), e);
            throw new DsException(e);
        }

        if (manifestJson == null) {
            String message = String.format("No bundle.json is found for plugin: %s, accountId %d.", bundleTempFile, publisherId);
            logger.error(message);
            throw new DsException(message);
        }

        Bundle bundleManifest;
        try {
            bundleManifest = getMappedJson(manifestJson, Bundle.class);
        } catch (JSONException | IOException e) {
            throw new DsException(e);
        }

        List<Plugin> plugins = new ArrayList<>();
        FileInputStream bundleTempFileInputStream = null;
        ZipInputStream zipInputStream = null;
        try {
            bundleTempFileInputStream = new FileInputStream(bundleTempFile);
            zipInputStream = new ZipInputStream(bundleTempFileInputStream);
            createPluginList(zipInputStream, plugins, bundleManifest);
        } catch (IOException | JSONException e) {
            throw new DsException(e);
        } finally {
            if (bundleTempFileInputStream != null) { // close input stream
                bundleTempFileInputStream.close();
            }
            if (zipInputStream != null) { // close input stream
                zipInputStream.close();
            }
        }

        bundleManifest.setAccountId(publisherId);
        bundleManifest.setPlugins(plugins);
        return bundleManifest;
    }

    /**
     * This method check for cycles inside the plugins manifest dependencies for example:
     * x -> v
     * v -> c
     * c -> x
     * The method also check for missing dependencies and validate also that every plugin has name inside it
     *
     * @param bundleDirectory - directory contains bundles
     * @throws ValidationException
     * @throws IOException
     * @throws JSONException
     */
    private void validateBundleDependencies(String bundleDirectory) throws ValidationException, IOException, JSONException {
        Collection<File> bundleFiles = FileUtils.listFiles(new File(bundleDirectory), new RegexFileFilter(MANIFEST_FILE_NAME), DirectoryFileFilter.DIRECTORY);
        DefaultDirectedGraph<String, DefaultEdge> dependencies = new DefaultDirectedGraph<>(DefaultEdge.class);
        HashMap<String, List<Object>> pluginsDependencies = new HashMap<>();
        for (File bundleFile : bundleFiles) {
            JSONObject manifestJson;
            try (FileInputStream fis = new FileInputStream(bundleFile)) { // anyway - the FileInputStream will be closed after this operation
                manifestJson = new JSONObject(IOUtils.toString(fis));
            }
            List<Object> pluginDependencies;
            String pluginName;

            try {
                pluginName = (String) manifestJson.get(NAME);
            } catch (JSONException e) {
                String message = String.format("Error validating dependencies for bundle in directory: %s: No name to plugin", bundleDirectory);
                logger.error(message, e);
                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, "No name to plugin");
            }

            try {
                if (!manifestJson.has(DEPENDENCIES)) {
                    continue;
                }
                JSONArray pluginDependenciesJsonArray = ((JSONArray) manifestJson.get(DEPENDENCIES));
                pluginDependencies = Arrays.asList(pluginDependenciesJsonArray.toArray(new String[pluginDependenciesJsonArray.length()]));
                pluginsDependencies.put(pluginName, pluginDependencies);
            } catch (JSONException e) {
                logger.error(String.format("error while calculating plugin dependencies for plugin: %s", pluginName), e);
            } finally {
                dependencies.addVertex(pluginName);
            }
        }

        Set<String> pluginsNames = pluginsDependencies.keySet();

        // validate that all plugins exists in graph
        for (String pluginName : pluginsNames) {
            if (!dependencies.containsVertex(pluginName)) {
                String msg = String.format("Could not find a file for plugin %s, dependencies validation failed.", pluginName);
                logger.error(msg);
                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, msg);
            }
        }

        // validate that all plugins that other plugins depends on, that this plugin depends on exist in graph
        for (Map.Entry<String, List<Object>> dependenciesList : pluginsDependencies.entrySet()) {
            for (Object pluginName : dependenciesList.getValue()) {
                if (!dependencies.containsVertex((String) pluginName)) {
                    String msg = String.format(String.format("Plugin %s is missing one of the plugins that it depends on. Missing plugin: %s", dependenciesList.getKey(), pluginName));
                    logger.error(msg);
                    throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, msg);
                }
            }
        }

        // add an edge between every plugin and the plugin that it is depends upon
        for (Map.Entry<String, List<Object>> dependenciesList : pluginsDependencies.entrySet()) {
            String basePlugin = dependenciesList.getKey();
            if (dependenciesList.getValue() != null) {
                for (Object pluginToDependUpon : dependenciesList.getValue()) {
                    dependencies.addEdge(basePlugin, (String) pluginToDependUpon);
                }
            }
        }

        CycleDetector<String, DefaultEdge> cycleDetector = new CycleDetector<>(dependencies);
        if(cycleDetector.detectCycles())  {
            String message = String.format("Error validating dependencies for bundle in directory: %s: Detected circular references.", bundleDirectory);
            logger.error(message);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, "bundles.dependencies");
        }
    }

    private void createPluginList(ZipInputStream zipInputStream, List<Plugin> plugins, Bundle manifest) throws IOException, JSONException {
        for (ZipEntry zip_e = zipInputStream.getNextEntry(); zip_e != null; zip_e = zipInputStream.getNextEntry()) {
            if (Paths.get(zip_e.getName()).getFileName().toString().equals(MANIFEST_FILE_NAME)) {
                JSONObject pluginJson = new JSONObject(IOUtils.toString(zipInputStream));
                JSONObject filteredJson = new JSONObject();

                filteredJson.put(NAME, pluginJson.get(NAME));
                filteredJson.put(FOLDER, String.format("plugins/%s", pluginJson.getString(NAME).replace(":", "/")));

                Plugin plugin = getMappedJson(filteredJson.toString(), Plugin.class);
                plugins.add(plugin);
            } else if (zip_e.isDirectory()) {
                createPluginList(zipInputStream, plugins, manifest);
            }
        }
    }

    /**
     * compares the currentVersion to newVerstion,
     * returns:
     * 1 if currentVersion > newVersion
     * 0 if  currentVersion ==  newVersion
     * -1 if  currentVersion <  newVersion
     *
     * @param currentVersion - string to represent current version on server
     * @param newVersion     - string representing new version
     * @return 1 if currentVersion > newVersion
     *         0 if  currentVersion ==  newVersion
     *         -1 if  currentVersion <  newVersion
     */
    public Integer versionCompare(String currentVersion, String newVersion) {
        float currentVersionFloat;
        float newVersionFloat;
        try {
            currentVersionFloat = Float.parseFloat(currentVersion);
            newVersionFloat = Float.parseFloat(newVersion);
        } catch (NumberFormatException e) {
            logger.error(String.format("Invalid bundle version: %s from bundle zip.", newVersion));
            throw e;
        }

        return Float.compare(currentVersionFloat, newVersionFloat);
    }

    public void validateBundleVersionIsBiggerThanCurrentVersion(int accountId, String bundleId, String newVersion) throws ValidationException, DaoException {
        Bundle bundle = bundlesDao.getByAccountId(accountId, bundleId);
        if (bundle != null) {
            String currentVersion = bundle.getVersion();
            Integer versionsCompare = versionCompare(currentVersion, newVersion);

            if (versionsCompare > 0) {
                logger.error(String.format("Current bundle %s version %s is greater than the new version %s", bundle, currentVersion, newVersion));
                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, BUNDLE_OLD_VERSION_ERROR);
            } else if (versionsCompare == 0) {
                logger.error(String.format("Current bundle %s version %s equals to the new version %s", bundle, currentVersion, newVersion));
                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, DUPLICATE_BUNDLE_VERSION_ERROR);
            }
        }
    }

    public void unzipBundleFileToPluginsDirectory(File zipFile, String destination) throws IOException {
        ZipHelper.decompressZipFile(zipFile.getAbsolutePath(), destination);
    }

    public void deleteBundleFiles(String bundleDirectory) throws IOException {
        try {
            File bundlesDirectoryFile = new File(bundleDirectory);
            if (!bundlesDirectoryFile.exists()) {
                logger.info(String.format("Bundles directory %s does not exist and could not be deleted", bundleDirectory));
                return;
            }
            FileUtils.deleteDirectory(new File(bundleDirectory));
            logger.info(String.format("Deleted bundle directory: %s.", bundleDirectory));
        } catch (IOException e) {
            logger.error(String.format("Error deleting bundle directory: %s.", bundleDirectory), e);
            throw e;
        }
    }
}