package org.t2k.cgs.model.utils;

//import org.eel.kitchen.jsonschema.main.ValidationReport;

import org.eel.kitchen.jsonschema.report.ValidationReport;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 12/12/12
 * Time: 10:42
 */
public class CGSValidationReport {
    @Override
    public String toString() {
        return "CGSValidationReport{" +
                "description='" + description + '\'' +
                ", duration=" + duration +
                ", messages=" + Arrays.toString(messages.toArray()) +
                ", isSuccess=" + isSuccess +
                '}';
    }

    private String description="";
    private long duration;
    private List<String> messages=new ArrayList<String>();
    private boolean isSuccess=true;


    public CGSValidationReport(ValidationReport validationReport) {
        List<String> vMessages = validationReport.getMessages();
        if(vMessages!=null){
            this.messages=new ArrayList<String>(vMessages);
        }
        isSuccess=validationReport.isSuccess();
    }

    public CGSValidationReport(boolean isSuccess,List<String> messages) {
        this.isSuccess=isSuccess;
        this.messages=messages;
    }

    public CGSValidationReport() {
    }

    public void setSuccess(boolean success) {
        this.isSuccess=success;
    }

    public boolean isSuccess(){
        return this.isSuccess;
    }

    public List<String> getMessages(){
        return messages;
    }

    public void addMessage(String message){
        this.messages.add(message);
    }

    public void addMessages(List<String> messages){
        this.messages.addAll(messages);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }
}
