package org.t2k.cgs.domain.usecases.tocitem.tocimport;

import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItem;

import java.util.List;

/**
 * @author Alex Burdusel on 2016-12-23.
 */
class TocItemAndSequences {
    private TocItem tocItem;
    private List<Sequence> sequences;

    TocItemAndSequences(TocItem tocItem,
                        List<Sequence> sequences) {
        this.tocItem = tocItem;
        this.sequences = sequences;
    }

    public TocItem getTocItem() {
        return tocItem;
    }

    public List<Sequence> getSequences() {
        return sequences;
    }

}
