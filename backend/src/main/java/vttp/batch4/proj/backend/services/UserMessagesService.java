package vttp.batch4.proj.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import vttp.batch4.proj.backend.models.UserMessages;
import vttp.batch4.proj.backend.repositories.UserChatRepository;

@Service
public class UserMessagesService {

    @Autowired
    private UserChatRepository userchatRepo;

    public String saveUserMessage(UserMessages message) {
        return userchatRepo.saveUserMessage(message);
    }

    // Check if a chat room exists based on sender and recipient emails
    public String getChatRoomIdIfExists(String senderEmail, String recipientEmail) {
        return userchatRepo.getChatRoomId(senderEmail, recipientEmail);
    }

    // Retrieve all messages by chat room ID
    public List<UserMessages> getAllMessagesByChatRoomId(String chatRoomId) {
        return userchatRepo.getAllMessagesByChatRoomId(chatRoomId);
    }

    // Get unique chat room IDs for a user
    public List<String> getChatRoomIDsForUser(String userEmail) {
        return userchatRepo.getChatRoomIDsForUser(userEmail);
    }

    public String getRecipientEmail(String chatRoomId) {
        return userchatRepo.getRecipientEmail(chatRoomId);
    }

}
