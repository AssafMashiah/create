package org.t2k.cgs.web.websocket;

import org.springframework.messaging.Message;

/**
 * @author Alex Burdusel on 2016-12-14.
 */
public interface WebsocketClient {

    void onMessageReceived(String topic, Message message);
}
