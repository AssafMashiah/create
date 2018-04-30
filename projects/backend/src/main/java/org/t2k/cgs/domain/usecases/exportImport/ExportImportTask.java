package org.t2k.cgs.domain.usecases.exportImport;

import java.util.concurrent.FutureTask;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 02/10/13
 * Time: 07:07
 */
public class ExportImportTask extends FutureTask<String> {

    private ExportImportHandler exImHandler;

    public ExportImportTask(ExportImportHandler exImHandler, String result) {
        super(exImHandler, result);
        this.exImHandler = exImHandler;

    }

    public ExportImportHandler getExImHandler() {
        return exImHandler;
    }

}

