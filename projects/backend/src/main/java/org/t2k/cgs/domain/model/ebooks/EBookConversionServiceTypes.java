package org.t2k.cgs.domain.model.ebooks;

import org.t2k.cgs.domain.model.utils.Pair;

import java.util.ArrayList;
import java.util.List;

public enum EBookConversionServiceTypes {
    IDR("IDR"),
    PDFEX("Pdf2htmlEX"),
    QOPPA("Qoppa"),
    EPUB("Epub");

    private String libraryName;

    EBookConversionServiceTypes(String libraryName) {
        this.libraryName = libraryName;
    }

    public String libraryName() {
        return libraryName;
    }

    public static List<Pair<String, String>> getPdfConversionOptions() {

        List<Pair<String, String>> pdfConverters = new ArrayList<>();
        pdfConverters.add(new Pair<>(IDR.name(), IDR.libraryName()));
        pdfConverters.add(new Pair<>(PDFEX.name(), PDFEX.libraryName()));
        return pdfConverters;
    }
}
