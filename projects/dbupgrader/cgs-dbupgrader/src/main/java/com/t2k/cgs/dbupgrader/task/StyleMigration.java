package com.t2k.cgs.dbupgrader.task;


import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.google.common.collect.ImmutableMap;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.steadystate.css.parser.CSSOMParser;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;
import org.w3c.css.sac.InputSource;
import org.w3c.dom.css.CSSRule;
import org.w3c.dom.css.CSSRuleList;
import org.w3c.dom.css.CSSStyleRule;
import org.w3c.dom.css.CSSStyleSheet;

import java.io.*;
import java.util.*;

public class StyleMigration extends CommonTask {

    //TODO: handle String index out of range: -1
    private static class Pair<K, V> {

        private K key;
        private V value;

        public Pair(K key, V value) {

            this.key = key;
            this.value = value;
        }

        public K getKey() {

            return key;
        }

        public V getValue() {

            return value;
        }
    }

    private String log = "";

    private final Map<String, String> getLable = ImmutableMap.<String, String>builder()
            .put("separatorTitle", "Separator Sequence - Title")
            .put("separatorSubTitle", "Separator Sequence - Subtitle")
            .put("sequenceTitle", "Sequence Header - Title")
            .put("sequenceSubTitle", "Sequence Header - Instructions")
            .put("pedagogicalTitle", "Pedagogical Statement - Title")
            .put("selfcheckTitle", "Self-check - Title")
            .put("instruction", "Task Instructions")
            .put("normal", "Normal")
            .put("feedback", "Task Feedback")
            .put("definition", "Definition")
            .put("subQuestion", "Short Answer - Sub-question")
            .put("tableHeader", "Table - Header")
            .put("tableSummary", "Table - Summary")
            .put("row.title", "Table - Row Title")
            .put("bankReadOnly", "Fill in the Gaps - Read-only Bank Item")
            .put("fillInTheGapsHint", "Fill in the Gaps - Hint")
            .put("imageCaption", "Image - Caption")
            .put("imageCredit", "Image - Credit")
            .put("row.copyrights", "Table copyrights")
            .put("small", "Small Text")
            .put("heading1", "Heading 1")
            .put("heading2", "Heading 2")
            .put("heading3", "Heading 3")
            .put("question", "Question")
            .put("legende", "Legende")
            .put("emphasis", "Emphasis")
            .put("softEmphasis", "Soft Emphasis")
            .put("strongEmphasis", "Strong Emphasis")
            .put("colorEmphasis", "Color Emphasis")
            .put("strongColorEmphasis", "Strong Color Emphasis")
            .put("redEmphasis", "Red Emphasis")
            .put("redItalEmphasis", "Red Ital Emphasis")
            .put("blueEmphasis", "Blue Emphasis")
            .put("blueItalEmphasis", "Blue Ital Emphasis")
            .put("greenEmphasis", "Green Emphasis")
            .put("greenItalEmphasis", "Green Ital Emphasis")
            .put("colorEmphasis1", "Purple Emphasis")
            .put("colorEmphasis2", "Orange Emphasis")
            .put("colorEmphasis3", "Blue Emphasis")
            .put("highlightColor4", "Yellow Highlight")
            .put("highlightColor3", "Pink Highlight")
            .put("highlightColor2", "Blue Highlight")
            .put("highlightColor1", "Green Highlight")
            .put("emphasis2", "Underline")
            .put("shortText", "Short Text")
            .put("quote", "Quote")
            .put("link", "Link")
            .put("credit", "Credit")
            .put("partOfSpeach", "Part Of Speach")
            .put("turqoiseEmphasis", "Turqoise Emphasis")
            .put("orangeEmphasis", "Orange Emphasis")
            .build();


    private final Map<String, String> isSystem = ImmutableMap.<String, String>builder()
            .put("separatorTitle", "Separator Sequence - Title")
            .put("separatorSubTitle", "Separator Sequence - Subtitle")
            .put("sequenceTitle", "Sequence Header - Title")
            .put("sequenceSubTitle", "Sequence Header - Instructions")
            .put("pedagogicalTitle", "Pedagogical Statement - Title")
            .put("selfcheckTitle", "Self-check - Title")
            .put("instruction", "Task Instructions")
            .put("normal", "Normal")
            .put("feedback", "Task Feedback")
            .put("definition", "Definition")
            .put("subQuestion", "Short Answer - Sub-question")
            .put("tableHeader", "Table - Header")
            .put("tableSummary", "Table - Summary")
            .put("row.title", "Table - Row Title")
            .put("bankReadOnly", "Fill in the Gaps - Read-only Bank Item")
            .put("fillInTheGapsHint", "Fill in the Gaps - Hint")
            .put("imageCaption", "Image - Caption")
            .put("imageCredit", "Image - Credit")
            .put("row.copyrights", "Table copyrights")
            .build();


    private final List<String> isInRem = Arrays.asList(
            "sequenceTitle",
            "sequenceSubTitle",
            "pedagogicalTitle",
            "selfcheckTitle",
            "instruction",
            "feedback",
            "imageCaption",
            "imageCredit",
            "row.title",
            "row.copyrights",
            "fillInTheGapsHint");


    private String new_version;

    private MigrationDao migrationDao;

    private Configuration configuration;

    private static Logger logger = Logger.getLogger(StyleMigration.class);

    @Override
    protected void executeUpInternal() throws Exception {
        try {
            migrateToNewStyle();
        } catch (Exception e) {
            System.out.print("styleMigration failed, Exception: " + e);
        }
    }

