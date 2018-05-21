package org.t2k.cgs.web.websocket;

import org.springframework.messaging.Message;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * @author Alex Burdusel on 2016-12-14.
 */
@Service
public class WebsocketClientServiceImpl implements WebsocketClientService {

    private Map<String, TopicClients> topicClientsMap = new HashMap<>();

    @Override
    public void registerClient(String topic, WebsocketClient client) {
        TopicClients topicClients = topicClientsMap.computeIfAbsent(topic, k -> new TopicClients());
        topicClients.clients.add(client);
    }

    @Override
    public void removeClient(String topic, WebsocketClient client) {
        TopicClients topicClients = topicClientsMap.get(topic);
        if (topicClients != null) {
            topicClients.clients.remove(client);
        }
    }

    @Override
    public void onMessageReceived(String topic, Message message) {
        TopicClients topicClients = topicClientsMap.get(topic);
        if (topicClients != null) {
            topicClients.clients.
                    forEach(client -> client.onMessageReceived(topic, message));
            topicClients.lastMessage = LocalDateTime.now();
        }
    }

    @Scheduled(cron = "0 0/5 * * * *") // run once every 5 minutes
    @Override
    public void cleanUpNotActive() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        topicClientsMap
                .entrySet()
                .removeIf(entry -> {
                    TopicClients topicClients = entry.getValue();
                    return topicClients.creationDate.isBefore(threshold)
                            && (topicClients.lastMessage == null || topicClients.lastMessage.isBefore(threshold));
                });
    }

    private static class TopicClients {
        private LocalDateTime creationDate = LocalDateTime.now();
        private LocalDateTime lastMessage;
        private Set<WebsocketClient> clients = new HashSet<>();
    }
}
