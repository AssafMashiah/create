package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.google.common.collect.Lists;
import com.mongodb.DBCursor;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.parser.Tag;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 13/07/14
 * Time: 16:26
 */
public class FixParagraphsOutsideDivsInTextViewer extends SequenceUpdate {

    public final String CONVERTED_DATA_KEY = "convertedData";
    public final String DIV = "div";
    public final String SPAN = "span";
    public final String TEXT_VIEWER_TYPE = "textViewer";
    public final String INLINE_SOUND_TYPE = "inlineSound";
    private static Logger logger = Logger.getLogger(FixParagraphsOutsideDivsInTextViewer.class);


    /**
     * returns a cursor of the the smallest collection of sequences to be scanned.
     * The smaller the cursor.size() is -> the faster the script will run.
     * For example - returns only sequences that are connected to a specific course
     *
     * @return
     */
    @Override
    public DBCursor getSequencesToScan() {
        return migrationDao.getSequencesWithContentContaining(INLINE_SOUND_TYPE); //return all sequences that has inline sounds
    }

    /**
     * Checks the sequence's content json, returns true iff this is a sequence that needs modification \ further investigation
     *
     * @param contentJson
     * @return
     * @throws JSONException
     */
    public Boolean sequenceContentNeedsModification(JSONObject contentJson) throws JSONException {

        Iterator keys = contentJson.keys();
        Boolean sequenceHasATextViewerWithTextOutsideDiv = false;    // check if the json has clozeBank element
        Boolean sequenceHasInlineSound = false;    // check if the json has inlineSound element
        while (keys.hasNext()) {    //iterating over all items in 'content'
            String taskID = keys.next().toString();
            JSONObject subSequence = contentJson.getJSONObject(taskID);
            if (sequenceHasATextViewerWithTextOutsideDiv && sequenceHasInlineSound)
                break;

            if (getSubSequenceType(subSequence).equals(TEXT_VIEWER_TYPE)) {   // looking over the instruction nodes
                if (subSequence.getJSONObject("data").has("title")) {
                    String title = subSequence.getJSONObject("data").getString("title");
                    if (textViewerTitleContainsTextOutsideADiv(title)) {
                        sequenceHasATextViewerWithTextOutsideDiv = true;

                    }
                }
            }
            else if (getSubSequenceType(subSequence).equals(INLINE_SOUND_TYPE)){
                sequenceHasInlineSound=true;
            }
        }
        if (sequenceHasATextViewerWithTextOutsideDiv && sequenceHasInlineSound)
            return true;
        else
            return false;
    }

    private boolean textViewerTitleContainsTextOutsideADiv(String title) {
        Document titleXml = Jsoup.parseBodyFragment(title);
        for (Node child : titleXml.body().childNodes()) {
            if (!child.nodeName().equals(DIV)) {  // the text viewer has a child outside the div
                return true;
            }
        }
        return false;
    }


    /**
     * Modifies the contentJsons elements, but does not touch the converted data sent for DL
     * This method will take care of the textViewer nodes, and other nodes in Json that are used only by CGS
     *
     * @param contentJson
     */
    @Override
    public void modifyContentDataWithoutConvertedData(JSONObject contentJson) throws JSONException {

        Iterator keys = contentJson.keys();
        while (keys.hasNext()) {    //iterating over all items in 'content'
            String taskID = keys.next().toString();
            JSONObject subSequence = contentJson.getJSONObject(taskID);
            if (getSubSequenceType(subSequence).equals(TEXT_VIEWER_TYPE)) {   // looking over the instruction nodes
                String title = subSequence.getJSONObject("data").getString("title");
                Document titleXml = Jsoup.parse(title);
                Document.OutputSettings xmlOutputSettingss = new Document.OutputSettings();
                //        xmlOutputSettingss.escapeMode(Entities.EscapeMode.xhtml);  // return not escaped chars
                xmlOutputSettingss.prettyPrint(false); //remove the extra newLines \n that jSoup adds
                titleXml.outputSettings(xmlOutputSettingss);
                Attributes attributes = getDivAttributes();
                String newTitle = fixTitleAndAggregateIntoTag(titleXml.body(), DIV, attributes, Arrays.asList(DIV));
                subSequence.getJSONObject("data").put("title", newTitle);
            }
        }
    }

