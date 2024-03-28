package vttp.batch4.proj.backend.repositories;

import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import vttp.batch4.proj.backend.models.ChatGroup;

@Repository
public class ChatGroupRepository {

    @Autowired
	private MongoTemplate template;

    //collection name: chatgroup

    //save chat group
    public String saveGroup(ChatGroup chatgroup) {
        Document doc = template.insert(chatgroup.toDocument(), "chatgroup");
		return doc.getObjectId("_id").toHexString();
    }

    //retrieve list of chats groups based on eventid
    public List<ChatGroup> getgroupsByEventId(String eventId) {
        Query query = new Query(Criteria.where("eventId").is(eventId));
        return template.find(query, ChatGroup.class, "chatgroup");
    }

    //allow users to join group
    public void addUserstoGroup(String groupId, String email) {
        Query query = new Query(Criteria.where("groupId").is(groupId).and("users").ne(email));
        Update update = new Update()
        .push("users", email)
        .inc("userCount", 1);
        template.updateMulti(query, update, ChatGroup.class, "chatgroup");
    }
    
}
