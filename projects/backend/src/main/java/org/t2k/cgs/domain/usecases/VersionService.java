package org.t2k.cgs.domain.usecases;

import java.io.File;
import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 5:12 PM
 */
public interface VersionService {

    String getFullVersion();

    String getVersionMajor();

    String getVersionMinor();

    String getVersionMilestone();

    String getVersionBuild();

    /**
     * Exports a file that will hold the major, minor, milestone and build versions of the application to the specified
     * destination
     *
     * @param destinationFile file where to write the version info
     * @return true if the file was successfully exported, false otherwise
     * @throws IOException if an I/O error occurs.
     */
    boolean exportVersionFile(File destinationFile) throws IOException;
}
