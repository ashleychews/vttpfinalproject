package vttp.batch4.proj.backend.controllers;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import vttp.batch4.proj.backend.models.ChatGroup;
import vttp.batch4.proj.backend.models.ChatMessage;
import vttp.batch4.proj.backend.services.ChatService;
import vttp.batch4.proj.backend.services.ImageService;

@Controller
@CrossOrigin
public class ChatController {

    @Autowired
    private ChatService chatSvc;

    @Autowired
    private ImageService imgSvc;

    // chat groups
    @PostMapping("api/chat/group")
    @ResponseBody
    public ResponseEntity<ChatGroup> createChatGroup(@RequestBody ChatGroup chatgroup)
            throws IOException, InterruptedException {
        String id = UUID.randomUUID().toString().substring(0, 6); // Generate a unique ID
        chatgroup.setGroupId(id); // Set the generated ID to the ChatGroup
        String timestamp = chatgroup.getTimestamp();
        System.out.println("timestamp" + timestamp);
        // Generate a random seed
        String seed = String.valueOf(new Random().nextInt(100));

        // Generate a random image URL using an external API
        String imageUrl = "https://api.dicebear.com/8.x/icons/svg?seed=" + seed;
        System.out.println(imageUrl);

        String contentType = "image/svg+xml";

        // Save image URL to S3 and get the image ID
        String imageId = imgSvc.saveUrlToS3(imageUrl, contentType);

        chatgroup.setPictureId(imageId);
        chatgroup.setMediaType(contentType);
        chatSvc.saveGroups(chatgroup);
        System.out.println("Chat Group created. Group Name: " + chatgroup.getGroupName() + ", Group ID: "
                + chatgroup.getGroupId());
        return ResponseEntity.ok().body(chatgroup);
    }

    @PostMapping("api/group/join/{groupId}")
    public ResponseEntity<String> joinGroup(@PathVariable String groupId, @RequestBody String jsonString) {
        JsonReader reader = Json.createReader(new StringReader(jsonString));
        JsonObject jsonObject = reader.readObject();
        String email = jsonObject.getString("email");

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

    @GetMapping("api/group/{groupId}/message/count")
    public ResponseEntity<Long> getMessageCountInGroup(@PathVariable String groupId) {
        long messageCount = chatSvc.countMessagesInGroup(groupId);
        return ResponseEntity.ok().body(messageCount);
    }

    @GetMapping("/api/chat/group/{groupId}")
    @ResponseBody
    public ChatGroup getGroupbyGroupId(@PathVariable String groupId) {
        return chatSvc.getGroupbyGroupId(groupId);
    }

    // put mapping to edit group name & image
    @PutMapping(path = "/api/chat/group/{groupId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ChatGroup> updateChatGroup(
            @PathVariable String groupId,
            @RequestPart(required = false) String groupName,
            @RequestPart(required = false) MultipartFile image) throws IOException, InterruptedException {

        // Retrieve the existing chat group by ID
        ChatGroup chatGroup = chatSvc.getGroupbyGroupId(groupId);
        if (chatGroup == null) {
            return ResponseEntity.notFound().build();
        }

        // Update the group name if provided in the request
        if (groupName != null && !groupName.isEmpty()) {
            chatGroup.setGroupName(groupName);
        }

        // Update the group picture if provided in the request
        if (image != null && !image.isEmpty()) {
            // Save the new picture to S3 and get the image ID
            String imageId = imgSvc.saveToS3(image);
            chatGroup.setPictureId(imageId);
            chatGroup.setMediaType(image.getContentType());
        }

        try {
            // Update the chat group
            chatSvc.updateGroup(groupId, groupName, chatGroup.getPictureId());
            return ResponseEntity.ok().body(chatGroup);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Leave a group
    @DeleteMapping("api/chat/group/{groupId}")
    public ResponseEntity<String> leaveGroup(@PathVariable String groupId, @RequestBody String jsonString) {

        JsonReader reader = Json.createReader(new StringReader(jsonString));
        JsonObject jsonObject = reader.readObject();
        String email = jsonObject.getString("email");
        try {
            chatSvc.leaveGroup(groupId, email);
            JsonObject success = Json.createObjectBuilder()
                    .add("email", email)
                    .add("success", "User successfully left the group")
                    .build();
            return ResponseEntity.ok().body(success.toString());
        } catch (Exception e) {
            JsonObject error = Json.createObjectBuilder()
                    .add("email", email)
                    .add("error", "Failed to leave the group")
                    .build();
            return ResponseEntity.badRequest().body(error.toString());
        }
    }

    // get groups by user
    @PostMapping("/api/groups/joined")
    public ResponseEntity<List<ChatGroup>> getGroupsJoinedByCurrentUser(@RequestBody Map<String, String> requestBody) {
        String userEmail = requestBody.get("email");
        System.out.println("userEmail" + userEmail);
        if (userEmail != null && !userEmail.isEmpty()) {
            List<ChatGroup> groupsJoined = chatSvc.getGroupsJoinedByUser(userEmail);
            System.out.println("groups joined" + groupsJoined);
            return ResponseEntity.ok().body(groupsJoined);
        } else {
            List<ChatGroup> emptyList = new ArrayList<>();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(emptyList);
        }
    }

    //get all groups
    @GetMapping("api/allgroups")
    public ResponseEntity<List<ChatGroup>> getAllGroups() {
        List<ChatGroup> groups = chatSvc.getAllGroups();
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

        // Parse the JSON string from content field
        JsonReader reader = Json.createReader(new StringReader(message.getContent()));
        JsonObject contentObject = reader.readObject();
        String sender = contentObject.getString("sender");
        String senderEmail = contentObject.getString("senderEmail");
        String senderImgId = contentObject.getString("senderImgId");
        String timestamp = contentObject.getString("timestamp");

        // Set the sender value in the ChatMessage object
        message.setSender(sender);
        message.setSenderEmail(senderEmail);
        message.setSenderImgId(senderImgId);
        message.setTimestamp(timestamp);

        String content = contentObject.getString("content");
        message.setContent(content);

        // save to mongo
        chatSvc.saveMessages(message);
        return new ChatMessage(eventId, message.getSender(), message.getSenderEmail(), message.getSenderImgId(), message.getContent(),
                message.getTimestamp());
    }

    @GetMapping("api/chat/{groupId}/messages")
    @ResponseBody
    public List<ChatMessage> getMessagesByGroupId(@PathVariable String groupId) {
        return chatSvc.getMessagesByGroupId(groupId);
    }

    @PutMapping("api/updatesenderImgId")
    @ResponseBody
    public void updateSenderImgId(@RequestBody String jsonString) {
        JsonReader reader = Json.createReader(new StringReader(jsonString));
        JsonObject jsonObject = reader.readObject();
        String email = jsonObject.getString("email");
        String imageId = jsonObject.getString("imageId");

        chatSvc.updateSenderImgId(email, imageId);
    }

}
