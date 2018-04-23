package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by elad.avidan on 27/07/2014.
 */
public class FixContentSpanStyleOfFillingTheGaps extends SequenceUpdate {

    private static Logger logger = Logger.getLogger(FixContentSpanStyleOfFillingTheGaps.class);

    private final String CONTENT_SPAN_STYLE = "<span style=\\\\\\\"font-size: 22px;\\\\\\\">";
    private final String ANSWER_FIELD_TYPE_TEXT = "AnswerFieldTypeText";
    private final String STYLE_ATTRIBUTE = "style";

    private List<String> elementsTextToModifyInContentData = new ArrayList<String>();

    @Override
    public DBCursor getSequencesToScan() {
        if (logger.isDebugEnabled()) {
            String message = "FixContentSpanStyleOfFillingTheGaps. About to scan for span elements in \"Filling The Gaps\" with style attributes and modify if needed.";
            System.out.println(message);
            logger.debug(message);
        }
        return migrationDao.getSequencesWithContentContaining(CONTENT_SPAN_STYLE);
    }

    @Override
    public Boolean sequenceContentNeedsModification(JSONObject contentJson) throws JSONException {
        Iterator keys = contentJson.keys();
        while (keys.hasNext()) {
            String taskID = keys.next().toString();
            JSONObject subSequence = contentJson.getJSONObject(taskID);
            if ((getSubSequenceType(subSequence).equals(TEXT_VIEWER_TYPE) || getSubSequenceType(subSequence).equals(ANSWER_FIELD_TYPE_TEXT)) && hasClozeParent(contentJson, subSequence.getString("id"))) {
                if (subSequence.getJSONObject("data").has("title")) {
                    String title = subSequence.getJSONObject("data").getString("title");
                    if (isTitleContainsSpanWithStyleAttribute(title)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private boolean isTitleContainsSpanWithStyleAttribute(String title) {
        Document titleXml = Jsoup.parseBodyFragment(title);
        for (Node child : titleXml.body().getElementsByTag(SPAN)) {
            if (child.attributes().hasKey(STYLE_ATTRIBUTE) && child.attributes().get(STYLE_ATTRIBUTE).contains("font-size: 22px;")) {
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
            if ((getSubSequenceType(subSequence).equals(TEXT_VIEWER_TYPE) || getSubSequenceType(subSequence).equals(ANSWER_FIELD_TYPE_TEXT)) && hasClozeParent(contentJson, subSequence.getString("id"))) {
                String title = subSequence.getJSONObject("data").getString("title");
                if (isTitleContainsSpanWithStyleAttribute(title)) {
                    Document titleXml = Jsoup.parse(title);
                    titleXml.outputSettings(new Document.OutputSettings().prettyPrint(false)); // We need this in order to avoid new lines in the returned Document object.
                    modifySpanContainsFontSizeOfStyleAttribute(titleXml);
                    subSequence.getJSONObject("data").put("title",titleXml.body().html());
                }
            }
        }
    }

    @Override
    public boolean modifyConvertedData(Document doc) {
        Boolean xmlChanged = false;
        for (String elementText : this.elementsTextToModifyInContentData) {
            Elements elementsToModify = doc.getElementsContainingOwnText(elementText);
            for (Element element : elementsToModify) {
                if (element.tagName().equals(SPAN) && removeStyleAttributeFromRequiredSpan(element)) {
                    xmlChanged = true;
                }
            }
        }
        return xmlChanged;
    }

    private boolean modifySpanContainsFontSizeOfStyleAttribute(Document doc) {
        Boolean xmlChanged = false;
        Elements spans = doc.getElementsByTag(SPAN);
        xmlChanged = removeStyleAttributeFromRequiredSpans(spans);
        return xmlChanged;
    }

    private boolean removeStyleAttributeFromRequiredSpans(Elements spans) {
        boolean xmlChanged = false;
        for (Element span : spans) {
            if (span.attributes().hasKey(STYLE_ATTRIBUTE) && span.attributes().get(STYLE_ATTRIBUTE).equals("font-size: 22px;")) {
                span.attributes().remove(STYLE_ATTRIBUTE);
                this.elementsTextToModifyInContentData.add(span.text());
                xmlChanged = true;
            }
        }
        return xmlChanged;
    }

    private boolean removeStyleAttributeFromRequiredSpan(Element span) {
        boolean xmlChanged = false;
        if (span.attributes().hasKey(STYLE_ATTRIBUTE) && span.attributes().get(STYLE_ATTRIBUTE).equals("font-size: 22px;")) {
            span.attributes().remove(STYLE_ATTRIBUTE);
            xmlChanged = true;
        }

        return xmlChanged;
    }

    private boolean hasClozeParent(JSONObject contentJson, String subSequenceId) throws JSONException {
        JSONObject subSequence = null;
        while (contentJson.has(subSequenceId)) {
            subSequence = contentJson.getJSONObject(subSequenceId);
            if (subSequence.get("type").equals("cloze"))
                return true;
            else {
                subSequenceId = subSequence.getString("parent");
            }
        }
        return false;
    }
}
