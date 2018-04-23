package org.t2k.cgs.websocket;

import org.springframework.messaging.Message;

/**
 * Service for registering for receving messages sent on websocket topics
 *
 * @author Alex Burdusel on 2016-12-14.
 */
public interface WebsocketClientService {

    /**
     * Subscribes a client to receive messages on a specific topic
     *
     * @param topic
     * @param client
     */
    void registerClient(String topic, WebsocketClient client);

    /**
     * Unsubscribes client for receiving messages from the given topic
     *
     * @param topic
     * @param client
     */
    void removeClient(String topic, WebsocketClient client);

    /**
     * Method invoked to notify the clients when a message is received on a topic
     *
     * @param topic   topic where the message was sent
     * @param message
     */
    void onMessageReceived(String topic, Message message);

    /**
     * Method for removing clients from topics that were not active for a specific time
     * <p>
     * This method should be scheduled to be run from time to time, so clients that don't unsubscribe don't cause a
     * memory leak
     */
    void cleanUpNotActive();
}
