package org.t2k.cgs.domain.usecases.ebooks;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.t2k.cgs.domain.model.ebooks.EBook;

import java.util.Date;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by Thalie.Mukhtar on 29/10/2015.
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BasicEBookDTO {

    private String eBookId;
    private String title;
    private String coverImage;
    private String sha1;
    private String conversionLibrary;
    private Date lastModified;
    /**
     * ID of an updated version of the eBook
     */
    private String updatedEBookId;

    public BasicEBookDTO(EBook eBook) {
        this.eBookId = eBook.getEBookId();
        this.title = eBook.getStructure().getTitle();
        this.coverImage = eBook.getStructure().getCoverImage();
        this.sha1 = eBook.getSha1();
        this.conversionLibrary = eBook.getConversionLibrary().libraryName();
        this.lastModified = eBook.getFirstVersionCreationDate() != null ? eBook.getCreationDate() : null;
        this.updatedEBookId = eBook.getUpdatedEBookId();
    }

    public String getCoverImage() {
        return coverImage;
    }

    public String getTitle() {
        return title;
    }

    public String getEBookId() {
        return eBookId;
    }

    public String getSha1() {
        return sha1;
    }

    public String getConversionLibrary() {
        return conversionLibrary;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BasicEBookDTO)) return false;
        BasicEBookDTO other = (BasicEBookDTO) o;
        return eBookId.equals(other.eBookId);
    }

    /**
     * ID of an updated version of the eBook
     */
    public String getUpdatedEBookId() {
        return updatedEBookId;
    }

    public Date getLastModified() {
        return lastModified;
    }
}