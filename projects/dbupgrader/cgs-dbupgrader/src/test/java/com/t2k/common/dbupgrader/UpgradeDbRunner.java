package com.t2k.common.dbupgrader;

import com.t2k.common.dbupgrader.flow.FlowManager;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 15/06/14
 * Time: 11:52
 */

@Test(groups = "ignore")
public class UpgradeDbRunner {

    // Run all tasks of upgrade db
    @Test
    public void runAllUpgradeDbTasks() throws Exception {
        FlowManager flowManager = new FlowManager();
        flowManager.execute(false, false, false) ;
     }

    }
