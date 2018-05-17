package org.t2k.cgs.domain.model.ebooks;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JouveEnrichment {

    private String title;
    private String type;
    private String path;

    /**
     * Creates a new instance of JouveEnrichment from the given {@code Builder}
     */
    private static JouveEnrichment newInstance(Builder builder) {
        JouveEnrichment jouveEnrichment = new JouveEnrichment();
        jouveEnrichment.title = builder.title;
        jouveEnrichment.type = builder.type;
        jouveEnrichment.path = builder.path;
        return jouveEnrichment;
    }

    /**
     * A {@code Builder} used to create instances of {@link JouveEnrichment}
     */
    public static final class Builder {

        private String title;
        private String type;
        private String path;

        /**
         * Constructs a {@link JouveEnrichment} builder
         */
        public Builder() {
        }

        /**
         * Creates a new instance of {@link JouveEnrichment} based on the properties set
         * on this builder
         */
        public JouveEnrichment build() {
            return newInstance(this);
        }

        /**
         * @param title
         * @return this {@code Builder}
         */
        public Builder title(String title) {
            this.title = title;
            return this;
        }

        /**
         * @param type
         * @return this {@code Builder}
         */
        public Builder type(String type) {
            this.type = type;
            return this;
        }

        /**
         * @param path
         * @return this {@code Builder}
         */
        public Builder path(String path) {
            this.path = path;
            return this;
        }
    }

    public String getTitle() {
        return title;
    }

    public String getType() {
        return type;
    }

    public String getPath() {
        return path;
    }
}
