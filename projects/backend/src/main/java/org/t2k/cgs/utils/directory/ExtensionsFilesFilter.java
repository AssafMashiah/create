package org.t2k.cgs.utils.directory;

import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 17/12/2015
 * Time: 11:55
 */
public class ExtensionsFilesFilter implements FileFilter {

    private List<String> extensions;

    public ExtensionsFilesFilter(List<String> extensions) {
        this.extensions = new ArrayList<>(extensions.size());
        for (String extension : extensions) {
            this.extensions.add(extension.toLowerCase());
        }
    }

    @Override
    public boolean accept(File file) {
        if (file.isDirectory()) {
            return false;
        }

        String lowerCaseExtension = FilenameUtils.getExtension(file.getName()).toLowerCase();
        if (extensions.contains(lowerCaseExtension)) {
            return true;
        }

        return false;
    }
}