    public void migrateToNewStyle() throws IOException, JSONException {

        String cmsLocation = configuration.getProperty("cmsHome");

        File baseDir = new File(cmsLocation, "publishers");

        assert baseDir.isDirectory() && baseDir.exists();

        DBCursor courses = migrationDao.getCoursesDbCursor();

        File packs = new File(cmsLocation, "packs");
        if (!packs.exists())
            packs.mkdirs();

        StringBuilder filesWritten = new StringBuilder();

        while (courses.hasNext()) {
            DBObject course = courses.next();
            try {
                String[] pathes = processCoursePack(course, baseDir);

                try {
                    //copy packs
                    if (pathes != null && pathes.length == 3) {

                        File newFile = new File(packs, pathes[0] + ".json");
                        File stylesjson = new File(pathes[1]);
                        FileUtils.copyFile(stylesjson, newFile);
                        filesWritten.append("'" + newFile.getName() + "',");
                    }
                } catch (Exception e) {

                    try {
                        log += "SYS_ERROR: in collecting packs \n";

                    } catch (Exception error) {
                        log += "SYS_ERROR: logging error \n";

                    }

                }
            } catch (Exception e) {
                System.out.print("Could not handle course: " + course);
            }
        }


        //werite logs
        File logFile = new File(cmsLocation, "SMLog.txt");
        logFile.createNewFile();
        try (FileWriter aFileWriter = new FileWriter(logFile, false)) {
            aFileWriter.write(log);
        }

        if (filesWritten.length() != 0) {
            filesWritten.deleteCharAt(filesWritten.length() - 1);
        }

        File filesWrittenFile = new File(packs.getPath(), "files.json");
        filesWrittenFile.createNewFile();
        try (FileWriter bFileWriter = new FileWriter(filesWrittenFile, false)) {
            bFileWriter.write(filesWritten.toString());
        }


    }

    private String[] processCoursePack(DBObject course, File baseDir) throws IOException, JSONException {

        String[] ret = new String[3];

        DBObject contentData = ((DBObject) course.get("contentData"));

        if (contentData.containsField("customizationPack")) {

            DBObject customizationPack = (DBObject) contentData.get("customizationPack");


            String resourceId = (String) customizationPack.get("resourceId");

            List<DBObject> resources = (List<DBObject>) contentData.get("resources");

            DBObject the_resource = null;

            for (DBObject resource : resources) {

                if (resourceId.equals(resource.get("resId"))) {
                    the_resource = resource;
                    break;
                }

            }

            assert the_resource != null;

            String sufix = (String) the_resource.get("baseDir");

            DBObject cgsData = (DBObject) course.get("cgsData");

            String targetdir = cgsData.get("publisherId") +
                    "/courses/" + contentData.get("courseId")
                    + "/" + sufix.trim();


            String[] segments = targetdir.split("/");

            Float old_version = Float.parseFloat(segments[segments.length - 1]);


            String l = old_version.toString().substring(old_version.toString().indexOf(".") + 1);
            Float nv = old_version + 0.1f;

            new_version = String.format("%." + l.length() + "f", nv);


            String new_targetdir = targetdir.replace(old_version.toString(), new_version);

            the_resource.put("baseDir", sufix.replace(old_version.toString(), new_version));


            File customizationPackDir = new File(baseDir, new_targetdir);
            File oldcustomizationPackDir = new File(baseDir, targetdir);

            if (!oldcustomizationPackDir.exists()) {
                try {
                    log += "ERROR: course without customization pack dir: courseid: " + contentData.get("courseId") + " title: " +
                            contentData.get("title") + "  expected path:" + oldcustomizationPackDir.getPath() + "\n";
                    return null;
                } catch (Exception e) {
                    log += "SYS_ERROR: logging error \n";
                    return null;
                }
            }

            FileUtils.copyDirectory(oldcustomizationPackDir, customizationPackDir);


            ret[0] = targetdir.replace("/", ".");
            ret[1] = new File(customizationPackDir.getPath(), "dl/styles.json").getPath().toString();


            customizationPack.put("version", this.new_version.toString());


            assert customizationPackDir.isDirectory() && customizationPackDir.exists();

            logger.info("StyleMigration: processing: " + customizationPackDir);

            List<String> hrefFiles = (List<String>) the_resource.get("hrefs");

            List<String> hrefs = new ArrayList<>(hrefFiles);


            //prossess dl dir and hrefs.add(...) return the new styles
            JSONObject dlStylesJson = prossessDlStyle(customizationPackDir, hrefs);


            if (dlStylesJson != null) {

                boolean rr = hrefs.remove("cgs/style.css");

                assert rr;

                //update dl/config.json
                updateDlConfighVersion(customizationPackDir);


                //prossess cgs dir  -> hrefs.add(...)
                prossessCGSStyle(dlStylesJson, customizationPackDir, hrefs);

                //update  customizationPackDir -> manifest.json add new files
                updateManifest(customizationPackDir, hrefs);

                //update the_resource
                the_resource.put("hrefs", hrefs);

                ((DBObject) contentData.get("header")).put("last-modified", new Date());

                migrationDao.saveCourse(course);
            } else {

                try {
                    log += "ERROR: cant create styles.json: courseid: " + contentData.get("courseId") + " title: " +
                            contentData.get("title") + "\n";
                    return null;
                } catch (Exception e) {
                    log += "SYS_ERROR: logging error \n";
                    return null;
                }

            }
        } else {
            try {
                log += "ERROR: course without customization pack: courseid: " + contentData.get("courseId") + " title: " +
                        contentData.get("title") + "\n";
                return null;
            } catch (Exception e) {
                log += "SYS_ERROR: logging error \n";
                return null;
            }
        }

        return ret;
    }

    private void updateDlConfighVersion(File customizationPackDir) throws IOException, JSONException {

        File dlconfigjson = new File(customizationPackDir.getPath(), "dl/config.json");
        assert dlconfigjson.exists();

        InputStream is = new FileInputStream(dlconfigjson);
        String configTxt = IOUtils.toString(is);

        JSONObject dlconfigjsonJson = new JSONObject(configTxt);
        String dlconfigverstion = dlconfigjsonJson.getString("version");
        Float old_dlconfigverstion = Float.parseFloat(dlconfigverstion);


        String l = old_dlconfigverstion.toString().substring(old_dlconfigverstion.toString().indexOf(".") + 1);
        Float nv = old_dlconfigverstion + 1.0f;

        String new_dlconfigverstion = String.format("%." + l.length() + "f", nv);

        dlconfigjsonJson.put("version", Float.parseFloat(new_dlconfigverstion));

        dlconfigjson.delete();
        dlconfigjson.createNewFile();
        try (FileWriter dlCOnfigFileWriter = new FileWriter(dlconfigjson, false)) {
            dlCOnfigFileWriter.write(dlconfigjsonJson.toString());
        }
    }

