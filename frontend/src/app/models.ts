export interface Events {
    name: string,
    id: string,
    imageUrl: string,
    localDate: string,
    localTime: string
}

export interface EventDetails {
    name: string;
    eventUrl: string;
    imageUrl: string;
    localDate: string;
    localTime: string;
    venue: {
      name: string;
      url: string;
      address: string;
    };
    seatMapUrl: string;
}

export interface User {
    email: string,
    password: string
}

export interface Profile {
    email:string,
    userName: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    phoneNo: string,
    pictureId: string,
}

export interface UserSlice {
    email: string;
}

export interface ChatMessage{
    sender: string; // name of sender
    content: string; // Content of the message
    timestamp: Date; // Timestamp indicating when the message was sent
}

export interface ChatGroup {
    eventId: string;
    groupId: string;
    groupName: string;
    creator: string;
    users: string[]; // List of users in the group
    messageCount: number; // Number of messages in the group
    userCount: number;
    timestamp: Date; // Use Date object for timestamps
}