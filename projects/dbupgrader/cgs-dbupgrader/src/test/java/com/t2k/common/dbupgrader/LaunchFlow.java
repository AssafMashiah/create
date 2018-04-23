package com.t2k.common.dbupgrader;

import com.t2k.common.dbupgrader.flow.FlowManager;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/24/12
 * Time: 5:26 PM
 */
public class LaunchFlow {

    public static void main(String[] args) throws Exception {
        FlowManager flowManager = new FlowManager();
        flowManager.execute(false, false, false) ;
    }
}