    private void prossessCGSStyle(JSONObject dlStylesJson, File customizationPackDir, List<String> hrefs) throws JSONException, IOException {


        //////////////////////////
        String menuCssPrefix = ".btn-link-title.";
        String TVEcssPrefix = "body.texteditor > div.";

        final Map<String, String> specialCssPrefixMap = ImmutableMap.of(
                "imageCaption", ".ImageCaption",
                "imageCredit", ".ImageCopyrights",
                "row.title", ".virtualTable .tableTitle,.sequence_stage > .element_preview_wrapper .tableTitle",
                "row.copyrights", ".virtualTable .copyrights, .sequence_stage > .element_preview_wrapper .table_content + .copyrights"
        );


        ///fonts.css///
        extractCgsFontsCss(dlStylesJson, customizationPackDir, hrefs);

        /////effects.css////////
        extractCgeEffectsCss(dlStylesJson, customizationPackDir, hrefs, specialCssPrefixMap);

        ////////styles.css//////
        extractCgeStylesCss(dlStylesJson, customizationPackDir, hrefs, menuCssPrefix, TVEcssPrefix, specialCssPrefixMap);

        prepConfig(dlStylesJson, customizationPackDir);


        File style = new File(customizationPackDir.getPath(), "cgs/style.css");
        File cgsStyles = new File(customizationPackDir.getPath(), "cgs/cgsStyles.css");
        style.renameTo(cgsStyles);
        hrefs.remove("cgs/style.css");
        hrefs.add("cgs/cgsStyles.css");


    }

    private void prepConfig(JSONObject dlStylesJson, File customizationPackDir) throws IOException, JSONException {

        File configFile = new File(customizationPackDir.getPath(), "cgs/config.json");
        assert configFile.exists();

        InputStream is = new FileInputStream(configFile);
        String configTxt = IOUtils.toString(is);

        JSONObject config = new JSONObject(configTxt);

        JSONObject styleAndEffectMapping = new JSONObject();
        config.put("styleAndEffectMapping", styleAndEffectMapping);

        JSONArray effectsMapping = new JSONArray();
        JSONArray stylesMapping = new JSONArray();
        styleAndEffectMapping.put("effects", effectsMapping);
        styleAndEffectMapping.put("styles", stylesMapping);

        if (!config.has("menu")) {
            config.put("menu", new JSONObject());
        }

        JSONObject menu = config.getJSONObject("menu");

        JSONArray textViewerStyles = new JSONArray();
        JSONArray textViewerEffects = new JSONArray();

        menu.put("textViewerStyles", textViewerStyles);
        menu.put("textViewerEffects", textViewerEffects);

        prepTextViewerStyles(textViewerStyles, dlStylesJson, stylesMapping);

        prepTextViewerEffects(textViewerEffects, dlStylesJson, effectsMapping, customizationPackDir);


        if (!config.has("cssFiles")) {
            config.put("cssFiles", new JSONArray());

        }

        JSONArray cssFiles = (JSONArray) config.get("cssFiles");

        cssFiles.remove("cgs/style.css");

        cssFiles.add("cgs/styles.css");
        cssFiles.add("cgs/fonts.css");
        cssFiles.add("cgs/effects.css");
        cssFiles.add("cgs/cgsStyles.css");

        try (FileWriter cgsStylesFileWriter = new FileWriter(configFile, false)) {
            cgsStylesFileWriter.write(config.toString());
        }

    }

    private void prepTextViewerEffects(JSONArray textViewerEffects, JSONObject dlStylesJson, JSONArray effectsMapping, File customizationPackDir) throws JSONException {

        boolean isiw_IL = customizationPackDir.getPath().contains("iw_IL");
        {

            //add clear
            JSONObject item = new JSONObject();

            item.put("id", "menu-button-effect-clear");
            item.put("label", "((Clear))");
            item.put("event", "executeCommand");
            item.put("icon", "remove-sign");

            JSONArray args = new JSONArray();
            args.add("removeFormat");
            JSONObject obj = new JSONObject();
            obj.put("extraClass", "effects-Clear");
            args.add(obj);

            item.put("args", args);

            item.put("canBeDisabled", true);
            item.put("dontStealFocus", true);

            textViewerEffects.add(item);

        }


        JSONArray effects = dlStylesJson.getJSONArray("effects");

        for (Object oeffect : effects) {
            JSONObject effect = (JSONObject) oeffect;
            String key = effect.getString("key");


            JSONObject item = new JSONObject();

            item.put("id", "menu-button-effect-" + key);


            if (isiw_IL && getLable.containsKey(key) && getLable.get(key).equals("Soft Emphasis"))
                item.put("label", "Quote");
            else
                item.put("label", getLable.containsKey(key) ? getLable.get(key) : key);


            item.put("event", "executeCommand");

            //  item.put("icon", "sampleText");

            JSONArray args = new JSONArray();
            args.add(key);
            JSONObject obj = new JSONObject();
            obj.put("extraClass", key);
            args.add(obj);

            item.put("args", args);

            item.put("canBeDisabled", true);
            item.put("dontStealFocus", true);

            textViewerEffects.add(item);


        }
        for (Object oeffect : effects) {

            JSONObject effect = (JSONObject) oeffect;
            String key = effect.getString("key");
            JSONObject o = new JSONObject();
            effectsMapping.add(o);


            if (isiw_IL && getLable.containsKey(key) && getLable.get(key).equals("Soft Emphasis"))
                o.put("name", "Quote");
            else
                o.put("name", getLable.containsKey(key) ? getLable.get(key) : key);


            o.put("key", key);
            o.put("isSystem", isSystem.containsKey(key) ? true : false);
        }

    }

