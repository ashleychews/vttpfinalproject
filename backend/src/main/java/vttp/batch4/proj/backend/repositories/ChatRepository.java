package vttp.batch4.proj.backend.repositories;

import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import vttp.batch4.proj.backend.models.ChatMessage;

@Repository
public class ChatRepository {

    @Autowired
	private MongoTemplate template;

    //collection name: chat
    
    //save messages
    public String saveMessages(ChatMessage chat) {
		Document doc = template.insert(chat.toDocument(), "chat");
		return doc.getObjectId("_id").toHexString();
	}

    //retrieve messages to display based on eventid
    public List<ChatMessage> getMessagesByGroupId(String groupId) {
        Query query = new Query(Criteria.where("groupId").is(groupId));
        return template.find(query, ChatMessage.class, "chat");
    }
    
}
