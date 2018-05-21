package org.t2k.cgs.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.NarrationService;
import org.t2k.cgs.domain.model.utils.IvonaBean;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;


@ContextConfiguration("/springContext/applicationContext-service.xml")
@Test(groups = "ignore")
public class NarrationServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private NarrationService narrationService;

    public void ivonaTest() throws DsException {

        IvonaBean bn = new IvonaBean();

        bn.setEmail("david.eshed@timetoknow.com");

        bn.setCodecId("mp3/22050");

        bn.setApiKey("w7JFVhtS0y2s9n2UoVI7EX9b55Zci1wF");
        bn.setVoiceId("fr_celine");
        bn.setContentType("text/plain");
        bn.setText("Test");
        List<IvonaBean.Param> params = new ArrayList<>();

        IvonaBean.Param p1 = new IvonaBean.Param();
        p1.setKey("Prosody-Volume");
        p1.setValue("50");

        IvonaBean.Param p2 = new IvonaBean.Param();
        p2.setKey("Prosody-Rate");
        p2.setValue("50");

        params.add(p1);
        params.add(p2);

        bn.setParams(params);

        byte[] out = narrationService.ivona(bn);
        System.out.println(out);

    }

}
