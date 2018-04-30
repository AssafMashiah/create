package org.t2k.cgs.domain.model.user;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 14:30
 */
public class FileSizeLimit {

    private String type;

    private List<String> mimeTypes;

    private long size;


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getMimeTypes() {
        return mimeTypes;
    }

    public void setMimeTypes(List<String> mimeTypes) {
        this.mimeTypes = mimeTypes;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    @Override
    public String toString() {
        return "FileSizeLimit{" +
                "type='" + type + '\'' +
                ", mimeTypes=" + mimeTypes +
                ", size=" + size +
                '}';
    }

}
