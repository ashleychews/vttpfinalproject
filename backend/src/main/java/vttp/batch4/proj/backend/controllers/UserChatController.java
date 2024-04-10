package vttp.batch4.proj.backend.controllers;

import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import vttp.batch4.proj.backend.exceptions.UserException;
import vttp.batch4.proj.backend.models.UserMessages;
import vttp.batch4.proj.backend.services.UserMessagesService;

@Controller
@CrossOrigin
public class UserChatController {

    @Autowired
    private UserMessagesService userMsgSvc;

    @MessageMapping("/single-chat/{id}")
    @SendTo("/topic/single-chat/{id}")
    public UserMessages send(@DestinationVariable String id,
            @Payload UserMessages message) throws UserException {
        System.out.println(message);

        // Parse the JSON string from content field
        JsonReader reader = Json.createReader(new StringReader(message.getContent()));
        JsonObject contentObject = reader.readObject();
        String senderEmail = contentObject.getString("senderEmail");
        String recipientEmail = contentObject.getString("recipientEmail");
        String content = contentObject.getString("content");
        message.setChatRoomID(id);
        message.setTimestamp(LocalDateTime.now());
        message.setContent(content);
        message.setSenderEmail(senderEmail);
        message.setRecipientEmail(recipientEmail);

        // save to mongo
        userMsgSvc.saveUserMessage(message);
        return new UserMessages(message.getChatRoomID(), message.getContent(), message.getSenderEmail(),
                message.getRecipientEmail(),
                message.getTimestamp());
    }

    @PostMapping("api/chat/check")
    @ResponseBody
    public ResponseEntity<String> checkChatRoom(@RequestBody String jsonString) {
        JsonReader reader = Json.createReader(new StringReader(jsonString));
        JsonObject jsonObject = reader.readObject();
        String senderEmail = jsonObject.getString("senderEmail");
        String recipientEmail = jsonObject.getString("recipientEmail");
        // Check if chat room exists and get the chat room ID
        String chatRoomId = userMsgSvc.getChatRoomIdIfExists(senderEmail, recipientEmail);

        String responseChatRoomId = (chatRoomId != null) ? chatRoomId : "0";

        JsonObject responseJson = Json.createObjectBuilder()
                .add("chatRoomId", responseChatRoomId)
                .build();
        return ResponseEntity.ok(responseJson.toString());
    }

    @GetMapping("api/chat/{chatroomId}")
    @ResponseBody
    public List<UserMessages> getMessagesByChatRoomId(@PathVariable String chatroomId) {
        return userMsgSvc.getAllMessagesByChatRoomId(chatroomId);
    }

    // Get unique chat room IDs for a user
    @PostMapping("/api/chat/user/roomids")
    @ResponseBody
    public ResponseEntity<List<String>> getChatRoomIDsForUser(@RequestBody String jsonString) {

        JsonReader reader = Json.createReader(new StringReader(jsonString));
        JsonObject jsonObject = reader.readObject();
        String senderEmail = jsonObject.getString("senderEmail");
        List<String> chatRoomIDs = userMsgSvc.getChatRoomIDsForUser(senderEmail);
        System.out.println("chatroomid" + chatRoomIDs);
        return ResponseEntity.ok().body(chatRoomIDs);
    }

    @GetMapping(path="api/chat/recipientemail/{chatRoomId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getRecipientEmail(@PathVariable String chatRoomId) {
        String recipientEmail = userMsgSvc.getRecipientEmail(chatRoomId);
        if (recipientEmail != null) {
            JsonObjectBuilder builder = Json.createObjectBuilder();
            builder.add("recipientEmail", recipientEmail);
            JsonObject jsonObject = builder.build();
            return ResponseEntity.ok().body(jsonObject.toString());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
