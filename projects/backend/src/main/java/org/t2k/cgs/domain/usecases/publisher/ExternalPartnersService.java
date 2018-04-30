package org.t2k.cgs.domain.usecases.publisher;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/6/15
 * Time: 7:51 PM
 */
public interface ExternalPartnersService {

    /***
     * creates an object with basic external partners data such as externalAccountId and a secretKey related to the account with id publisherId
     * @param publisherId  - publisher ID in cgs
     */
    void addBaseExternalPartnersDataForPublisherId(Integer publisherId);

    /***
     *
     * @param publisherId   - publisher ID in cgs
     * @return a list of ExternalPartnerSettings related to the publisher with id @publisherId
     */
    List<ExternalPartnerSettings> getExternalPartnersByPublisherId(int publisherId);

    /***
     *
     * @param externalAccountId   - externalAccountId ID in cgs
     * @return a list of ExternalPartnerSettings related to the publisher with id @externalAccountId
     */
    List<ExternalPartnerSettings> getExternalPartnersByExternalAccountId(String externalAccountId);

    /***
     * deletes all objects that concern @publisherId from externalPartners collection
     * @param publisherId   - publisher ID in cgs
     */
    void deleteAllDataRegardingPublisherId(int publisherId);
}