    private void prepTextViewerStyles(JSONArray textViewerStyles, JSONObject dlStylesJson, JSONArray stylesMapping) throws JSONException {

        JSONArray styles = dlStylesJson.getJSONArray("styles");
        for (Object ostyle : styles) {
            JSONObject style = (JSONObject) ostyle;
            String key = style.getString("key");
            if (key.equals("normal") || !isSystem.containsKey(key)) {

                JSONObject item = new JSONObject();

                item.put("id", "menu-button-style-" + key);
                item.put("label", getLable.containsKey(key) ? getLable.get(key) : key);
                item.put("event", "executeCommand");
                // item.put("icon", "sampleText");

                JSONArray args = new JSONArray();
                args.add("addStyle");
                JSONObject obj = new JSONObject();
                obj.put("style", key);
                obj.put("extraClass", key);
                args.add(obj);

                item.put("args", args);

                item.put("canBeDisabled", true);
                item.put("dontStealFocus", true);

                textViewerStyles.add(item);


            }
        }
        for (Object ostyle : styles) {
            JSONObject style = (JSONObject) ostyle;
            String key = style.getString("key");

            JSONObject o = new JSONObject();
            stylesMapping.add(o);

            o.put("name", getLable.containsKey(key) ? getLable.get(key) : key);
            o.put("key", key);
            o.put("isSystem", isSystem.containsKey(key) ? true : false);
        }
    }

    private boolean extractCgeStylesCss(JSONObject dlStylesJson, File customizationPackDir, List<String> hrefs, String menuCssPrefix, String TVEcssPrefix, Map<String, String> specialCssPrefixMap) throws JSONException, IOException {

        File cgsStyles = new File(customizationPackDir.getPath(), "cgs/styles.css");


        JSONArray styles = (JSONArray) dlStylesJson.get("styles");

        StringBuilder stylesCss = new StringBuilder();
        for (Object ostyle : styles) {
            JSONObject style = (JSONObject) ostyle;

            String csskey = menuCssPrefix + style.getString("key") + "," + TVEcssPrefix + style.getString("key");

            if (specialCssPrefixMap.containsKey(style.getString("key"))) {
                csskey = specialCssPrefixMap.get(style.getString("key"));
            }

            JSONArray arr = (JSONArray) style.get("cssArray");
            StringBuilder cssString = new StringBuilder();
            for (Object oItem : arr) {
                JSONObject item = (JSONObject) oItem;


                if (item.getString("name").equals("font-size") && item.getString("value").toLowerCase().endsWith("em")) {
                    Double val = Double.parseDouble(item.getString("value").replace("rem", "").replace("em", ""));
                    String sval;
                    if (item.getString("value").contains("rem")) {
                        val = val * 14;

                    } else {
                        val = val * 22;

                    }
                    sval = Math.round(val) + "px";

                    cssString.append(item.getString("name") + ":" + sval + ";");
                } else {
                    cssString.append(item.getString("name") + ":" + item.getString("value") + ";");
                }
            }
            stylesCss.append(csskey + "{\n\t" + cssString.toString() + "\n}\n");
        }


        if (!cgsStyles.exists()) {
            cgsStyles.createNewFile();
            try (FileWriter cgsStylesFileWriter = new FileWriter(cgsStyles, false)) {
                cgsStylesFileWriter.write(stylesCss.toString());
            }
        }
        hrefs.add("cgs/styles.css");
        return true;
    }

    private boolean extractCgeEffectsCss(JSONObject dlStylesJson, File customizationPackDir, List<String> hrefs, Map<String, String> specialCssPrefixMap) throws JSONException, IOException {

        File cgsEffects = new File(customizationPackDir.getPath(), "cgs/effects.css");


        JSONArray effects = (JSONArray) dlStylesJson.get("effects");

        StringBuilder effectsCss = new StringBuilder();
        for (Object oeffect : effects) {
            JSONObject effect = (JSONObject) oeffect;

            String csskey = "." + effect.getString("key");

            if (specialCssPrefixMap.containsKey(effect.getString("key"))) {
                csskey = specialCssPrefixMap.get(effect.getString("key"));
            }

            JSONArray arr = (JSONArray) effect.get("cssArray");
            StringBuilder cssString = new StringBuilder();
            for (Object oItem : arr) {
                JSONObject item = (JSONObject) oItem;

                if (item.getString("name").equals("font-size") && item.getString("value").toLowerCase().endsWith("em")) {

                    Double val = Double.parseDouble(item.getString("value").replace("rem", "").replace("em", ""));

                    if (item.getString("value").contains("rem")) {
                        val = val * 14;

                    } else {
                        val = val * 22;

                    }
                    String sval = val.intValue() + "px";

                    cssString.append(item.getString("name") + ":" + sval + ";");
                } else {
                    cssString.append(item.getString("name") + ":" + item.getString("value") + ";");
                }


                //   cssString.append(item.getString("name") + ":" + item.getString("value") + ";");

            }
            effectsCss.append(csskey + "{\n\t" + cssString.toString() + "\n}\n");
        }


        if (!cgsEffects.exists()) {
            cgsEffects.createNewFile();
            try (FileWriter cgsStylesFileWriter = new FileWriter(cgsEffects, false)) {
                cgsStylesFileWriter.write(effectsCss.toString());
            }
        }
        hrefs.add("cgs/effects.css");
        return true;
    }

