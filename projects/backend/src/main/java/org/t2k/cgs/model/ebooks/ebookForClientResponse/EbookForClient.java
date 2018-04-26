package org.t2k.cgs.model.ebooks.ebookForClientResponse;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBook;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by thalie.mukhtar on 8/2/2016.
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class EbookForClient {
    private String eBookId;
    private String originalFileName;
    private EBookConversionServiceTypes conversionLibrary;
    private EBookStructureForClient structure;

    public EbookForClient(EBook eBook) {
        this.eBookId = eBook.getEBookId();
        this.originalFileName = eBook.getOriginalFileName();
        this.conversionLibrary = eBook.getConversionLibrary();
        this.structure = new EBookStructureForClient(eBook.getStructure());
    }

    public String getEBookId() {
        return eBookId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public EBookConversionServiceTypes getConversionLibrary() {
        return conversionLibrary;
    }

    public EBookStructureForClient getStructure() {
        return structure;
    }
}
