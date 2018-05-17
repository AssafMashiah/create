package org.t2k.cgs.utils;

import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.IntNode;
import org.codehaus.jackson.node.ObjectNode;
import org.codehaus.jackson.node.TextNode;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;

enum CustomFieldsTypes {
    TEXT("text"),
    URL("url"),
    FREETEXT("freeText"),
    INTEGER("integer"),
    TAGS("tags"),
    LIST("list"),
    DATE("date"),
    TIME("time"),
    BOOLEAN("boolean"),
    PACKAGENAME("packageName"),
    MULTISELECT_LARGE("multiselect_large"),
    MULTISELECT("multiselect");

    private String type;

    CustomFieldsTypes(String type) {
        this.type = type;
    }

    String getType() {
        return this.type;
    }

    public static CustomFieldsTypes forName(String name) {
        for (CustomFieldsTypes type : values()) {
            if (type.getType().equals(name)) {
                return type;
            }
        }
        return null;
    }
}

enum TagsSeparator {
    COMMA("comma"),
    SPACE("space"),
    SEMICOLON("semicolon");

    private String separator;

    TagsSeparator(String separator) {
        this.separator = separator;
    }

    String getTagsSeparator() {
        return this.separator;
    }

    public static TagsSeparator forName(String name) {

        for (TagsSeparator tag : values()) {
            if (name.equals(tag.getTagsSeparator())) {
                return tag;
            }
        }
        return null;
    }

    String getSeparatorSymbol() {
        switch (this) {
            case COMMA:
                return ",";
            case SPACE:
                return " ";
            case SEMICOLON:
                return ";";
        }
        return "";
    }
}

enum DateFormat {
    mm_dd_yy("mm/dd/yy"),
    dd_mm_yy("dd/mm/yy"),
    M_dd_yy("M. dd, yy"),
    D_M_dd_yy("D, M. dd,yy");

    private String dateFormat;

    DateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    String getDateFormat() {
        return this.dateFormat;
    }

    public static DateFormat forName(String name) {

        for (DateFormat date : values()) {
            if (date.getDateFormat().equals(name)) {
                return date;
            }
        }
        return null;
    }

    String getConvertedDateFormat() {
        switch (this) {
            case mm_dd_yy:
                return "MM/dd/yy";
            case dd_mm_yy:
                return "dd/MM/yy";
            case M_dd_yy:
                return "MMM. dd, yyyy";
            case D_M_dd_yy:
                return "EEE, MMM. dd,yyyy";
        }
        return "";
    }
}

public class PackageSchemaConversionUtil {
    private static Logger logger = Logger.getLogger(PackageSchemaConversionUtil.class);

    public static JsonNode convertPackageData(JsonNode objectToPublish) throws Exception {
        logger.debug("convertPackageData(): package conversion started");
        ArrayNode customFields = (ArrayNode) objectToPublish.get("customFields");
        if (customFields != null) {
            ArrayNode convertedCustomFields = convertCustomFields(customFields);
            ((ObjectNode) objectToPublish).put("customFields", convertedCustomFields);
        }
        return objectToPublish;
    }

    private static ArrayNode convertCustomFields(ArrayNode customFields) throws Exception {
        logger.debug("convertCustomFields(): started");
        ObjectMapper mapper = new ObjectMapper();
        ArrayNode convertedCustomFields = mapper.createArrayNode();

        Iterator<JsonNode> customFieldsIter = customFields.getElements();
        while (customFieldsIter.hasNext()) {
            ObjectNode item = (ObjectNode) customFieldsIter.next();
            logger.debug(String.format("convertCustomFields(): try convert %s", item.get("cid")));
            ObjectNode convertedItem = convertCustomFieldsData(item);
            logger.debug(String.format("convertCustomFields(): convert %s successful", item.get("cid")));
            if (convertedItem != null) {
                convertedCustomFields.add(convertedItem);
            } else {
                logger.debug(String.format("convertCustomFields(): item %s conversion returned null value", item.get("cid")));
            }
        }
        return convertedCustomFields;
    }

