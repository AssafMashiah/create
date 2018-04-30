package org.t2k.cgs.domain.usecases.user;

import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.model.Customization;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 5:35 PM
 */
public class MockValidCGSSimpleUserDetails extends SimpleCgsUserDetails {

    public MockValidCGSSimpleUserDetails() {
        super();

        this.setEmail("work@timetoknow.com");
        this.setFirstName("Time");
        this.setLastName("Know");
        this.setPassword("password");
        this.setUsername("time.to.know");
        this.setCustomization(new Customization());
        this.getCustomization().setCgsHintsShowMode("showAll");

    }
}
