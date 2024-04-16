package vttp.batch4.proj.backend.repositories;

import java.util.List;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import vttp.batch4.proj.backend.models.UserMessages;

@Repository
public class UserChatRepository {

    @Autowired
    private MongoTemplate template;

    // collection name: user_messages

    // Save user chat message
    public String saveUserMessage(UserMessages message) {
        Document doc = template.insert(message.toDocument(), "user_messages");
        return doc.getObjectId("_id").toHexString();
    }

    // Get chat room ID based on sender and recipient emails if it exists
    public String getChatRoomId(String email1, String email2) {
        System.out.println("Searching for chat room with emails: " + email1 + " and " + email2);

        Query query = new Query(
                new Criteria().orOperator(
                        Criteria.where("senderEmail").is(email1).and("recipientEmail").is(email2),
                        Criteria.where("senderEmail").is(email2).and("recipientEmail").is(email1)));

        System.out.println("Executing query: " + query.toString());

        UserMessages chatRoom = template.findOne(query, UserMessages.class, "user_messages");
        System.out.println(chatRoom);

        if (chatRoom != null) {
            System.out.println("Found chat room: " + chatRoom.getChatRoomID());
            return chatRoom.getChatRoomID();
        } else {
            System.out.println("Chat room not found.");
            return null;
        }
    }

    // Retrieve all messages by chat room ID
    public List<UserMessages> getAllMessagesByChatRoomId(String chatRoomId) {
        Query query = new Query(Criteria.where("chatRoomID").is(chatRoomId));
        return template.find(query, UserMessages.class, "user_messages");
    }

    // Get unique chat room IDs for a user
    public List<String> getChatRoomIDsForUser(String userEmail) {
        Query query = new Query(
                new Criteria().orOperator(
                        Criteria.where("senderEmail").is(userEmail),
                        Criteria.where("recipientEmail").is(userEmail)));

        List<UserMessages> messages = template.find(query, UserMessages.class, "user_messages");
        return messages.stream().map(UserMessages::getChatRoomID).distinct().collect(Collectors.toList());
    }

    public String getRecipientEmail(String chatRoomId, String userEmail) {
        Criteria criteria = new Criteria().andOperator(
                Criteria.where("chatRoomID").is(chatRoomId),
                new Criteria().orOperator(
                        Criteria.where("senderEmail").is(userEmail),
                        Criteria.where("recipientEmail").is(userEmail)));

        Query query = new Query(criteria);
        UserMessages message = template.findOne(query, UserMessages.class, "user_messages");

        if (message != null) {
            if (userEmail.equals(message.getSenderEmail())) {
                return message.getRecipientEmail();
            } else {
                return message.getSenderEmail();
            }
        } else {
            return null;
        }
    }

    // Retrieve the last message from a chat room based on chat room ID
    public UserMessages getLastMessageByChatRoomId(String chatRoomId) {
        Query query = new Query(Criteria.where("chatRoomID").is(chatRoomId));
        query.with(Sort.by(Sort.Direction.DESC, "timestamp")); // Sort by timestamp in descending order
        query.limit(1); // Limit the result to one document

        return template.findOne(query, UserMessages.class, "user_messages");
    }

}
