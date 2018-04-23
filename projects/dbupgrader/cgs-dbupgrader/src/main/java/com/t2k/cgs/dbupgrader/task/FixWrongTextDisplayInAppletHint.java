package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by elad.avidan on 30/07/2014.
 */
public class FixWrongTextDisplayInAppletHint extends SequenceUpdate {

    private static Logger logger = Logger.getLogger(FixWrongTextDisplayInAppletHint.class);
    private final String WIDTH_VALUE = "773px";
    private final String HINT = "hint";
    private final String PROGRESS = "progress";
    private final String APPLET_TASK = "appletTask";
    private final String STYLE_ATTRIBUTE = "style";
    private List<String> elementsIdsToModifyInContentData = new ArrayList<String>();
    private final List<String> regexes = new ArrayList<String>() {{
        add(WIDTH_VALUE);
        add(APPLET_TASK);
        add("<div");
    }};

    @Override
    public DBCursor getSequencesToScan() {
        if (logger.isDebugEnabled()) {
            String message = "FixWrongTextDisplayInAppletHint. About to scan for div elements in applets hint with style attributes and modify if needed.";
            System.out.println(message);
            logger.debug(message);
        }

        return migrationDao.getSequencesDbObjectsCursor();
    }

    @Override
    public Boolean sequenceContentNeedsModification(JSONObject contentJson) throws JSONException {
        Iterator keys = contentJson.keys();
        while (keys.hasNext()) {
            String taskID = keys.next().toString();
            JSONObject subSequence = contentJson.getJSONObject(taskID);
            if (getSubSequenceType(subSequence).equals(TEXT_VIEWER_TYPE) && hasRequiredParents(contentJson, subSequence.getString("id"))) {
                if (subSequence.getJSONObject("data").has("title")) {
                    String title = subSequence.getJSONObject("data").getString("title");
                    if (isTitleContainsDivWithWidthPropertyInStyleAttribute(title)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Checks if the sub-sequence that matches the given subSequenceId has all the required parents.
     * @param contentJson - The full sequence json content that holds all its sub-sequences.
     * @param subSequenceId - The id of the sub-sequence we want to validate its parents types.
     * @return True if the sub-sequence has the required parents. Otherwise, false.
     * @throws JSONException
     */
    private boolean hasRequiredParents(JSONObject contentJson, String subSequenceId) throws JSONException {
        JSONObject subSequence = contentJson.getJSONObject(subSequenceId);
        if (hasParent(contentJson, subSequence.getString("parent"), HINT)) {
            subSequence = contentJson.getJSONObject(subSequence.getString("parent"));
            if (hasParent(contentJson, subSequence.getString("parent"), PROGRESS)) {
                subSequence = contentJson.getJSONObject(subSequence.getString("parent"));
                if (hasParent(contentJson, subSequence.getString("parent"), APPLET_TASK)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if the sub-sequence that matches the given subSequenceId has a parent that matches the given parent.
     * @param contentJson - The full sequence json content that holds all its sub-sequences.
     * @param subSequenceId - The id of the sub-sequence we want to validate its parent type.
     * @param parentType - The type of the sub-sequence's parent.
     * @return True if the sub-sequence has the required parent type. Otherwise, false.
     * @throws JSONException
     */
    private boolean hasParent(JSONObject contentJson, String subSequenceId, String parentType) throws JSONException {
        if (contentJson.has(subSequenceId)) {
            JSONObject subSequence = contentJson.getJSONObject(subSequenceId);
            if (subSequence.get("type").equals(parentType)) {
                return true;
            }
        }
        return false;
    }

    private boolean isTitleContainsDivWithWidthPropertyInStyleAttribute(String title) {
        Document titleXml = Jsoup.parseBodyFragment(title);
        for (Node child : titleXml.body().getElementsByTag(DIV)) {
            if (child.attributes().hasKey(STYLE_ATTRIBUTE) && child.attributes().get(STYLE_ATTRIBUTE).contains(WIDTH_VALUE)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void modifyContentDataWithoutConvertedData(JSONObject contentJson) throws JSONException {
        Iterator keys = contentJson.keys();
        while (keys.hasNext()) { // iterating over all items in 'contentData'
            String taskID = keys.next().toString();
            JSONObject subSequence = contentJson.getJSONObject(taskID);
            if (getSubSequenceType(subSequence).equals(TEXT_VIEWER_TYPE) && hasRequiredParents(contentJson, subSequence.getString("id"))) {
                String title = subSequence.getJSONObject("data").getString("title");
                if (isTitleContainsDivWithWidthPropertyInStyleAttribute(title)) {
                    Document titleXml = Jsoup.parse(title);
                    titleXml.outputSettings(new Document.OutputSettings().prettyPrint(false)); // We need this in order to avoid new lines in the returned Document object.
                    if (modifyDivsContainsFontSizeOfStyleAttribute(titleXml)) {
                        this.elementsIdsToModifyInContentData.add(subSequence.getString("id"));
                        subSequence.getJSONObject("data").put("title", titleXml.body().html());
                    }
                }
            }
        }
    }

    private boolean modifyDivsContainsFontSizeOfStyleAttribute(Document doc) {
        Elements divs = doc.getElementsByTag(DIV);
        Boolean xmlChanged = changeStyleAttributeWidthInRequiredDivs(divs);
        return xmlChanged;
    }

    private boolean changeStyleAttributeWidthInRequiredDivs(Elements divs) {
        boolean xmlChanged = false;
        String widthValue = String.format("width: %s;", WIDTH_VALUE);
        for (Element div : divs) {
            if (div.attributes().hasKey(STYLE_ATTRIBUTE) && div.attributes().get(STYLE_ATTRIBUTE).contains(String.format("width: %s;", WIDTH_VALUE))) {
                List<Attribute> attributes = div.attributes().asList();
                for (Attribute attribute : attributes) {
                    if (attribute.getKey().equals(STYLE_ATTRIBUTE)) {
                        String value = attribute.getValue();
                        attribute.setValue(value.replace(widthValue, "width: 100%;"));
                        xmlChanged = true;
                    }
                }
            }
        }
        return xmlChanged;
    }

    @Override
    public boolean modifyConvertedData(Document doc) {
        Boolean xmlChanged = false;
        for (String elementId : this.elementsIdsToModifyInContentData) {
            Elements elementsToModify = doc.getElementsByAttributeValue("id", elementId); // There's more than one div element with id attribute that match this elementId
            for (Element element : elementsToModify) {
                Elements divs = element.children().select(DIV);
                if (changeStyleAttributeWidthInRequiredDivs(divs)) {
                    xmlChanged = true;
                }
            }
        }
        return xmlChanged;
    }
}
