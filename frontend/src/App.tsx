import { useState } from "react";

import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";
import { sendMessage } from "./services/api";

type Message = {
  text: string;
  sender: "user" | "assistant";
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      text: message,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    const data = await sendMessage(message);

    setLoading(false);  

    const assistantMessage: Message = {
      text: data.response,
      sender: "assistant",
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <>
      <h1>Coding Assistant</h1>

      <ChatWindow messages={messages} />

      {loading && (
        <p>⏳ Assistant denkt...</p>
      )}

      <ChatInput onSend={handleSend} />
    </>
  );
}

export default App;