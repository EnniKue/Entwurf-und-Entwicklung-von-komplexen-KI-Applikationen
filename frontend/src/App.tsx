import { useState, useEffect } from "react";

import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";
import { sendMessage } from "./services/api";
import TracePanel from "./components/TracePanel";
import LoadingIndicator from "./components/LoadingIndicator";
import ProgressBar from "./components/ProgressBar";
import ContextMenu from "./components/ContextMenu";

type Message = {
  text: string;
  sender: "user" | "assistant";
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [traces, setTraces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  
  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setTraces([]);
    setProgress(0);

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
      "Anfrage gestartet",
    ]);

  try {
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
   
    setTraces((prev) => [
      ...prev,
      "Antwort angezeigt",
    ]);

    setProgress(100);

   } catch (error) {
     setLoading(false);

      setTraces((prev) => [
       ...prev,
       "Antwort konnte nicht geladen werden",
     ]);

     setMessages((prev) => [
        ...prev,
        {
         text: "Es ist ein Fehler bei der Anfrage aufgetreten.",
          sender: "assistant",
        },
    ]);


      setProgress(0);
} 

  };

  const handleContextMenu = (
    event: React.MouseEvent
  ) => {
    event.preventDefault();

    setMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });

    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const clearChat = () => {
    setMessages([]);
    closeMenu();
  };

  const clearTrace = () => {
    setTraces([]);
    closeMenu();
  };

  const copyLastAnswer = async () => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender === "assistant"
      );

    if (lastAssistantMessage) {
      await navigator.clipboard.writeText(
        lastAssistantMessage.text
      );

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }

    closeMenu();
  };

  useEffect(() => {
    const handleClick = () => {
      setShowMenu(false);
    };

    window.addEventListener(
      "click",
      handleClick
    );

    return () => {
      window.removeEventListener(
        "click",
        handleClick
      );
    };
  }, []);

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
      onContextMenu={handleContextMenu}
      style={{
        flex: 2,
        border: "1px solid gray",
        padding: "10px",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <>
  <ChatWindow messages={messages} />

  {loading && <LoadingIndicator />}

  {showToast && (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",

        backgroundColor: "#dcfce7",
        color: "#000000",

        padding: "10px 18px",

        borderRadius: "10px",

        border: "1px solid #86efac",

        boxShadow:
          "0 4px 12px rgba(0,0,0,0.15)",

        fontWeight: "500",
      }}
    >
      ⧉ Antwort kopiert
    </div>
  )}
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

  {showMenu && (
    <ContextMenu
      x={menuPosition.x}
      y={menuPosition.y}
      onCopy={copyLastAnswer}
      onClearChat={clearChat}
      onClearTrace={clearTrace}
    />
  )}
  
   
  <ChatInput onSend={handleSend} />
</>
  );
}

export default App;