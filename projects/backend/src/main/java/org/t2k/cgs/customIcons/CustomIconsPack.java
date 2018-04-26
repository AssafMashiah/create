package org.t2k.cgs.customIcons;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.t2k.utils.JsonDateDeserializer;
import org.t2k.utils.JsonMongoDateSerializer;

import java.util.Date;

/**
 * Note: This class has a natural ordering that is inconsistent with equals.
 *
 * @author Alex Burdusel on 2016-07-27.
 */
public class CustomIconsPack implements Comparable<CustomIconsPack> {

    public enum Type {
        PLAYER("Player_Iconfont"),
        ENRICHMENT("eBook_Iconfont");

        private String fontFamily;

        Type(String fontFamily) {
            this.fontFamily = fontFamily;
        }

        public static Type forName(String name) {
            for (Type type : Type.values()) {
                if (type.name().equals(name)) {
                    return type;
                }
            }
            return null;
        }

        public String getFontFamily() {
            return fontFamily;
        }
    }

    public enum FontType {
        WOFF("woff", "woff"),
        EOT("eot", "embedded-opentype"),
        TTF("ttf", "truetype"),
        SVG("svg", "svg");

        private String name;
        private String format;

        FontType(String name, String format) {
            this.name = name;
            this.format = format;
        }

        public static FontType forName(String name) {
            for (FontType type : FontType.values()) {
                if (type.name().equalsIgnoreCase(name)) {
                    return type;
                }
            }
            return null;
        }

        public String getName() {
            return name;
        }

        public String getFormat() {
            return format;
        }
    }

    protected long version;
    protected Type type;
    @JsonSerialize(using = JsonMongoDateSerializer.class)
    @JsonDeserialize(using = JsonDateDeserializer.class)
    protected Date creationDate;

    public long getVersion() {
        return version;
    }

    public Type getType() {
        return type;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    @Override
    public int compareTo(CustomIconsPack o) {
        if (this == o) {
            return 0;
        }
        int typeDiff = this.type.compareTo(o.type);
        if (typeDiff != 0) {
            return typeDiff;
        }
        return (this.version < o.version) ? -1 : ((this.version == o.version) ? 0 : 1);
    }
}
