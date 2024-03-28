package vttp.batch4.proj.backend.models;

import java.time.LocalDateTime;

import org.bson.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

//collection is chat

public class ChatMessage {
    
    private String groupId;
    private String sender; // Reference to the user who sent the message
    private String content;
    private LocalDateTime timestamp;

    public Document toDocument() {
		Document doc = new Document();
		doc.put("groupId", groupId);
		doc.put("sender", sender);
        doc.put("content", content);
        doc.put("timestamp", timestamp);
		return doc;
	}


}
