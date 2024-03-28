package vttp.batch4.proj.backend.models;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

//collection is chatgroup

public class ChatGroup {

    private String eventId;
    private String groupId;
    private String groupName;
    private String creator;
    private List<String> users; //list of users in group
    private int messageCount; // number of messages in the group
    private int userCount;
    private LocalDateTime timestamp;
    
    public Document toDocument() {
		Document doc = new Document();
        doc.put("eventId", eventId);
		doc.put("groupId", groupId);
		doc.put("groupName", groupName);
        doc.put("creator", creator);
        doc.put("users", users);
        doc.put("messageCount", messageCount);
        doc.put("userCount", userCount);
        doc.put("timestamp", timestamp);
		return doc;
	}

}
