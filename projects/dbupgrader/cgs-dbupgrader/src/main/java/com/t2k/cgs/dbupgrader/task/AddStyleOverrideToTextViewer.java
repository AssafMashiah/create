package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Required;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 27/01/14
 * Time: 12:01
 */
public class AddStyleOverrideToTextViewer extends CommonTask {

    private MigrationDao migrationDao;

    private HashMap<String, String> manipulatedItems;

    public static final String CONTENT = "content";
    public static final String SEQ_ID = "seqId";

    @Override
    protected void executeUpInternal() throws Exception {

        executeUpgrade();
    }


    public void executeUpgrade() throws Exception {

        DBCursor cursor = migrationDao.getSequencesDbObjectsCursor();

        if (cursor != null) {

            Iterator<DBObject> i = cursor.iterator();

            while (i.hasNext()) {

                DBObject sequencesDbObj = i.next();

                manipulatedItems = new HashMap<>();

                String content = (String) sequencesDbObj.get(CONTENT);

                JSONObject jsonObj = new JSONObject(content);

                Iterator<String> keys = jsonObj.keys();

                while (keys.hasNext()) {

                    JSONObject item = (JSONObject) jsonObj.get(keys.next());

                    ProcessItem(item, jsonObj);
                }
                try{
                postPrecessConvertedData(sequencesDbObj, jsonObj);

                content = jsonObj.toString();
                content = content.replaceAll("<\\\\/", "</");

                sequencesDbObj.put(CONTENT, content);
                sequencesDbObj.put("lastModified", new Date());
                migrationDao.saveSequencesDbObject(sequencesDbObj);
                }catch (Exception e){
                    System.out.print("Could not upgrade sequence "+sequencesDbObj.get(SEQ_ID));
                }

            }

        }


        DBCursor lessons = migrationDao.getLessonsDbObjectsCursor();
        if (lessons != null) {
            Iterator<DBObject> it = lessons.iterator();

            while (it.hasNext()) {
                DBObject lesson = it.next();
                ((DBObject) ((DBObject) lesson.get("contentData")).get("header")).put("last-modified", new Date());
                migrationDao.saveLesson(lesson);
            }
        }

    }

    private void postPrecessConvertedData(DBObject sequencesDbObj, JSONObject jsonObj) throws JSONException, ParserConfigurationException, SAXException, IOException {

        JSONObject firstSeq = (JSONObject) jsonObj.get((String) sequencesDbObj.get(SEQ_ID));

        if (firstSeq.has("convertedData") && firstSeq.has("type") && firstSeq.get("type").equals("sequence")) {
            Object o = firstSeq.get("convertedData");
            if (o != null && !JSONObject.NULL.equals(o) && !o.equals("")) {
                String convertedDataStr = (String) o;


                if (!convertedDataStr.equals("")) {
                    Document document = Jsoup.parse(convertedDataStr);

                    Set<String> keySet = manipulatedItems.keySet();
                    for (String id : keySet) {

                        Element elm = document.getElementById(id);
                        if (elm != null) {
                            Element p = elm.children().first();
                            assert (p != null && p.nodeName().equals("p") && p.children()!=null);
                            Elements children = p.children();
                            for (int i = 0; i < children.size(); i++) {
                                Element child = children.get(i);
                                assert (child != null);
                                if (child.nodeName().equals("span")) {

                                    if (child.hasAttr("class") && !child.attr("class").equals("invalid")) {

                                        assert (manipulatedItems != null && manipulatedItems.get(id) != null);

                                        String attributeValue = manipulatedItems.get(id);
                                        child.attr("class", attributeValue);


                                    }
                                }
                            }
                        }
                    }


                    convertedDataStr = document.body().children().toString();
                    firstSeq.put("convertedData", convertedDataStr);
                }
            }
        }
    }

    private static final HashMap<List<String>, String> rules;

    static {
        rules = new HashMap<>();
        rules.put(Arrays.asList("textViewer", "genericTitle", "header"), "sequenceTitle");
        rules.put(Arrays.asList("textViewer", "genericSubTitle", "header"), "sequenceSubTitle");
        rules.put(Arrays.asList("textViewer", "genericTitle", "separator"), "separatorTitle");
        rules.put(Arrays.asList("textViewer", "genericSubTitle", "separator"), "separatorSubTitle");
        rules.put(Arrays.asList("textViewer", "title", "pedagogicalStatement"), "pedagogicalTitle");
        rules.put(Arrays.asList("textViewer", "title", "selfCheck"), "selfcheckTitle");
        rules.put(Arrays.asList("textViewer", "instruction"), "instruction");
        rules.put(Arrays.asList("textViewer", "feedback"), "feedback");
        rules.put(Arrays.asList("textViewer", "definition"), "definition");
        rules.put(Arrays.asList("textViewer", "subQuestion"), "subQuestion");
    }

    private void ProcessItem(JSONObject item, JSONObject sequences) throws JSONException {

        Set<List<String>> types = rules.keySet();
        Iterator<List<String>> it = types.iterator();

        while (it.hasNext()) {
            List<String> ruleList = it.next();
            if (satisfiesRules(item, ruleList, sequences)) {
                ((JSONObject) item.get("data")).put("styleOverride", rules.get(ruleList));
                manipulatedItems.put((String) item.get("id"), rules.get(ruleList));

            } else {
                satisfiesSpacialRules(item, sequences);
            }
        }
    }

