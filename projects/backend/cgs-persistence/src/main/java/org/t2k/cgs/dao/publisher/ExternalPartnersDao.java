package org.t2k.cgs.dao.publisher;

import org.t2k.cgs.security.ExternalPartnerSettings;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/6/15
 * Time: 10:14 PM
 */
public interface ExternalPartnersDao {

    void insertOrUpdateExternalPartnerSetting(ExternalPartnerSettings baseSettings);

    List<ExternalPartnerSettings> getExternalPartnersByPublisherId(int publisherId);

    List<ExternalPartnerSettings> getExternalPartnerByExternalAccountId(String externalAccountId);

    void deleteAllExternalPartnersOfPublisherId(int publisherId);
}