    /**
     * Fixes the title xml in a specific node in sequence and returns the new title as a string.
     *
     * @param titleXml
     * @param tagName
     * @param tagAttributes
     * @param tagsToIgnore
     * @return
     */
    private String fixTitleAndAggregateIntoTag(Element titleXml, String tagName, Attributes tagAttributes, List<String> tagsToIgnore) {

        List<Integer> indexesToRemove = new ArrayList<>();
        Element newchildElem = null;
        Boolean newDivCreationStarted = false;
        int curIndex = 0;
        int changedChildIndex = 0;

        for (Node child : titleXml.childNodes()) {
            if (!tagsToIgnore.contains(child.nodeName())) {  // the text viewer has a child outside the div
                if (!newDivCreationStarted) {
                    // this is the first div, we'll modify it to a correct div
                    newchildElem = new Element(Tag.valueOf(tagName), "", tagAttributes); //modifying the element
                    newchildElem.append(child.toString());
                    changedChildIndex = curIndex;
                    newDivCreationStarted = true;
                } else {
                    newchildElem.append(child.toString());
                    indexesToRemove.add(curIndex);
                }

            } else { // No need to append anything to the new div, but need to update it.
                if (newDivCreationStarted) {
                    newDivCreationStarted = false;
                    titleXml.childNodes().get(changedChildIndex).replaceWith(newchildElem); //replace with the modified content
                }
            }
            if (curIndex == titleXml.childNodes().size() - 1) { // if this is the last son - we'll replace the element if needed
                if (newDivCreationStarted) {
                    newDivCreationStarted = false;
                    titleXml.childNodes().get(changedChildIndex).replaceWith(newchildElem); //replace with the modified content
                }
            }
            curIndex++;
        }
        // Removing the children that were already aggregated.
        // Please note: the deletion order is very important (from higher index to the lower) otherwise it will delete stuff
        // that shouldn't be deleted.
        List<Integer> descendingOrderedIndexesToDelete = Lists.reverse(indexesToRemove);
        for (Integer indexToRemove : descendingOrderedIndexesToDelete) {
            titleXml.childNodes().get(indexToRemove).remove();
        }
        if (!descendingOrderedIndexesToDelete.isEmpty()) {
            logger.debug("Removed " + descendingOrderedIndexesToDelete.size() + " elements that were outside of a " + tagName);
        }
        return titleXml.html();
    }

    public String getSubSequenceType(JSONObject subSequence) throws JSONException {
        if (subSequence.has("type"))
            return subSequence.get("type").toString();
        else
            return "";
    }

    /**
     * Modifies converted data inside @contentJson, returns true if a modification was made.
     * anyways, if the change was made - it updates it in the @contentJson.convertedData (stringified xml)
     *
     * @param contentJson
     * @param seqId
     * @return
     * @throws atg.taglib.json.util.JSONException
     *
     */
    public Boolean modifyConvertedData(JSONObject contentJson, String seqId) throws JSONException {
        String xmlDoc = contentJson.getJSONObject(seqId).getString(CONVERTED_DATA_KEY);
        Document doc = Jsoup.parse(xmlDoc);
        Boolean xmlChanged = modifyConvertedData(doc);
        if (xmlChanged)   //update converted data xml only if changed
            contentJson.getJSONObject(seqId).put(CONVERTED_DATA_KEY, doc.body().children());
        return xmlChanged;
    }

    public boolean modifyConvertedData(Document doc) {
        Boolean xmlChanged = false;
        Elements viewers = doc.getElementsByTag("textviewer"); //iterate over all <bank> elements
        for (Element viewer : viewers) {
            Elements paragraphs = viewer.getElementsByTag("p"); //iterate over all <span> elements inside a <bank>
            for (Element p : paragraphs) {
                String newParagraphHtml = fixTitleAndAggregateIntoTag(p, SPAN, getSpanAttributes(), Arrays.asList(SPAN, "textviewernarration", "br"));
                p.html(newParagraphHtml);
                xmlChanged = true;
//                logger.debug(span + "class is empty");   // add class="normal" to spans that don't have a class.
            }
        }
        return xmlChanged;

    }


    public Attributes getSpanAttributes() {
        Attributes attributes = new Attributes();
        attributes.put("class", "normal");
        return attributes;

    }

    public Attributes getDivAttributes() {
        Attributes attributes = new Attributes();
        attributes.put("class", "cgs normal");
        attributes.put("style", "width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;");
        attributes.put("contenteditable", "false");
        attributes.put("customstyle", "normal");
        return attributes;

    }
}