    private void satisfiesSpacialRules(JSONObject item, JSONObject sequences) {

        try {
            if (item.get("type").equals("textViewer")) {

                JSONObject itemsParent = (JSONObject) sequences.get((String) item.get("parent"));
                if (itemsParent.get("type").equals("clozeBank")) {

                    JSONObject itemsGrandParent = (JSONObject) sequences.get((String) itemsParent.get("parent"));
                    if (((JSONObject) itemsGrandParent.get("data")).has("interaction") &&
                            ((JSONObject) itemsGrandParent.get("data")).get("interaction").equals("write")) {

                        ((JSONObject) item.get("data")).put("styleOverride", "bankReadOnly");
                        manipulatedItems.put((String) item.get("id"), "bankReadOnly");

                    }

                }


            } else if (item.get("type").equals("table")) {

                processCableTV(item, sequences);

            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    private void processCableTV(JSONObject item, JSONObject sequences) throws JSONException {

        JSONObject data = (JSONObject) item.get("data");

        List<String> children = (List<String>) item.get("children");
        //=================================1=========================================
        summaryColumnParse(sequences, data, children);
        //==========================================2=================================
        summaryRowParse(sequences, data, children);
        //=====================3 =====================================================
        rowHeaderParse(sequences, data, children);
        //===================4========================================================
        columnHeaderParse(sequences, data, children);
        //===========================================5================================
        columnRowHeadersIntersection(sequences, data, children);
    }

    private void columnRowHeadersIntersection(JSONObject sequences, JSONObject data, List<String> children) throws JSONException {

        if ((data.has("column_header") && (boolean) data.get("column_header"))
                && (data.has("row_header")
                && (boolean) data.get("row_header"))) {

            JSONObject firstRow = (JSONObject) sequences.get(children.get(0));
            JSONObject firsCell = (JSONObject) sequences.get(((List<String>) firstRow.get("children")).get(0));

            if (firsCell.has("children") &&
                    !((List<String>) firsCell.get("children")).isEmpty()) {

                JSONObject c = (JSONObject) sequences.get(((List<String>) firsCell.get("children")).get(0));

                if (c.get("type").equals("textViewer")) {

                    ((JSONObject) c.get("data")).put("styleOverride", "");
                    manipulatedItems.remove(c.get("id"));

                }

            }
        }
    }


    private void columnParseHelper(JSONObject sequences, JSONObject data, List<String> children, String attrName, String valueToPut, boolean isLast) throws JSONException {

        if (data.has(attrName) && (boolean) data.get(attrName)) {
            for (String child : children) {
                JSONObject row = (JSONObject) sequences.get(child);
                List<String> rowChildren = (List<String>) row.get("children");
                JSONObject rowCell = (JSONObject) sequences.get(rowChildren.get(isLast ? (rowChildren.size() - 1) : 0));

                if (rowCell.has("children") &&
                        !((List<String>) rowCell.get("children")).isEmpty()) {
                    JSONObject c = (JSONObject) sequences.get(((List<String>) rowCell.get("children")).get(0));

                    if (c.get("type").equals("textViewer")) {

                        ((JSONObject) c.get("data")).put("styleOverride", valueToPut);
                        manipulatedItems.put((String) c.get("id"), valueToPut);
                    }
                }
            }
        }
    }

    private void columnHeaderParse(JSONObject sequences, JSONObject data, List<String> children) throws JSONException {

        columnParseHelper(sequences, data, children, "column_header", "tableHeader", false);
    }

    private void summaryColumnParse(JSONObject sequences, JSONObject data, List<String> children) throws JSONException {

        columnParseHelper(sequences, data, children, "summary_column", "tableSummary", true);
    }


    private void rowParseHelper(JSONObject sequences, JSONObject data, List<String> children, String attrName, String valueToPut, boolean isLast) throws JSONException {

        if (data.has(attrName) && (boolean) data.get(attrName)) {

            JSONObject row = (JSONObject) sequences.get(children.get((isLast ? (children.size() - 1) : 0)));

            for (String child : (List<String>) row.get("children")) {

                JSONObject cell = (JSONObject) sequences.get(child);


                if (cell.has("children") &&
                        !((List<String>) cell.get("children")).isEmpty()) {


                    Object childrenTmp = cell.get("children");
                    String firstChildTmp = ((List<String>) childrenTmp).get(0);
                    JSONObject c = (JSONObject) sequences.get(firstChildTmp);

                    if (c.get("type").equals("textViewer")) {

                        ((JSONObject) c.get("data")).put("styleOverride", valueToPut);
                        manipulatedItems.put((String) c.get("id"), valueToPut);
                    }

                }
            }
        }
    }

    private void rowHeaderParse(JSONObject sequences, JSONObject data, List<String> children) throws JSONException {

        rowParseHelper(sequences, data, children, "row_header", "tableHeader", false);
    }


    private void summaryRowParse(JSONObject sequences, JSONObject data, List<String> children) throws JSONException {

        rowParseHelper(sequences, data, children, "summary_row", "tableSummary", true);
    }


    private boolean satisfiesRules(JSONObject item, List<String> ruleList, JSONObject sequences) {

        try {

            if (item.get("type").equals(ruleList.get(0))) {

                List<String> newRuleList = ruleList.subList(1, ruleList.size());

                if (newRuleList.isEmpty())
                    return true;
                else
                    return satisfiesRules((JSONObject) sequences.get((String) item.get("parent")),
                            newRuleList, sequences);
            } else
                return false;

        } catch (JSONException e) {
            e.printStackTrace();
        }
        return false;
    }


    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    @Required
    public void setMigrationDao(MigrationDao migrationDao) {

        this.migrationDao = migrationDao;
    }


}