    private boolean extractCgsFontsCss(JSONObject dlStylesJson, File customizationPackDir, List<String> hrefs) throws JSONException, IOException {

        File cgsFonts = new File(customizationPackDir.getPath(), "cgs/fonts.css");

        JSONArray fonts = (JSONArray) dlStylesJson.get("fonts");
        StringBuilder fontsCss = new StringBuilder();
        for (Object ofont : fonts) {
            JSONObject font = (JSONObject) ofont;
            JSONArray arr = (JSONArray) font.get("cssArray");
            StringBuilder cssString = new StringBuilder();
            for (Object oItem : arr) {
                JSONObject item = (JSONObject) oItem;
                if (item.getString("name").equals("src")) {

                    StringBuilder generatedValue = new StringBuilder();
                    JSONArray values = item.getJSONArray("value");
                    for (Object oval : values) {
                        JSONObject val = (JSONObject) oval;

                        generatedValue.append("url('" + val.getString("url") + "') ");
                        if (!val.getString("format").trim().isEmpty()) {

                            generatedValue.append("format('" + val.getString("format") + "'),");

                        } else
                            generatedValue.append(",");
                    }
                    assert generatedValue.toString().endsWith(",");

                    generatedValue.deleteCharAt(generatedValue.length() - 1);
                    cssString.append(item.getString("name") + ":" + generatedValue.toString() + ";");
                } else {

                    cssString.append(item.getString("name") + ":" + item.getString("value") + ";");

                }
            }
            fontsCss.append("@font-face {\n\t" + cssString.toString() + "\n}\n");
        }


        if (!cgsFonts.exists()) {
            cgsFonts.createNewFile();
            try (FileWriter cgsStylesFileWriter = new FileWriter(cgsFonts, false)) {
                cgsStylesFileWriter.write(fontsCss.toString());
            }
        }
        hrefs.add("cgs/fonts.css");
        return true;
    }

