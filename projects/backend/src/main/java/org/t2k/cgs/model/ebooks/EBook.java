package org.t2k.cgs.model.ebooks;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.log4j.Logger;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.CompareResult;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.enums.EBookPagesSourceTypes;
import org.t2k.cgs.model.ContentItemBase;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

@Document(collection = "ebooks")
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class EBook implements ContentItemBase {

    @Transient
    @JsonIgnore
    private Logger logger = Logger.getLogger(this.getClass());

    @Id
    private String id;
    private String eBookId;
    private String originalFileName;
    private String username;
    private String sha1;
    private EBookConversionServiceTypes conversionLibrary;
    private String conversionLibraryVersion;
    private int publisherId;

    private Date creationDate;
    /**
     * Creation date of the first uploaded version of this eBook
     */
    private Date firstVersionCreationDate;
    /**
     * ID of the latest version of the eBook
     */
    private String updatedEBookId;

    private EBookStructure structure;
    private String cgsVersion;
    private EBookPagesSourceTypes pagesSource;

    public static EBook newInstance(Builder builder) {
        EBook eBook = new EBook();
        eBook.eBookId = builder.eBookId;
        eBook.originalFileName = builder.originalFileName;
        eBook.username = builder.username;
        eBook.sha1 = builder.sha1;
        eBook.conversionLibrary = builder.conversionLibrary;
        eBook.conversionLibraryVersion = builder.conversionLibraryVersion;
        eBook.publisherId = builder.publisherId;
        eBook.creationDate = builder.creationDate;
        eBook.firstVersionCreationDate = builder.firstVersionCreationDate;
        eBook.updatedEBookId = builder.updatedEBookId;
        eBook.structure = builder.structure;
        eBook.cgsVersion = builder.cgsVersion;
        eBook.pagesSource = builder.pagesSource;
        return eBook;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    @Override
    public String getContentId() {
        return eBookId;
    }

    @Override
    public void setContentId(String cid) {
        throw new UnsupportedOperationException("Unable to set cid on eBook");
    }

    @Override
    public EntityType getEntityType() {
        return EntityType.EBOOK;
    }

    @Override
    public String getEntityId() {
        return eBookId;
    }

    @Override
    public String getContentVersionNumber() {
        return null;
    }

    @Override
    public String getTitle() {
        return originalFileName;
    }

    @Override
    public Date getLastModified() {
        return creationDate;
    }

    public static final class Builder {
        private String eBookId;
        private String originalFileName;
        private String username;
        private String sha1;
        private EBookConversionServiceTypes conversionLibrary;
        private String conversionLibraryVersion;
        private int publisherId;
        private Date creationDate;
        private Date firstVersionCreationDate;
        private String updatedEBookId;
        private EBookStructure structure;
        private String cgsVersion;
        private EBookPagesSourceTypes pagesSource;

        public Builder(String eBookId, int publisherId, String sha1) {
            this.eBookId = eBookId;
            this.publisherId = publisherId;
            this.sha1 = sha1;
        }

        public EBook build() {
            return newInstance(this);
        }

        public Builder setOriginalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
            return this;
        }

        public Builder setUsername(String username) {
            this.username = username;
            return this;
        }

        public Builder setConversionLibrary(EBookConversionServiceTypes conversionLibrary) {
            this.conversionLibrary = conversionLibrary;
            return this;
        }

        public Builder setConversionLibraryVersion(String conversionLibraryVersion) {
            this.conversionLibraryVersion = conversionLibraryVersion;
            return this;
        }

        public Builder setCreationDate(Date creationDate) {
            this.creationDate = creationDate;
            return this;
        }

        public Builder setFirstVersionCreationDate(Date firstVersionCreationDate) {
            this.firstVersionCreationDate = firstVersionCreationDate;
            return this;
        }

        public Builder setUpdatedEBookId(String updatedEBookId) {
            this.updatedEBookId = updatedEBookId;
            return this;
        }

        public Builder setStructure(EBookStructure structure) {
            this.structure = structure;
            return this;
        }

        public Builder setCgsVersion(String cgsVersion) {
            this.cgsVersion = cgsVersion;
            return this;
        }

        public Builder setPagesSource(EBookPagesSourceTypes pagesSource) {
            this.pagesSource = pagesSource;
            return this;
        }
    }


    public EBookStructure getStructure() {
        return structure;
    }

    public String getEBookId() {
        return eBookId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getUsername() {
        return username;
    }

    public String getSha1() {
        return sha1;
    }

    public EBookConversionServiceTypes getConversionLibrary() {
        return conversionLibrary;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public String getConversionLibraryVersion() {
        return conversionLibraryVersion;
    }

    public void setConversionLibraryVersion(String conversionLibraryVersion) {
        this.conversionLibraryVersion = conversionLibraryVersion;
    }

    public void setEBookConversionServiceTypes(EBookConversionServiceTypes conversionLibrary) {
        this.conversionLibrary = conversionLibrary;
    }

    public String getCgsVersion() {
        return cgsVersion;
    }

    public void setCgsVersion(String cgsVersion) {
        this.cgsVersion = cgsVersion;
    }

    public EBookPagesSourceTypes getPagesSource() {
        return pagesSource;
    }

    @Override
    public String toString() {
        return "EBook{" +
                "\"id\": \"" + id + '\"' +
                ", \"eBookId\": \"" + eBookId + '\"' +
                ", \"originalFileName\": \"" + originalFileName + '\"' +
                ", \"username\": \"" + username + '\"' +
                ", \"sha1\": \"" + sha1 + '\"' +
                ", \"conversionLibrary\": \"" + conversionLibrary + '\"' +
                ", \"conversionLibraryVersion\": \"" + conversionLibraryVersion + '\"' +
                ", \"publisherId\": " + publisherId +
                ", \"creationDate\": \"" + creationDate + '\"' +
                ", \"firstVersionCreationDate\": \"" + firstVersionCreationDate + '\"' +
                ", \"updatedEBookId\": \"" + updatedEBookId + '\"' +
                ", \"structure\": " + structure +
                ", \"cgsVersion\": \"" + cgsVersion + '\"' +
                ", \"pagesSource\": " + pagesSource +
                '}';
    }

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
        EBook other = (EBook) obj;
        return this.eBookId.equals(other.eBookId);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + eBookId.hashCode();
        return result;
    }

    /**
     * ID of the latest version of the eBook
     */
    public String getUpdatedEBookId() {
        return updatedEBookId;
    }

    /**
     * @param updatedEBookId ID of the latest version of the eBook
     */
    public void setUpdatedEBookId(String updatedEBookId) {
        this.updatedEBookId = updatedEBookId;
    }

    /**
     * Creation date of the first uploaded version of this eBook
     */
    public Date getFirstVersionCreationDate() {
        return firstVersionCreationDate;
    }

    public void setFirstVersionCreationDate(Date firstVersionCreationDate) {
        this.firstVersionCreationDate = firstVersionCreationDate;
    }

    /**
     * Compares the structure of this eBook with the structure of another eBook. Returns a {@link CompareResult}
     * containing a negative integer, zero, or a positive integer as this object's structure is less
     * than, equal to, or greater than the specified object.
     * <p>
     * Equal structures means the same number of pages and the same pages IDs
     * </p>
     *
     * @param other the eBook to be compared
     * @return a {@link CompareResult} containing a negative integer, zero, or a positive integer as this object's
     * structure is less than, equal to, or greater than the specified object.
     */
    public CompareResult compareStructureTo(EBook other) {
        logger.debug(String.format("Comparing structure of eBook %s \n with eBook \n %s", this, other));
        int result = 0;
        List<String> differences = new ArrayList<>();
        if (this.structure.getNumberOfPages() != other.structure.getNumberOfPages()) {
            result = this.structure.getNumberOfPages() - other.structure.getNumberOfPages();
            differences.add(String.format("Number of pages does not match. Current eBook has %s pages, while new eBook " +
                    "has %s pages", this.structure.getNumberOfPages(), other.structure.getNumberOfPages()));
        }
        List<Page> thisEBookPages = this.structure.getPages();
        for (Page page : thisEBookPages) {
            if (other.structure.getPageById(page.getId()) == null) {
                result = -1;
                differences.add(String.format("Page with ID '%s' not found on new eBook", page.getId()));
            }
        }
        return CompareResult.newInstance(result, differences);
    }
}