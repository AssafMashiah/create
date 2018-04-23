package org.t2k.cgs.ebooks;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookStructure;
import org.t2k.cgs.model.ebooks.UploadEBookData;

/**
 * Created by moshe.avdiel on 10/29/2015.
 */
public interface EBookConversionService {

    EBookStructure generateEBookStructure(UploadEBookData uploadEBookData) throws Exception;

    boolean isValid(UploadEBookData uploadEBookData) throws DsException;

    void generatePageThumbnails(EBookStructure eBookStructure, UploadEBookData uploadEBookData) throws Exception;

    EBookConversionServiceTypes getEBookConversionServiceType();

    String getEbookConversionLibraryVersion();
}
