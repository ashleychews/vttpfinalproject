package vttp.batch4.proj.backend.controllers;

import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import vttp.batch4.proj.backend.models.ChatGroup;
import vttp.batch4.proj.backend.models.ChatMessage;
import vttp.batch4.proj.backend.services.ChatService;

@Controller
@CrossOrigin
public class ChatController {

    @Autowired
    private ChatService chatSvc;

    // chat groups
    @PostMapping("api/chat/group")
    @ResponseBody
    public ResponseEntity<ChatGroup> createChatGroup(@RequestBody ChatGroup chatgroup) {
        String id = UUID.randomUUID().toString().substring(0, 6); // Generate a unique ID
        chatgroup.setGroupId(id); // Set the generated ID to the ChatGroup
        chatgroup.setTimestamp(LocalDateTime.now());
        chatSvc.saveGroups(chatgroup);
        System.out.println("Chat Group created. Group Name: " + chatgroup.getGroupName() + ", Group ID: "
                + chatgroup.getGroupId());
        return ResponseEntity.ok().body(chatgroup);
    }

    @PostMapping("api/group/join/{groupId}")
    public ResponseEntity<String> joinGroup(@PathVariable String groupId, @RequestBody String email) {
        chatSvc.addUsersToGroup(groupId, email);
        JsonObject success = Json.createObjectBuilder()
                .add("email", email)
                .add("success", "user successfully joined group")
                .build();
        return ResponseEntity.ok().body(success.toString());
    }

    @GetMapping("api/group/{eventId}")
    public ResponseEntity<List<ChatGroup>> getGroupsByEventId(@PathVariable String eventId) {
        List<ChatGroup> groups = chatSvc.getGroupsByEventId(eventId);
        System.out.println(groups);
        return ResponseEntity.ok().body(groups);
    }

    // chatmessages

    @MessageMapping("/chat/{eventId}/{groupId}")
    @SendTo("/topic/chat/{eventId}/{groupId}")
    public ChatMessage send(@DestinationVariable String eventId, @DestinationVariable String groupId,
            @Payload ChatMessage message) {
        System.out.println(message);
        message.setGroupId(groupId);
        ;

        // Parse the JSON string from content field
        JsonReader reader = Json.createReader(new StringReader(message.getContent()));
        JsonObject contentObject = reader.readObject();
        String sender = contentObject.getString("sender");

        // Set the sender value in the ChatMessage object
        message.setSender(sender);
        message.setTimestamp(LocalDateTime.now());

        String content = contentObject.getString("content");
        message.setContent(content);

        chatSvc.saveMessages(message);
        return new ChatMessage(eventId, message.getSender(), message.getContent(), message.getTimestamp());
    }

    @GetMapping("api/chat/{groupId}/messages")
    @ResponseBody
    public List<ChatMessage> getMessagesByGroupId(@PathVariable String groupId) {
        return chatSvc.getMessagesByGroupId(groupId);
    }
}
