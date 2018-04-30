package org.t2k.cgs.service;

/**
 * This class represents an object that notifies observers through websocket of changes or important operations
 * taking place inside it.
 * <p>
 * Regular objects or services implementing this interface have the responsibility to notify the observers through
 * websocket. It's the implementors responsibility to make sure that all or the major operations executed inside
 * the service or object are sent to the observers.
 *
 * @author Alex Burdusel on 2016-11-23.
 */
public interface WebsocketObservable {

    /**
     * Notifies the observers listening to the given topic of the changes/operation specified in the given payload
     *
     * @param topic   the destination topic where the observers are listening
     * @param payload the Object to use as payload
     */
    void notifyObservers(String topic, Object payload);
}
