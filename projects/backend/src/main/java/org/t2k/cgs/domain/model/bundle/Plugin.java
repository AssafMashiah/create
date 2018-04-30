package org.t2k.cgs.domain.model.bundle;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 05/08/14
 * Time: 13:13
 * To change this template use File | Settings | File Templates.
 */
public class Plugin {

    private String folder;
    private String name;

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Plugin{" +
                ", folder='" + folder + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}