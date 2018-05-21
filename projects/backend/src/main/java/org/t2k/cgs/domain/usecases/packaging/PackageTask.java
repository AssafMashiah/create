package org.t2k.cgs.domain.usecases.packaging;

import java.util.concurrent.FutureTask;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 26/11/12
 * Time: 13:26
 */
public class PackageTask extends FutureTask<String> {

    private PackageHandler packageHandler;

    public PackageTask(PackageHandler packageHandler, String result) {
        super(packageHandler, result);
        this.packageHandler = packageHandler;
    }

    public PackageHandler getPackageHandler() {
        return packageHandler;
    }

    @Override
    public boolean cancel(boolean mayInterruptIfRunning) {
        this.packageHandler.cancelProcess();
        return super.cancel(mayInterruptIfRunning);
    }
}