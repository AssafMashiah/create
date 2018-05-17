package org.t2k.cgs.domain.model.course;

import javax.validation.constraints.NotNull;
import java.util.Objects;

/**
 * A reference to a widget applet used in Teach toolbox feature.
 * <p>
 * No resources are stored on create filesystem, only the data in this object
 */
public class ToolboxWidget {

    /**
     * Widget applet uuid
     */
    @NotNull
    private String guid;

    @NotNull
    private String name;
    private String thumbnailData;
    private String thumbnailMimeType;

    public String getGuid() {
        return guid;
    }

    public String getName() {
        return name;
    }

    public String getThumbnailData() {
        return thumbnailData;
    }

    public String getThumbnailMimeType() {
        return thumbnailMimeType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ToolboxWidget that = (ToolboxWidget) o;
        return Objects.equals(guid, that.guid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(guid);
    }

    @Override
    public String toString() {
        return "ToolboxWidget{" +
                "guid='" + guid + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
