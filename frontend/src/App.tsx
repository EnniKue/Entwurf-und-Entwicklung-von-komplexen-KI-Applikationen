import { useState } from "react";

import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";
import { sendMessage } from "./services/api";
import TracePanel from "./components/TracePanel";
import LoadingIndicator from "./components/LoadingIndicator";
import ProgressBar from "./components/ProgressBar";

type Message = {
  text: string;
  sender: "user" | "assistant";
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [traces, setTraces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      text: message,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setProgress(25);
    setTraces((prev) => [
      ...prev,
      "Nachricht empfangen",
    ]);

    setLoading(true);

    setProgress(50);

    setTraces((prev) => [
      ...prev,
      "LLM Anfrage gestartet",
    ]);

    const data = await sendMessage(message);
    setProgress(75);

    setLoading(false);  

    setTraces((prev) => [
      ...prev,
      "Antwort erhalten",
    ]);

    const assistantMessage: Message = {
      text: data.response,
      sender: "assistant",
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setProgress(100);
  };

  return (
    <>
  <h1
    style={{
      marginBottom: "20px",
    }}
  >
    Coding Assistant
  </h1>

  <div
    style={{
      display: "flex",
      gap: "20px",
      height: "500px",
    }}
  >
    <div
      style={{
        flex: 2,
        border: "1px solid gray",
        padding: "10px",
        overflowY: "auto",
      }}
    >
      <>
        <ChatWindow messages={messages} />

        {loading && <LoadingIndicator />}
  </>
    </div>

   <div
      style={{
        flex: 1,
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "15px",
        overflowY: "auto",
        backgroundColor: "#f9fafb",
      }}
    >
      <ProgressBar progress={progress} />

      <TracePanel traces={traces} />
    </div>
  </div>

  <ChatInput onSend={handleSend} />
</>
  );
}

export default App;