package org.t2k.cgs.domain.model.utils;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 15/01/14
 * Time: 15:17
 */
public class MailBean {



    public MailBean() {
        hostName = "smtp.googlemail.com";
        port = 465;
        user = "t2kcgs";
        password = "1Qaz@wsx";
        sSLOnConnect = true;
        bccAddress=new String[0];
    }

    private String hostName;

    private int port;

    private String user;

    private String password;

    private boolean sSLOnConnect;

    private String title;

    private String body;

    private String[] toAddress;

    private String[] bccAddress;

    public String getTitle() {

        return title;
    }

    public void setTitle(String title) {

        this.title = title;
    }

    public String getBody() {

        return body;
    }

    public void setBody(String body) {

        this.body = body;
    }

    public String[] getToAddress() {

        return toAddress;
    }

    public void setToAddress(String[] toAddress) {

        this.toAddress = toAddress;
    }

    public String getHostName() {

        return hostName;
    }

    public void setHostName(String hostName) {

        this.hostName = hostName;
    }

    public int getPort() {

        return port;
    }

    public void setPort(int port) {

        this.port = port;
    }

    public String getUser() {

        return user;
    }

    public void setUser(String user) {

        this.user = user;
    }

    public String getPassword() {

        return password;
    }

    public void setPassword(String password) {

        this.password = password;
    }

    public boolean isSSLOnConnect() {

        return sSLOnConnect;
    }

    public void setSSLOnConnect(boolean SSLOnConnect) {

        this.sSLOnConnect = SSLOnConnect;
    }


    public String[] getBccAddress() {

        return bccAddress;
    }

    public void setBccAddress(String[] bccAddress) {

        this.bccAddress = bccAddress;
    }
}
