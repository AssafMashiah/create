package org.t2k.cgs.service.standards.validators;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/9/13
 * Time: 2:14 PM
 */
public class CorrectNumberOfColumnsValidator {

    private int correctNumberOfColumns;

    public CorrectNumberOfColumnsValidator(int correctNumberOfColumns) {
        this.correctNumberOfColumns = correctNumberOfColumns;
    }

    public List<String> validateFormat(String content) {
        List<String> errors = new LinkedList<>();

        String line;
        int lineNumberCounter = 0;
        BufferedReader bufferedReader = new BufferedReader(new StringReader(content));

        try {
            while ((line = bufferedReader.readLine()) != null) {
                lineNumberCounter += 1;
                // we add another non empty column, otherwise the split trims the empty columns at the end
                String[] parts = (line + "\t|").split("\t");
                int actualNumberOfColumns = parts.length - 1;
                if (actualNumberOfColumns != correctNumberOfColumns) {
                    errors.add(String.format("Invalid file content on line %d. Should contain %d columns of data - %d found!", lineNumberCounter, correctNumberOfColumns, actualNumberOfColumns));
                }
            }
        } catch (IOException e) {
            errors.add("Unable to read content, message: " + e.getMessage());
        }

        return errors;
    }
}