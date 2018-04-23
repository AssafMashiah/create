package com.t2k.cgs.utils.standards.validators;

import org.springframework.beans.factory.annotation.Required;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/9/13
 * Time: 2:14 PM
 */
public class CorrectNumberOfColumnsValidator implements InputFileContentValidator {

    private List<String> errors;
    private int correctNumberOfColumns;


    @Override
    public void initialize() {
        this.errors = new LinkedList<String>();
    }

    @Override
    public void validateFormat(String content) {

        BufferedReader bufferedReader = new BufferedReader(new StringReader(content));

        String line;
        int lineNumberCounter = 0;

        try {
            while ((line = bufferedReader.readLine()) != null) {
                lineNumberCounter += 1;
                //we add another non empty column, otherwise the split trims the empty columns at the end
                String[] parts = (line + "\t|").split("\t");
                int actualNumberOfColumns = parts.length - 1;
                if (actualNumberOfColumns != correctNumberOfColumns) {
                    this.errors.add("Invalid file content on line " + lineNumberCounter + " should contain " + correctNumberOfColumns + " columns of data, " + actualNumberOfColumns + " found!");
                    return;
                }
            }

        } catch (IOException e) {
            this.errors.add("Unable to read content, message:" + e.getMessage());
        }
    }

    @Override
    public boolean hadErrors() {
        return this.errors.size() > 0;
    }

    @Override
    public Collection<String> getErrorMessages() {
        return this.errors;
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////


    @Required
    public void setCorrectNumberOfColumns(int correctNumberOfColumns) {
        this.correctNumberOfColumns = correctNumberOfColumns;
    }
}