    private JSONObject prossessDlStyle(File customizationPackDir, List<String> hrefs) throws IOException, JSONException {

        File dlStyles = new File(customizationPackDir.getPath(), "dl/styles.json");
        if (!dlStyles.exists()) {

            File oldDlStyle = new File(customizationPackDir.getPath(), "dl/style.css");

            if (!oldDlStyle.exists()) return null;

            boolean isiwIL = customizationPackDir.getPath().contains("iw_IL");
            boolean isfrFR = customizationPackDir.getPath().contains("fr_FR");
            boolean isenEN = customizationPackDir.getPath().contains("en_US");
            boolean isEFL = customizationPackDir.getPath().contains("EFL");
            boolean isnlNL = customizationPackDir.getPath().contains("nl_NL");
            boolean isMHE = customizationPackDir.getPath().contains("MHE");

            boolean isjaJP = customizationPackDir.getPath().contains("ja_JP");
            boolean isznCN = customizationPackDir.getPath().contains("zn_CN");
            boolean isznHK = customizationPackDir.getPath().contains("zn_HK");
			boolean iskoKR = customizationPackDir.getPath().contains("ko_KR");

            CSSOMParser parser = new CSSOMParser();
            CSSStyleSheet stylesheet = parser.parseStyleSheet(new InputSource(new FileReader(oldDlStyle)), null, null);
            CSSRuleList ruleList = stylesheet.getCssRules();

            JSONObject stylesJson = new JSONObject();
            JSONArray fonts = new JSONArray();
            JSONArray effects = new JSONArray();
            JSONArray styles = new JSONArray();
            stylesJson.put("fonts", fonts);
            stylesJson.put("effects", effects);
            stylesJson.put("styles", styles);


            HashMap<String, Pair<String, JSONArray>> ruleMap = new HashMap<>();
            /////////styles//////////
            ruleMap.put("*.textViewer *.separatorTitle", new Pair("separatorTitle", styles));
            ruleMap.put("*.textViewer *.separatorSubTitle", new Pair("separatorSubTitle", styles));
            ruleMap.put("*.textViewer *.sequenceTitle", new Pair("sequenceTitle", styles));
            ruleMap.put("*.textViewer *.sequenceSubTitle", new Pair("sequenceSubTitle", styles));
            ruleMap.put("*.task_instruction_content *.textViewer", new Pair("sequenceSubTitle", styles));
            ruleMap.put("*.textViewer *.pedagogicalTitle", new Pair("pedagogicalTitle", styles));
            ruleMap.put("*.task.statement.pedagogical *.title *.textViewer", new Pair("pedagogicalTitle", styles));
            ruleMap.put("*.textViewer *.selfcheckTitle", new Pair("selfcheckTitle", styles));
            ruleMap.put("*.textViewer *.instruction", new Pair("instruction", styles));
            ruleMap.put("*.sequence_instruction_wrapper *.instruction *.textViewer", new Pair("instruction", styles));
            ruleMap.put("*.textViewer *.feedback", new Pair("feedback", styles));
            ruleMap.put("*.textViewer *.definition", new Pair("definition", styles));
            ruleMap.put("*.shortAnswer *.textViewer *.subQuestion", new Pair("subQuestion", styles));
            ruleMap.put("*.textViewer *.tableHeader", new Pair("tableHeader", styles));
            ruleMap.put("*.textViewer *.tableSummary", new Pair("tableSummary", styles));
            ruleMap.put("*.textViewer *.bankReadOnly", new Pair("bankReadOnly", styles));
            ruleMap.put("*.imageViewer *.caption *.textViewer", new Pair("imageCaption", styles));
            ruleMap.put("*.imageViewer *.credit *.textViewer", new Pair("imageCredit", styles));
            ruleMap.put("*.table *.row.title *.textViewer", new Pair("row.title", styles));
            ruleMap.put("*.table *.row.copyrights *.textViewer", new Pair("row.copyrights", styles));
            ruleMap.put("*.cloze *.subAnswer *.hint", new Pair("fillInTheGapsHint", styles));
            ruleMap.put("*.textViewer *.normal", new Pair("normal", styles));
            ruleMap.put("*.textViewer *.textViewerParagraph span.normal", new Pair("normal", styles));
            ruleMap.put("*.textViewer *.heading1", new Pair("heading1", styles));
            ruleMap.put("*.textViewer *.heading2", new Pair("heading2", styles));
            ruleMap.put("*.textViewer *.heading3", new Pair("heading3", styles));
            ruleMap.put("*.textViewer *.question", new Pair("question", styles));
            ruleMap.put("*.textViewer *.legende", new Pair("legende", styles));
            ruleMap.put("*.textViewer *.small", new Pair("small", styles));
            ruleMap.put("*.textViewer *.smallText", new Pair("small", styles));
            ruleMap.put("*.textViewer *.shortText", new Pair("shortText", styles));


            /////////effects//////////
            ruleMap.put("*.textViewer *.emphasis", new Pair("emphasis", effects));
            ruleMap.put("*.textViewer *.softEmphasis", new Pair("softEmphasis", effects));
            ruleMap.put("*.textViewer *.strongEmphasis", new Pair("strongEmphasis", effects));
            ruleMap.put("*.textViewer *.colorEmphasis", new Pair("colorEmphasis", effects));
            ruleMap.put("*.textViewer *.strongColorEmphasis", new Pair("strongColorEmphasis", effects));
            ruleMap.put("*.textViewer *.redEmphasis", new Pair("redEmphasis", effects));
            ruleMap.put("*.textViewer *.redItalEmphasis", new Pair("redItalEmphasis", effects));
            ruleMap.put("*.textViewer *.blueEmphasis", new Pair("blueEmphasis", effects));
            ruleMap.put("*.textViewer *.blueItalEmphasis", new Pair("blueItalEmphasis", effects));
            ruleMap.put("*.textViewer *.greenEmphasis", new Pair("greenEmphasis", effects));
            ruleMap.put("*.textViewer *.greenItalEmphasis", new Pair("greenItalEmphasis", effects));
            ruleMap.put("*.textViewer *.colorEmphasis1", new Pair("colorEmphasis1", effects));
            ruleMap.put("*.textViewer *.colorEmphasis2", new Pair("colorEmphasis2", effects));
            ruleMap.put("*.textViewer *.colorEmphasis3", new Pair("colorEmphasis3", effects));
            ruleMap.put("*.textViewer *.colorEmphasis4", new Pair("colorEmphasis4", effects));
            ruleMap.put("*.textViewer *.highlightColor4", new Pair("highlightColor4", effects));
            ruleMap.put("*.textViewer *.highlightColor3", new Pair("highlightColor3", effects));
            ruleMap.put("*.textViewer *.highlightColor2", new Pair("highlightColor2", effects));
            ruleMap.put("*.textViewer *.highlightColor1", new Pair("highlightColor1", effects));
            ruleMap.put("*.textViewer *.Emphasis", new Pair("emphasis", effects));
            ruleMap.put("*.textViewer *.emphasis2", new Pair("emphasis2", effects));

            ruleMap.put("*.textViewer *.quote", new Pair("quote", effects));
            ruleMap.put("*.textViewer *.link", new Pair("link", effects));
            ruleMap.put("*.textViewer *.credit", new Pair("credit", effects));
            ruleMap.put("*.textViewer *.partOfSpeach", new Pair("partOfSpeach", effects));
            ruleMap.put("*.textViewer *.turqoiseEmphasis", new Pair("turqoiseEmphasis", effects));
            ruleMap.put("*.textViewer *.orangeEmphasis", new Pair("orangeEmphasis", effects));


            List<CSSRule> toKeep = new LinkedList<>();
            for (int i = 0; i < ruleList.getLength(); i++) {
                CSSRule rule = ruleList.item(i);
                if (rule instanceof CSSStyleRule) {
                    CSSStyleRule styleRule = (CSSStyleRule) rule;

                    if (!extractRuleToJson(ruleMap, styleRule)) {

                        toKeep.add(rule);

                        try {
                            log += "WARNING: rule left behind:  css rule:" + rule.getCssText() + " customization pack dir: " + customizationPackDir.getPath() + "\n";
                        } catch (Exception e) {
                            log += "SYS_ERROR: logging error \n";
                        }

                    }


                } else if (rule.getCssText().startsWith("@font-face")) {
                    extractFontFaceToJson(fonts, rule);


                } else {
                    toKeep.add(rule);

                    try {
                        log += "WARNING: rule left behind (not CSSStyleRule or font ):  css rule:" + rule.getCssText() + " customization pack dir: " + customizationPackDir.getPath() + "\n";
                    } catch (Exception e) {
                        log += "SYS_ERROR: logging error \n";
                    }

                }
            }
            int l = stylesheet.getCssRules().getLength();
            while (l > 0) {
                stylesheet.deleteRule(0);
                l--;
            }
            for (int i = 0; i < toKeep.size(); i++) {
                stylesheet.insertRule(toKeep.get(i).toString(), i);
            }

            Set<String> keys = isSystem.keySet();
            for (String key : keys) {
                boolean hasKey = false;
                for (Object oitem : styles) {

                    JSONObject item = (JSONObject) oitem;

                    if (item.getString("key").equals(key)) {
                        hasKey = true;
                        break;
                    }
                }

                if (!hasKey) {
                    JSONObject obj = new JSONObject();
                    styles.add(obj);


                    obj.put("key", key);
                    JSONArray cssArray = new JSONArray();
                    obj.put("cssArray", cssArray);

                    JSONObject o1 = new JSONObject();
                    JSONObject o2 = new JSONObject();
                    cssArray.add(o1);
                    cssArray.add(o2);

                    o1.put("name", "font-size");
                    String tvalue;

                    if (isInRem.contains(key)) {

                        tvalue = String.format("%.2f", 1.57f) + "rem";

                    } else {
                        tvalue = String.format("%.2f", 1.00f) + "em";
                    }
                    o1.put("value", tvalue);

                    o2.put("name", "font-weight");
                    o2.put("value", "normal");

                }

            }


            if (isnlNL) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("colorEmphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "colorEmphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);

                    JSONObject itemmm2 = new JSONObject();
                    cssArray.put(itemmm2);

                    itemmm2.put("name", "color");
                    itemmm2.put("value", "rgb(0, 135, 137)");

                    effects.put(entry);
                }
            }