    private static ObjectNode convertCustomFieldsData(ObjectNode item) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        ObjectNode convertedItem = mapper.createObjectNode();
        convertedItem.put("cid", item.get("cid"));
        convertedItem.put("name", item.get("name"));

        switch (CustomFieldsTypes.forName(item.get("type").getTextValue())) {
            case TEXT:
            case URL:
            case FREETEXT:
                /*{
                    "cid": "xxx",
                    "type": "text",
                    "name": "xxx",
                    "value": {"text": "xxx"}
                },*/
                convertedItem.put("type", "text");
                String TextValue = "";
                if (item.get("value") != null) {
                    TextValue = item.get("value").getTextValue();
                }
                ObjectNode textNode = mapper.createObjectNode();
                textNode.put("text", TextValue);
                convertedItem.put("value", textNode);
                break;

            case INTEGER:
                /* {
                    "cid": "xxx",
                    "type": "number",
                    "name": "xxx",
                    "value": {"number": xx}
                } */
                convertedItem.put("type", "number");
                Integer intValue = 0;
                if (item.get("value") != null) {
                    // the value is saved to the cgs model as a string, here we parse it to int
                    String numberString = item.get("value").getTextValue();
                    try {
                        intValue = Integer.parseInt(numberString);
                    } catch (Exception e) {
                        logger.error("convertCustomFieldsData(): " + item.get("cid")+ " Failed to parse value to int: " +  numberString);
                    }
                }
                ObjectNode intNode = mapper.createObjectNode();
                intNode.put("number", intValue);
                convertedItem.put("value", intNode);
                break;

            case TAGS:
                /* {
                    "cid": "xxx",
                    "type": "list",
                    "name": "xxx",
                    "values": [
                        {"text": "x"},
                        {"text": "x"}
                    ]
                },
                * */
                convertedItem.put("type", "list");
                ArrayNode tagsItems = mapper.createArrayNode();
                String[] items = null;

                //data is saved as string and separated with a splitter (comma, space, semicolon).
                //here we create an array of values from that data
                if (item.get("tags") != null) {
                    String splitter = TagsSeparator.forName(item.get("separator").getTextValue()).getSeparatorSymbol();
                    items = item.get("tags").getTextValue().split(splitter);
                }

                for (int i = 0; items != null && i < items.length; i++) {
                    ObjectNode tagNode = mapper.createObjectNode();
                    tagNode.put("text", items[i]);
                    tagsItems.add(tagNode);
                }
                convertedItem.put("values", tagsItems);
                break;

            case DATE:
                /*{
                    "cid": "xxx",
                    "type": "date",
                    "name": "xxx",
                    "value": {"date": "2014-08-24T18:25:57Z"} //UTC datetime format: yyyy-MM-DDThh:mm:ssZ

                }*/
                convertedItem.put("type", "date");
                String date = "";

                if (item.get("timestamp") != null && !item.get("timestamp").getTextValue().isEmpty()) {
                    date = item.get("timestamp").getTextValue();

                    //date is saved as string, and a property that defines the format of that date,
                    //here we convert the string to a date obj according to the format
                    String format = DateFormat.forName(item.get("format").getTextValue()).getConvertedDateFormat();
                    SimpleDateFormat sdf = new SimpleDateFormat(format, Locale.US);
                    Date dateObj;
                    try {
                        dateObj = sdf.parse(date);
                    } catch (ParseException e) {
                        String errorMsg = String.format("Convert custom field of item %s failed: unable to parse value %s to date", item.get("name"), date);
                        logger.error(errorMsg);
                        throw new Exception(errorMsg, e);
                    }

                    // convert the date to UTC datetime format
                    SimpleDateFormat utcFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
                    date = utcFormat.format(dateObj);
                }

                ObjectNode dateNode = mapper.createObjectNode();
                dateNode.put("date", date);
                convertedItem.put("value", dateNode);

                break;

            case TIME:
                /*{
                    "cid": "xxx",
                    "type": "duration", //time
                    "name": "xxx",
                    "value": {"duration": "P1H1M1S"} //according to ISO-8601
                }*/
                convertedItem.put("type", "duration");
                String time = "";

                if (item.get("timestamp") != null) {
                    time = item.get("timestamp").getTextValue();

                    String timeFormat = "";
                    if (item.get("format").getTextValue().equals("24hours")) {
                        if (item.get("includeSeconds").getBooleanValue()) {
                            timeFormat = "HH:mm:ss";
                        } else {
                            timeFormat = "HH:mm";
                        }
                    }
                    if (item.get("format").getTextValue().equals("12hours")) {
                        if (item.get("includeSeconds").getBooleanValue()) {
                            timeFormat = "HH:mm:ss a";
                        } else {
                            timeFormat = "HH:mm a";
                        }
                    }

                    //convert the string that represents the time- to  a time obj
                    SimpleDateFormat simpleTimeFormat = new SimpleDateFormat(timeFormat, Locale.US);
                    Date timeObj;
                    try {
                        timeObj = simpleTimeFormat.parse(time);
                    } catch (ParseException e) {
                        String errorMsg = String.format("convertCustomFieldsData(): Item %s failed to parse value to time: %s", item.get("cid"), time);
                        logger.error(errorMsg);
                        throw new Exception(errorMsg, e);
                    }

                    //convert the time obj to an ISO format
                    SimpleDateFormat isoTimeFormat = new SimpleDateFormat("'P'H'H'm'M's'S'");
                    time = isoTimeFormat.format(timeObj);
                }

                ObjectNode timeNode = mapper.createObjectNode();
                timeNode.put("duration", time);
                convertedItem.put("value", timeNode);

                break;

            case LIST:
                //convert to a format same as text
                convertedItem.put("type", "text");
                String listValue = "";
                if (item.get("selectedValue") != null) {
                    listValue = item.get("selectedValue").getTextValue();
                }
                ObjectNode listNode = mapper.createObjectNode();
                listNode.put("text", listValue);
                convertedItem.put("value", listNode);
                break;

            case BOOLEAN:
                /*{
                    "cid": "xxx",
                    "type": "boolean",
                    "name": "xxx",
                    "value": {"boolean": true/false}
                }*/
                convertedItem.put("type", "boolean");
                boolean boolValue = item.get("value").getBooleanValue();
                ObjectNode boolNode = mapper.createObjectNode();
                boolNode.put("boolean", boolValue);
                convertedItem.put("value", boolNode);
                break;
            case PACKAGENAME:
                //don't convert this type . return null so it will not enter inside the converted array
                convertedItem = null;
                break;
            case MULTISELECT:
            case MULTISELECT_LARGE:
                convertedItem.put("type", "list");
                Iterator<JsonNode> multiSelectIter = item.get("selectedValue").getElements();
                ArrayNode listItems = mapper.createArrayNode();
                //loop over multi selected elements and add them to a list
                while (multiSelectIter.hasNext()) {

                    JsonNode multiSelectItem = multiSelectIter.next();
                    ObjectNode listItem = mapper.createObjectNode();
                    //check the type of the values / text or number
                    if (multiSelectItem instanceof IntNode) {
                        listItem.put("number", multiSelectItem.getIntValue());
                    }
                    if (multiSelectItem instanceof TextNode) {
                        listItem.put("text", multiSelectItem.getTextValue());
                    }
                    listItems.add(listItem);
                }

                if (listItems.size() > 0) {
                    convertedItem.put("values", listItems);
                }
                else {
                    convertedItem = null;
                }
                break;
        }
        return convertedItem;
    }
}