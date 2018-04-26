package org.t2k.cgs.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.t2k.cgs.constants.WebsocketTopics;
import org.t2k.cgs.dto.websocket.Message;
import org.t2k.cgs.dto.websocket.MessageCode;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobService;

import javax.inject.Inject;
import java.security.Principal;

@Controller
public class WebsocketController {

    private static final Logger log = LoggerFactory.getLogger(WebsocketController.class);

    @Inject
    private SimpMessagingTemplate simpMessagingTemplate;

    @Inject
    private JobService jobService;

    @Inject
    private WebsocketClientService websocketClientService;

//    @MessageMapping("/websocket")
//    @SendTo("/topic/greetings")
//    public Object uploadAndConvert(@Payload String payload, @DestinationVariable String jobId) throws Exception {
//        return payload;
//    }

    /**
     * Websocket destination mapping for changing a job's status from PENDING
     * UI should send as stompClient.send("/app/uploadAndConvert/{jobId}/continue")
     * the prefix /app is needed in order to be mapped to the controller
     *
     * @param jobId
     * @param principal
     */
    @MessageMapping("/uploadAndConvert/{jobId}/continue")
    public void continueJob(@DestinationVariable String jobId, Principal principal) {
        Job job = jobService.getJob(jobId);
        if (job == null) {
            simpMessagingTemplate.convertAndSend(WebsocketTopics.UPLOAD_AND_CONVERT + jobId, Message.newInstance(MessageCode.ERROR, "Job does not exist"));
            return;
        } else if (!job.getProperties().getUsername().equals(principal.getName())) {
            simpMessagingTemplate.convertAndSend(WebsocketTopics.UPLOAD_AND_CONVERT + jobId, Message.newInstance(MessageCode.ERROR, "Not Authorized"));
            return;
        }
        if (job.getStatus().equals(Job.Status.PENDING)) {
            job = jobService.updateJobStatus(jobId, Job.Status.IN_PROGRESS);
        }
        simpMessagingTemplate.convertAndSend(WebsocketTopics.UPLOAD_AND_CONVERT + jobId, Message.newInstance(MessageCode.PROGRESS, job));
    }

    /**
     * Method for receiving messages from client and notifying server side clients
     */
    @MessageMapping("/job/{jobId}")
    public void postToJobTopic(@DestinationVariable String jobId,
                               Principal principal,
                               org.springframework.messaging.Message message) {
        websocketClientService.onMessageReceived(jobId, message);
    }
}