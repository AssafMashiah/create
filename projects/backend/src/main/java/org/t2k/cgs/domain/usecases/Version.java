package org.t2k.cgs.domain.usecases;

/**
 * @author Alex Burdusel on 2016-08-18.
 */
public class Version {

    private String major;
    private String minor;
    private String milestone;
    private String build;

    public static Version newInstance(String major,
                                      String minor,
                                      String milestone,
                                      String build) {
        Version version = new Version();
        version.major = major;
        version.minor = minor;
        version.milestone = milestone;
        version.build = build;
        return version;
    }

    public static Version newInstance(Version oldVersion, String build) {
        Version version = new Version();
        version.major = oldVersion.major;
        version.minor = oldVersion.minor;
        version.milestone = oldVersion.milestone;
        version.build = build;
        return version;
    }


    public String getBuild() {
        return build;
    }

    public String getMajor() {
        return major;
    }

    public String getMinor() {
        return minor;
    }

    public String getMilestone() {
        return milestone;
    }

    @Override
    public String toString() {
        return this.major + "." + this.minor + "." + this.milestone + "." + this.build;
    }
}
