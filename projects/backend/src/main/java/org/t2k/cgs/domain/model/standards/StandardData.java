package org.t2k.cgs.domain.model.standards;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * <dt>Created:</dt><dd>16-02-28</dd>
 * <dt>Author:</dt><dd>Moshe Avdiel</dd>
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class StandardData {
    // {"name":"Moshe","subjectArea":"Math","description":"MyDesc","country":"USA","purpose":"NoPurpose","version":"4.0","created":"29/02/2016 19:52:37"}
    private String name;

    private String accountId;
    private String packageId;

    public StandardData(String accountId) {
        this.accountId = accountId;


    }

    public String getAccountId() {
        return this.accountId;
    }

    public String getPackageId() {
        return this.packageId;
    }
}
