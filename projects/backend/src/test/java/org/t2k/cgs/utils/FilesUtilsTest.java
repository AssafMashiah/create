package org.t2k.cgs.utils;

import org.apache.commons.io.FileUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;

/**
 * @author Alex Burdusel on 2017-02-08.
 */
public class FilesUtilsTest {

    @Test
    public void replaceStringInFile() throws IOException {
        File file = new File("testStringReplaceFile");
        try (FileWriter fw = new FileWriter(file)) {
            fw.write("string to replace");
        }
        FilesUtils.replaceStringInFile(file, "string to replace", "replaced string");
        String fileContent = FileUtils.readFileToString(file);
        Assert.assertEquals(fileContent, "replaced string");
        file.delete();
    }

    @Test
    public void replaceStringsInFile() throws IOException {
        File file = new File("testStringReplaceFile");
        try (FileWriter fw = new FileWriter(file)) {
            fw.write("string to replace");
        }
        FilesUtils.replaceStringsInFile(file, Collections.singletonMap("string to replace", "replaced string"));
        String fileContent = FileUtils.readFileToString(file);
        Assert.assertEquals(fileContent, "replaced string");
        file.delete();
    }
}
