package org.t2k.cgs.domain.model.tocItem;

import javax.validation.Valid;
import java.util.List;

public class RubricsCriteria {

    private String cid;
    private String mimeType;
    private Object nameData;
    private Object totalScore;
    @Valid
    private List<GradingScale> gradingScales;

    public String getCid() {
        return cid;
    }

    public String getMimeType() {
        return mimeType;
    }

    public Object getNameData() {
        return nameData;
    }

    public Object getTotalScore() {
        return totalScore;
    }

    public List<GradingScale> getGradingScales() {
        return gradingScales;
    }
}
