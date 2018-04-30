package org.t2k.cgs.domain.usecases.ebooks.conversion;

/**
 * Bean class holding the parameters about the structure of the course to be created from an EBook. Currently not all of them are functional,
 * as EBookToCourseToc classes need to be extended to support them.
 *
 * @author Alex Burdusel on 2016-06-22.
 */
public class EBookToCourseTocStructure {

    /**
     * Weather to include learning objects in tocItemRefs or not
     */
    private boolean hasLearningObject;
    /**
     * The minimum depth of the epub toc from which we can create the EBook TOC, otherwise we create only lessons (0 based)
     */
    private Integer minDepthThresholdForTocCreation;
    /**
     * The depth of the nested TOC for the EBook. 0 if not nested
     */
    private Integer nestedTocDepth;
    /**
     * The tocRefCreationThreshold is the threshold at which we stop creating lessons from children and use them
     * as learning objects.
     */
    private Integer tocRefCreationThreshold;
    /**
     * The maximum depth of the nested learning objects
     */
    private Integer nestedLearningObjectsDepth;

    private static EBookToCourseTocStructure newInstance(Builder builder) {
        EBookToCourseTocStructure structure = new EBookToCourseTocStructure();
        structure.hasLearningObject = builder.hasLearningObject;
        structure.minDepthThresholdForTocCreation = builder.minDepthThresholdForTocCreation;
        structure.nestedTocDepth = builder.nestedTocDepth;
        structure.tocRefCreationThreshold = builder.tocRefCreationThreshold;
        structure.nestedLearningObjectsDepth = builder.nestedLearningObjectsDepth;
        return structure;
    }

    /**
     * Weather to include learning objects in tocItemRefs or not
     */
    public boolean isHasLearningObject() {
        return hasLearningObject;
    }

    public static class Builder {
        // default values are set for Editis
        private boolean hasLearningObject;
        private Integer minDepthThresholdForTocCreation = 2;
        private Integer nestedTocDepth = 0;
        private Integer tocRefCreationThreshold = 1;
        private Integer nestedLearningObjectsDepth = 0;

        /**
         * @param hasLearningObject Weather to include learning objects in tocItemRefs or not
         */
        public Builder(boolean hasLearningObject) {
            this.hasLearningObject = hasLearningObject;
        }

        public EBookToCourseTocStructure build() {
            return newInstance(this);
        }

        /**
         * The minimum depth of the epub toc from which we can create the EBook TOC, otherwise we create only lessons (0 based)
         */
        public Builder setMinDepthThresholdForTocCreation(Integer minDepthThresholdForTocCreation) {
            this.minDepthThresholdForTocCreation = minDepthThresholdForTocCreation;
            return this;
        }

        /**
         * The depth of the nested TOC for the EBook. 0 if not nested
         */
        public Builder setNestedTocDepth(Integer nestedTocDepth) {
            this.nestedTocDepth = nestedTocDepth;
            return this;
        }

        /**
         * The tocRefCreationThreshold is the threshold at which we stop creating lessons from children and use them
         * as learning objects.
         */
        public Builder setTocRefCreationThreshold(Integer tocRefCreationThreshold) {
            this.tocRefCreationThreshold = tocRefCreationThreshold;
            return this;
        }

        /**
         * The maximum depth of the nested learning objects
         */
        public Builder setNestedLearningObjectsDepth(Integer nestedLearningObjectsDepth) {
            this.nestedLearningObjectsDepth = nestedLearningObjectsDepth;
            return this;
        }
    }

    public boolean hasLearningObjects() {
        return hasLearningObject;
    }

    /**
     * The depth of the nested TOC for the EBook. 0 if not nested
     */
    public Integer getNestedTocDepth() {
        return nestedTocDepth;
    }

    /**
     * The tocRefCreationThreshold is the threshold at which we stop creating lessons from children and use them
     * as learning objects.
     */
    public Integer getTocRefCreationThreshold() {
        return tocRefCreationThreshold;
    }

    /**
     * The maximum depth of the nested learning objects
     */
    public Integer getNestedLearningObjectsDepth() {
        return nestedLearningObjectsDepth;
    }

    /**
     * The minimum depth of the epub toc from which we can create the EBook TOC, otherwise we create only lessons (0 based)
     */
    public Integer getMinDepthThresholdForTocCreation() {
        return minDepthThresholdForTocCreation;
    }
}
