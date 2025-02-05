import Message from "./Message";
import User from "./User";
export default interface IConversation {
  id: string;
  participants: string[];
  messages: Message[];
  otherUser: User;
  createdAt: string;
}
