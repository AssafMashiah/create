package org.t2k.cgs.ebooks;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookFormat;

/**
 * Created by moshe.avdiel on 11/1/2015.
 */
@Service("eBookConversionServiceFactory")
public class EBookConversionServiceFactory {

    private Logger logger = Logger.getLogger(getClass());

    @Autowired
    private EBookConversionService epubToEBookConversionService;

    @Autowired
    private EBookConversionService pdfToEBookIDRConversionService;

    @Autowired
    private EBookConversionService pdfToEBookQOPPAConversionService;

    @Autowired
    private EBookConversionService pdfToEBookPdf2HtmlEXConversionService;

    /***
     * @param eBookFormat  - PDF \ EPUB
     * @param pdfConverter - if this is PDF, states the library that will be used for conversion. if EPUB - will be ignored, can be null
     * @return the bean of the conversion service
     * @throws DsException
     */
    public EBookConversionService getEBookConversionService(EBookFormat eBookFormat, EBookConversionServiceTypes pdfConverter) {

        logger.debug(String.format("Getting Conversion Service for eBook Format: %s", eBookFormat.name()));
        switch (eBookFormat) {
            case EPUB: {
                return epubToEBookConversionService;
            }

            case PDF: {
                switch (pdfConverter) {
                    case IDR:
                        return pdfToEBookIDRConversionService;//idrbean
                    case PDFEX:
                        return pdfToEBookPdf2HtmlEXConversionService;//pdfex bean
                    case QOPPA:
                        return pdfToEBookQOPPAConversionService;//qoppa bean
                }
            }
        }
        logger.error(String.format("PDF conversion is not supported, input parameters: eBookFormat: %s, pdfConverter: %s", eBookFormat, pdfConverter.name()));
        return null;
    }
}