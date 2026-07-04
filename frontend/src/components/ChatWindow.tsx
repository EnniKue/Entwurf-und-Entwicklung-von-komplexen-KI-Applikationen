import ChatMessage from "./ChatMessage";

type Message = {
  text: string;
  sender: "user" | "assistant";
  route?: string;
  streaming?: boolean;
};

type Props = {
  messages: Message[];
};

export default function ChatWindow({
  messages,
}: Props) {
  return (
    <div
      style={{
        padding: "10px",
      }}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          text={message.text}
          sender={message.sender}
          route={message.route}
        />
      ))}
    </div>
  );
}