package com.t2k.cgs.utils.standards.interaction;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/28/12
 * Time: 11:33 AM
 */
public class StdUserInteraction implements UserInteraction {

    @Override
    public void outputMessage(String msg) {
        System.out.println(msg);
    }

    @Override
    public boolean askYesOrNoQuestion(String msg) {
        System.out.println("");
        System.out.println("* Question:");
        System.out.println(msg);

        Boolean answerGiven = null;

        while (answerGiven == null) {

            System.out.println("[y/n]");

            String input;
            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
                input = reader.readLine();
            } catch (IOException e) {
                throw new RuntimeException("Failed reading user response", e);
            }

            if (input != null && (input.matches("[Yy][eE][sS]") || input.matches("[Yy]"))){
                answerGiven = true;
            }
            if (input != null && (input.matches("[Nn][oO]") || input.matches("[Nn]"))){
                answerGiven = false;
            }
        }

        return answerGiven;
    }
}
