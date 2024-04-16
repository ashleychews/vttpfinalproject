package vttp.batch4.proj.backend.models;
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
    private List<String> users; //list of users in group - by email
    private int userCount;
    private String timestamp;
    private String pictureId;
    private String mediaType;
    
    public Document toDocument() {
		Document doc = new Document();
        doc.put("eventId", eventId);
		doc.put("groupId", groupId);
		doc.put("groupName", groupName);
        doc.put("creator", creator);
        doc.put("users", users);
        doc.put("userCount", userCount);
        doc.put("timestamp", timestamp);
        doc.put("pictureId", pictureId);
        doc.put("mediaType", mediaType);
		return doc;
	}

}
