package com.t2k.cgs.utils.standards.interaction;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 7:09 PM
 */
public interface UserInteraction {

    void outputMessage(String msg);

    boolean askYesOrNoQuestion(String msg);

}
