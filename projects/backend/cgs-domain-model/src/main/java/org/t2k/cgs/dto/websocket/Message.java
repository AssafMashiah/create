package org.t2k.cgs.dto.websocket;

/**
 * @author Alex Burdusel on 2016-06-23.
 */
public class Message {

    private MessageCode code;
    private Object body;

    public static Message newInstance(MessageCode code, Object body) {
        if (code == null) {
            throw new IllegalArgumentException("message code cannot be null");
        }
        Message message = new Message();
        message.code = code;
        message.body = body;
        return message;
    }

    public MessageCode getCode() {
        return code;
    }

    public Object getBody() {
        return body;
    }
}
