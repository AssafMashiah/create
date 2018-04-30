package org.t2k.cgs.domain.usecases.ebooks;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.ebooks.EBookStructure;

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
