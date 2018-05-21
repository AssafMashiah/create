package org.t2k.cgs.domain.usecases;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.applet.AppletData;
import org.t2k.cgs.domain.model.applet.AppletManifest;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.packaging.ContentParseUtil;
import org.t2k.cms.model.CmsLocations;

import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 24/02/13
 * Time: 10:45
 */
public class AppletContentUpdater {
    private static Logger logger = Logger.getLogger(AppletContentUpdater.class);

    private static ObjectMapper mapper = new ObjectMapper();
    public static final String TASK_DATA = "data";
    public static final String APPLET_WRAPPER_TYPE = "appletWrapper";
    public static final String APPLET_TYPE = "applet";
    public static final String THUMBNAIL_ATTR = "thumbnail";
    public static final String ID_ATTR = "id";
    public static final String TYPE_ATTR = "type";
    public static final String APPLET_PATH_ATTR = "appletPath";
    public static final String APPLET_ID_ATTR = "appletId";

    public static void updateResources(BasicDBList resources, List<String> appletIdsToUpdate, AppletManifest appletManifest, TocItemCGSObject tocItem) throws DsException {
        if (resources == null)
            return;
        for (Object resourceObj : resources) {
            DBObject resource = (DBObject) resourceObj;
            Object oldBaseDir = resource.get(ContentParseUtil.RESOURCE_BASE_DIR);
            if (oldBaseDir == null ||
                    !oldBaseDir.toString().startsWith(CmsLocations.APPLETS_LOCATION_PREFIX))
                continue;
            for (String appletId : appletIdsToUpdate) {
                if (!oldBaseDir.toString().contains(appletId))
                    continue;
                AppletData appletData = appletManifest.getApplet(appletId);
                resource.put(ContentParseUtil.RESOURCE_BASE_DIR, appletData.getResources().getBaseDir());
                resource.put(ContentParseUtil.RESOURCE_HREFS, appletData.getResources().getHrefs());
                tocItem.setLastModified(new Date());
                logger.debug("Updating resource " + resource.get(ContentParseUtil.RES_ID) + " from \"" + oldBaseDir + "\" to \"" + resource.get(ContentParseUtil.RESOURCE_BASE_DIR) + "\"");
            }
        }
    }

    public static void updateSequences(List<Sequence> sequences, List<String> appletIds, AppletManifest appletManifest) throws DsException {
        for (Sequence sequence : sequences) {
            logger.debug("Updating sequence  " + sequence.getSeqId());
            updateSequence(sequence, appletIds, appletManifest);
        }
    }

    public static void updateSequence(Sequence sequence, List<String> appletIds, AppletManifest appletManifest) throws DsException {

        String content = sequence.getContent();

        for (String appletId : appletIds) {

            String appletVersion = appletManifest.getApplet(appletId).getVersion();

            // Regex pattern for every path to applet, it created 3 groups:
            // 1. the prefix of the path,
            // 2. version in the path
            // 3. the character after the version in the path
            //
            // This is then replace by the matched group 1 (represented as $1 in the replace)
            // then the new version and then the matched group 3 (represented as $3 in the replace)
            // effectively only replacing the version in every matched path
            Pattern replacePattern = Pattern.compile("(applets\\/" + appletId + "\\/)(\\d+.\\d+)");
            Matcher replaceMatcher = replacePattern.matcher(content);
            content = replaceMatcher.replaceAll("$1" + appletVersion );

        }

        sequence.setContent(content);

    }

    static private final String START_XML_APPLET_TAG = "<applet path=\"";
    static private final String END_XML_APPLET_TAG = "\">";

    /*never used*/
    public static String updateConvertedData(String origConvertedData, List<String> appletIds, AppletManifest appletManifest) {
        StringBuilder sb = new StringBuilder();
        int startPos = 0;
        int endPos = origConvertedData.indexOf(START_XML_APPLET_TAG);   //start tag
        while (endPos >= 0) {
            // search for <applet path="/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.1\">
            sb.append(origConvertedData.substring(startPos, endPos));
            sb.append(START_XML_APPLET_TAG);
            startPos = endPos + START_XML_APPLET_TAG.length();
            endPos = origConvertedData.indexOf(END_XML_APPLET_TAG, startPos); // end tag
            if (endPos < 0)
                break;
            String appletPath = origConvertedData.substring(startPos, endPos);
            String[] split = appletPath.split("/");
            String appletGuid = split[2];
            for (String appletId : appletIds) {
                if (!appletGuid.equals(appletId))
                    continue;
                AppletData appletData = appletManifest.getApplet(appletId);
                String newPath = "/" + appletData.getResources().getBaseDir();
                appletPath = newPath;
            }
            sb.append(appletPath);
            sb.append(END_XML_APPLET_TAG);
            startPos = endPos + END_XML_APPLET_TAG.length();

            endPos = origConvertedData.indexOf(START_XML_APPLET_TAG, startPos);   //start tag
        }
        sb.append(origConvertedData.substring(startPos));
        return sb.toString();
    }

}