            /*just a block*/
            {

                boolean found = false;

                Iterator wallker = styles.iterator();
                while (wallker.hasNext() && !found) {


                    JSONObject it = (JSONObject) wallker.next();
                    JSONArray cssarray = it.getJSONArray("cssArray");
                    for (Object o : cssarray) {
                        JSONObject jo = (JSONObject) o;
                        if (jo.getString("name").equals("font-family"))
                            found = true;
                    }

                    if (!found) {

                        JSONObject newObj = new JSONObject();
                        newObj.put("name", "font-family");


                        if (isEFL) {
                            newObj.put("value", "'SS_TTK'");
                        } else if (isMHE) {
                            newObj.put("value", "'SRA_SANS_2'");
                        } else if (isenEN) {
                            newObj.put("value", "'T2K-Ayala'");
                        } else if (isjaJP) {
                            newObj.put("value", "'T2K-Ayala'");
                        } else if (isznCN) {
                            newObj.put("value", "'T2K-Ayala'");
                        } else if (isznHK) {
                            newObj.put("value", "'T2K-Ayala'");
						} else if (iskoKR) {
                            newObj.put("value", "'T2K-Ayala'");
                        } else if (isfrFR) {
                            newObj.put("value", "'verdana'");
                        } else if (isiwIL) {
                            newObj.put("value", "'daat'");
                        } else if (isnlNL) {
                            newObj.put("value", "'verdana'");
                        } else {
                            newObj.put("value", "'T2K-Ayala'");
                            log += "ERROR: in dir:" + customizationPackDir + " no default font was located using 'T2K-Ayala' " + "\n";
                        }
                        cssarray.add(newObj);
                    }


                }

            }


            if (isnlNL) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("strongEmphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "strongEmphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);
                    JSONObject itemmm = new JSONObject();
                    cssArray.put(itemmm);
                    JSONObject itemmm2 = new JSONObject();
                    cssArray.put(itemmm2);
                    itemmm.put("name", "font-weight");
                    itemmm.put("value", "bold");

                    itemmm2.put("name", "color");
                    itemmm2.put("value", "rgb(51, 51, 51)");

