package vttp.batch4.proj.backend.repositories;

import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import vttp.batch4.proj.backend.models.ChatGroup;

@Repository
public class ChatGroupRepository {

    @Autowired
    private MongoTemplate template;

    // collection name: chatgroup

    // save chat group
    public String saveGroup(ChatGroup chatgroup) {
        Document doc = template.insert(chatgroup.toDocument(), "chatgroup");
        return doc.getObjectId("_id").toHexString();
    }

    // retrieve list of chats groups based on eventid
    public List<ChatGroup> getgroupsByEventId(String eventId) {
        Query query = new Query(Criteria.where("eventId").is(eventId));
        return template.find(query, ChatGroup.class, "chatgroup");
    }

    // retrieve chat group based on groupid
    public ChatGroup getGroupbyGroupId(String groupId) {
        Query query = new Query(Criteria.where("groupId").is(groupId));
        return template.findOne(query, ChatGroup.class, "chatgroup");
    }

    // allow users to join group
    public void addUserstoGroup(String groupId, String email) {
        Query query = new Query(Criteria.where("groupId").is(groupId).and("users").ne(email));
        Update update = new Update()
                .push("users", email)
                .inc("userCount", 1);
        template.updateMulti(query, update, ChatGroup.class, "chatgroup");
    }

    // Leave a group
    public void leaveGroup(String groupId, String email) {
        Query query = new Query(Criteria.where("groupId").is(groupId).and("users").is(email));
        Update update = new Update()
                .pull("users", email)
                .inc("userCount", -1);
        template.updateFirst(query, update, ChatGroup.class, "chatgroup");
    }

    // find all groups
    public List<ChatGroup> findAllGroups() {
        return template.findAll(ChatGroup.class, "chatgroup");
    }

    // count total messages
    public long countMessagesInGroup(String groupId) {
        // Match messages with the specified groupId
        Criteria matchCriteria = Criteria.where("groupId").is(groupId);
        AggregationOperation matchStage = Aggregation.match(matchCriteria);

        // Count the matched messages
        AggregationOperation countStage = Aggregation.count().as("messageCount");

        Aggregation pipeline = Aggregation.newAggregation(matchStage, countStage);

        AggregationResults<Document> results = template.aggregate(pipeline, "chat", Document.class);

        // Extract the count of messages from the aggregation results
        if (results != null && !results.getMappedResults().isEmpty()) {
            Document aggregationResult = results.getMappedResults().get(0);
            return aggregationResult.get("messageCount", Number.class).longValue();
        }

        return 0;
    }

    // Retrieve groups joined by user
    public List<ChatGroup> getGroupsJoinedByUser(String email) {
        Query query = new Query(Criteria.where("users").in(email));
        return template.find(query, ChatGroup.class, "chatgroup");
    }

    // Update the group by its ID
    public void updateGroup(String groupId, String groupName, String pictureId) {
        Query query = new Query(Criteria.where("groupId").is(groupId));
        Update update = new Update();
        // Update group name if not null
        if (groupName != null) {
            update.set("groupName", groupName);
        }
        // Update picture ID if not null
        if (pictureId != null) {
            update.set("pictureId", pictureId);
        }
        template.updateFirst(query, update, ChatGroup.class, "chatgroup");
    }

}
