package vttp.batch4.proj.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import vttp.batch4.proj.backend.models.ChatGroup;
import vttp.batch4.proj.backend.models.ChatMessage;
import vttp.batch4.proj.backend.repositories.ChatGroupRepository;
import vttp.batch4.proj.backend.repositories.ChatRepository;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepo;

    @Autowired
    private ChatGroupRepository chatGroupRepo;

    // Chat Groups
    public void saveGroups(ChatGroup chatgroup) {
        chatGroupRepo.saveGroup(chatgroup);
    }

    public List<ChatGroup> getGroupsByEventId(String eventId) {
        return chatGroupRepo.getgroupsByEventId(eventId);
    }

    public void addUsersToGroup(String groupId, String email) {
        chatGroupRepo.addUserstoGroup(groupId, email);
    }

    // Chat Messages

    public String saveMessages(ChatMessage chat) {
        return chatRepo.saveMessages(chat);
    }

    public List<ChatMessage> getMessagesByGroupId(String groupId) {
        return chatRepo.getMessagesByGroupId(groupId);
    }

}
