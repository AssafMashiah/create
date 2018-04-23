package org.t2k.cgs.model.ebooks;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Asaf.Shochet on 10/29/2015.
 */
public class EpubValidationResult {

    private boolean isValid;
    private List<String> errorMessages;

    public EpubValidationResult(boolean isValid) {
        this.isValid = isValid;
    }

    public EpubValidationResult(List<String> errors) {
        this.errorMessages = errors;
        this.isValid = false;
    }

    public EpubValidationResult(String error) {
        this.isValid = false;
        this.errorMessages = new ArrayList<>();
        this.errorMessages.add(error);
    }

    public String getStringFromErrorsList() {
        StringBuilder sb = new StringBuilder();
        for (String error : this.errorMessages) {
            sb.append(error);
            sb.append("\n");
        }

        return sb.toString();
    }

    public boolean isValid() {
        return isValid;
    }

    public List<String> getErrorMessages() {
        return errorMessages;
    }
}