                    effects.put(entry);
                }
            }

            if (isMHE) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("emphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "emphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);
                    JSONObject itemmm = new JSONObject();
                    cssArray.put(itemmm);
                    itemmm.put("name", "font-weight");
                    itemmm.put("value", "bold");

                    effects.put(entry);
                }
            }


            if (isMHE) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("softEmphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "softEmphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);
                    JSONObject itemmm = new JSONObject();
                    cssArray.put(itemmm);
                    itemmm.put("name", "font-style");
                    itemmm.put("value", "italic");

                    effects.put(entry);
                }
            }


            if (isMHE) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("strongEmphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "strongEmphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);
                    JSONObject itemmm = new JSONObject();
                    cssArray.put(itemmm);
                    JSONObject itemmm2 = new JSONObject();
                    cssArray.put(itemmm2);
                    itemmm.put("name", "font-weight");
                    itemmm.put("value", "bold");

                    itemmm2.put("name", "font-style");
                    itemmm2.put("value", "italic");
                    effects.put(entry);
                }
            }


            if (isMHE) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("colorEmphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "colorEmphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);
                    JSONObject itemmm = new JSONObject();
                    cssArray.put(itemmm);
                    itemmm.put("name", "color");
                    itemmm.put("value", "rgb(193, 77, 145)");
                    effects.put(entry);
                }
            }


            if (isMHE) {

                boolean found = false;

                Iterator wallker = effects.iterator();
                while (wallker.hasNext() && !found) {
                    JSONObject it = (JSONObject) wallker.next();
                    if (it.get("key").equals("strongColorEmphasis"))
                        found = true;
                }


                if (!found) {
                    JSONObject entry = new JSONObject();
                    entry.put("key", "strongColorEmphasis");
                    JSONArray cssArray = new JSONArray();
                    entry.put("cssArray", cssArray);
                    JSONObject itemmm = new JSONObject();
                    cssArray.put(itemmm);

                    JSONObject itemmm2 = new JSONObject();
                    cssArray.put(itemmm2);
                    itemmm.put("name", "color");
                    itemmm.put("value", "rgb(193, 77, 145)");

                    itemmm2.put("name", "font-weight");
                    itemmm2.put("value", "bold");
                    effects.put(entry);
                }
            }










              /*just a block*/
            {


                Iterator wallker = effects.iterator();
                while (wallker.hasNext()) {

                    JSONObject it = (JSONObject) wallker.next();
                    JSONArray cssarray = it.getJSONArray("cssArray");
                    for (Object o : cssarray) {
                        JSONObject jo = (JSONObject) o;

                        if (jo.getString("name").equals("font-size")) {

                            String rem = jo.getString("value").replace("rem", "").replace("em", "").trim();
                            Double d = (Double.parseDouble(rem) * 100);
                            jo.put("value", d.toString().trim() + "%");

                        }
                    }
                }
            }


            dlStyles.createNewFile();
            try (FileWriter manifestFileWriter = new FileWriter(dlStyles, false)) {
                manifestFileWriter.write(stylesJson.toString());
            }
            oldDlStyle.delete();
            oldDlStyle.createNewFile();
            try (FileWriter cssFileWriter = new FileWriter(oldDlStyle, false)) {
                cssFileWriter.write(stylesheet.toString());
            }

            hrefs.add("dl/styles.json");


            try {
                File dumstyle = new File(customizationPackDir.getPath(), "cgs/style.css");
                List<CSSRule> shitToKeep = new LinkedList<>();

                CSSOMParser dumparser = new CSSOMParser();
                CSSStyleSheet dumstylesheet = dumparser.parseStyleSheet(new InputSource(new FileReader(dumstyle)), null, null);
                CSSRuleList dumruleList = dumstylesheet.getCssRules();

                for (int i = 0; i < dumruleList.getLength(); i++) {
                    CSSRule rule = dumruleList.item(i);
                    if (rule instanceof CSSStyleRule) {
                        CSSStyleRule styleRule = (CSSStyleRule) rule;

                        Iterator<Pair<String, JSONArray>> itr = ruleMap.values().iterator();

                        boolean found = false;
                        while (itr.hasNext() && !found) {

                            Pair p = itr.next();
                            if (p.value.equals(effects)) {
                                if (styleRule.getSelectorText().trim().contains("." + p.key)) {
                                    found = true;
                                }

                            } else {

                                if (styleRule.getSelectorText().trim().contains("body.texteditor > div." + p.key)) {

                                    found = true;

                                }
                            }
                        }
                        if (!found) {
                            shitToKeep.add(styleRule);
                        }
                    }
                }

                int blabla = dumstylesheet.getCssRules().getLength();
                while (blabla > 0) {
                    dumstylesheet.deleteRule(0);
                    blabla--;
                }
                for (int i = 0; i < shitToKeep.size(); i++) {
                    dumstylesheet.insertRule(shitToKeep.get(i).toString(), i);
                }

                dumstyle.delete();
                dumstyle.createNewFile();
                try (FileWriter cgsStylesFileWriter = new FileWriter(dumstyle, false)) {
                    cgsStylesFileWriter.write(dumstylesheet.toString());
                }
            } catch (Exception e) {

                log += "SYS_ERROR: failed to remove styles from style.css \n";

            }


            return stylesJson;
        }

        return null;
    }

    private boolean extractRuleToJson(HashMap<String, Pair<String, JSONArray>> ruleMap, CSSStyleRule styleRule) throws JSONException {

        String selectorText = styleRule.getSelectorText().trim();

        selectorText = selectorText.replace("*.iw_IL ", "").replace("*.nl_NL ", "").replace("*.he_IL ", "").replace("*.en_US ", "").replace("*.fr_FR", "").trim();

        if (ruleMap.containsKey(selectorText)) {


            Pair<String, JSONArray> target = ruleMap.get(selectorText);
            JSONObject entry = new JSONObject();

            boolean haveIt = false;
            Iterator iter = target.getValue().iterator();
            while (iter.hasNext() && !haveIt) {
                JSONObject it = (JSONObject) iter.next();
                if (it.getString("key").equals(target.getKey())) {
                    haveIt = true;
                }
            }

            if (!haveIt)
                target.getValue().add(entry);


            entry.put("key", target.getKey());
            JSONArray cssArray = new JSONArray();
            entry.put("cssArray", cssArray);

            String[] ParsedRule = styleRule.getStyle().toString().split(";");

            for (String prop : ParsedRule) {

                String[] propsplit = prop.split(":");


                if (!propsplit[0].trim().equals("float")) { //skip float

                    JSONObject item = new JSONObject();
                    item.put("name", propsplit[0].trim());


                    if (item.getString("name").equals("font-size") && propsplit[1].replace("!important", "").trim().toLowerCase().endsWith("px")) {
                        Double val = Double.parseDouble(propsplit[1].replace("!important", "").trim().replace("px", ""));
                        String sval;

                        if (isInRem.contains(target.getKey())) {
                            val = val / 14;
                            sval = String.format("%.2f", val) + "rem";

                        } else {
                            val = val / 22;
                            sval = String.format("%.2f", val) + "em";
                        }
                        item.put("value", sval);


                    } else {
                        item.put("value", propsplit[1].replace("!important", "").trim());
                    }


                    cssArray.add(item);
                }
            }
            return true;
        } else
            return false;
    }


    private void extractFontFaceToJson(JSONArray fonts, CSSRule rule) throws JSONException {

        JSONObject afont = new JSONObject();
        fonts.add(afont);
        String fontFaceRuleText = rule.getCssText();
        String fontFaceRuleInnerText = fontFaceRuleText.substring(fontFaceRuleText.indexOf("{") + 1, fontFaceRuleText.lastIndexOf("}")).replace("\n", "").replace("\r", "").trim();
        String[] ParsedFontFaceRule = fontFaceRuleInnerText.split(";");

        JSONArray cssArray = new JSONArray();
        afont.put("cssArray", cssArray);

        for (String prop : ParsedFontFaceRule) {
            JSONObject item = new JSONObject();
            String[] propsplit = prop.split(":");


            item.put("name", propsplit[0].trim());
            if (propsplit[0].trim().equals("src")) {


                String before = propsplit[1].trim();
                String[] parts = before.split(",");
                JSONArray value = new JSONArray();
                item.put("value", value);

                for (String part : parts) {
                    JSONObject p = new JSONObject();

                    String[] subParts = part.split("\\s*format\\s*\\(");

                    p.put("url", subParts[0].trim());

                    p.put("format", subParts.length > 1 ? subParts[1].substring(0, subParts[1].length() - 1) : "");

                    value.add(p);

                    if (!afont.has("key")) {
                        afont.put("key", subParts[0].substring(subParts[0].indexOf("/") + 1, subParts[0].indexOf(".")));

                    }

                }

            } else {
                if (propsplit[0].trim().equals("font-family")) {
                    item.put("value", "'" + propsplit[1].trim() + "'");
                } else
                    item.put("value", propsplit[1].trim());
            }
            cssArray.add(item);


        }
    }

    private void updateManifest(File customizationPackDir, List<String> hrefs) throws IOException, JSONException {

        File manifestFile = new File(customizationPackDir.getPath(), "manifest.json");
        InputStream is = new FileInputStream(manifestFile);
        String manifestTxt = IOUtils.toString(is);
        JSONObject manifest = new JSONObject(manifestTxt);


        manifest.put("files", new JSONArray(hrefs));

        manifest.put("version", this.new_version.toString());

        manifestFile.delete();
        manifestFile.createNewFile();
        try (FileWriter manifestFileWriter = new FileWriter(manifestFile, false)) {
            manifestFileWriter.write(manifest.toString());
        }


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

    @Required
    public void setConfiguration(Configuration configuration) {

        this.configuration = configuration;
    }


}
