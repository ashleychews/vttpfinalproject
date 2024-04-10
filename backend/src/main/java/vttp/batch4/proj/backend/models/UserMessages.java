package vttp.batch4.proj.backend.models;

import java.time.LocalDateTime;

import org.bson.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

//collection is user_messages

public class UserMessages {

    private String chatRoomID;
    private String content;
    private String senderEmail;
    private String recipientEmail;
    private LocalDateTime timestamp;

    public Document toDocument() {
		Document doc = new Document();
        doc.put("chatRoomID", chatRoomID);
		doc.put("content", content);
        doc.put("senderEmail", senderEmail);
        doc.put("recipientEmail", recipientEmail);
        doc.put("timestamp", timestamp);
		return doc;
	}
}
