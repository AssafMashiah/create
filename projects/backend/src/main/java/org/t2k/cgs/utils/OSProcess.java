package org.t2k.cgs.utils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Moshe.Avdiel on 4/5/2016.
 */
public class OSProcess {

    private List<String> params = new ArrayList<>();
    private Process process;

    private StringBuilder sbOut = new StringBuilder();
    private StringBuilder sbErr = new StringBuilder();

    private int exitCode;

    private List<String> errorWhiteList = new ArrayList<>();

    public OSProcess() {
        // Empty
    }

    public void addParam(String param) {
        // if the operating system is windows the script is done by - python qtfaststart [infile] [outfile]
        // if the operating system is linux the script is done by - qtfaststart [infile] [outfile]
        if (param != null && !param.isEmpty()) {
            this.params.add(param);
        }
    }

    public void addErrorWhiteList(String errorWhiteListMessage) {
        this.errorWhiteList.add(errorWhiteListMessage);
    }

    public List<String> getErrorWhiteList() {
        return this.errorWhiteList;
    }

    public void start() {
        // run the qtfaststart in ProcessBuilder and update the class member 'exitCode' with the result
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(this.params);
            this.process = processBuilder.start();

            InputStreamReader stdOutReader = new InputStreamReader(this.process.getInputStream());
            InputStreamReader stdErrReader = new InputStreamReader(this.process.getErrorStream());

            BufferedReader outBufReader = new BufferedReader(stdOutReader);
            BufferedReader errBufReader = new BufferedReader(stdErrReader);

            String outLine;
            String errLine = null; //forced

            while ((outLine = outBufReader.readLine()) != null
                    ||
                    (errLine = errBufReader.readLine()) != null) {

                if (outLine != null) {
                    sbOut.append(outLine);
                }

                if (errLine != null) {
                    sbErr.append(errLine);
                }
            }

            this.exitCode = this.process.waitFor();
            // Process Finished Here.
        }
        catch(Exception e) {
            this.sbErr.append(e.toString());
            if (this.process.exitValue() != 0) {
                this.exitCode  =  this.process.exitValue();
            }
            else {
                this.exitCode = 999; // Unexpected Exception
            }
        }
        finally {
            if (this.process != null) {
                this.process.destroy();
                // destroyForcibly() may be added here if necessary..
            }
        }
    }

    public String getOutMessages() {
        return this.sbOut.toString();
    }

    public String getErrorMessages() {
        return this.sbErr.toString();
    }

    public String getAllMessages() {
        StringBuilder sb = new StringBuilder();
        sb.append(this.sbOut);
        sb.append(this.sbErr);

        return  sb.toString();
    }

    public int getExitCode() {
        return exitCode;
    }

}
