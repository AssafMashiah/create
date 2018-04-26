package org.t2k.cgs.security;

import org.springframework.data.annotation.Id;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 24/06/14
 * Time: 14:26
 */

public class ExternalPartnerSettings {

    @Id
    private String id;
    private String externalAccountId;
    private PartnerAuthSettings fileUploadSettings;
    private String secretKey;
    private int accountId;

    public ExternalPartnerSettings(){} // empty constructor for json mapping purposes

    public ExternalPartnerSettings(Integer accountId, String secretKey) {
        this.accountId = accountId;
        this.externalAccountId = String.format("Create-%d", accountId);
        this.secretKey = secretKey;
    }

    public String getExternalAccountId() {
        return externalAccountId;
    }

    public PartnerAuthSettings getFileUploadSettings() {
        return fileUploadSettings;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public int getAccountId() {
        return accountId;
    }


    @Override
    public String toString() {
        return "ExternalPartnerSettings{" +
                "id='" + id + '\'' +
                ", externalAccountId='" + externalAccountId + '\'' +
                ", fileUploadSettings=" + fileUploadSettings +
                ", secretKey='" + secretKey + '\'' +
                ", accountId=" + accountId +
                '}';
    }
}
