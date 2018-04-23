package org.t2k.cgs.customIcons;

import org.apache.log4j.Logger;
import org.springframework.data.annotation.Transient;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Note: This class has a natural ordering that is inconsistent with equals. This class extends {@link CustomIconsPack}
 * which implements {@link Comparable}<{@link CustomIconsPack}>
 */
public class PublisherCustomIconsPack extends CustomIconsPack {
    @Transient
    private static Logger logger = Logger.getLogger(PublisherCustomIconsPack.class);

    protected String baseDir;
    protected List<String> hrefs = new ArrayList<>();

    public static PublisherCustomIconsPack newInstance(@NotNull String baseDir,
                                                       long version,
                                                       @NotNull List<String> hrefs,
                                                       @NotNull Type type,
                                                       @NotNull Date creationDate) {
        PublisherCustomIconsPack customIconsPack = new PublisherCustomIconsPack();
        customIconsPack.version = version;
        customIconsPack.baseDir = baseDir;
        customIconsPack.hrefs.addAll(hrefs);
        customIconsPack.type = type;
        customIconsPack.creationDate = creationDate;
        return customIconsPack;
    }

    public String getBaseDir() {
        return baseDir;
    }

    public List<String> getHrefs() {
        return hrefs;
    }

    /**
     * Two {@link PublisherCustomIconsPack}s are equal if they are of the same type. We use this to make sure that the publisher
     * doesn't have multiple {@link PublisherCustomIconsPack}s of the same type. Use compareTo to check the version.
     */
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (obj.getClass() != getClass()) {
            return false;
        }
        PublisherCustomIconsPack other = (PublisherCustomIconsPack) obj;
        return this.type == other.type;
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + type.hashCode();
        return result;
    }
}
