package org.t2k.cgs.validation;

import java.util.ArrayList;
import java.util.List;

public class SequencesIds {
    public SequencesIds() {
        this.sequences = new ArrayList<>();
    }

    public List<String> getSequences() {
        return sequences;
    }

    private void setSequences(List<String> sequences) {
        this.sequences = sequences;
    }

    List<String> sequences;
}
