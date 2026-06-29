import {
  useState,
  useEffect,
  useRef,
} from "react";

import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";

import {
  sendMessage,
  connectToTraceStream,
} from "./services/api";

import TracePanel from "./components/TracePanel";
import LoadingIndicator from "./components/LoadingIndicator";
import ProgressBar from "./components/ProgressBar";
import ContextMenu from "./components/ContextMenu";

type Message = {
  text: string;
  sender: "user" | "assistant";
  route?: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [traces, setTraces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const messagesEndRef =
   useRef<HTMLDivElement>(null);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, [messages]);

  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  
  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const eventSource =
      connectToTraceStream((event) => {

        setTraces((prev) => [
          ...prev,
          event,
        ]);

      });

    setTraces([]);
    setProgress(0);

    const userMessage: Message = {
      text: message,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setProgress(25);
    
    setLoading(true);

    setProgress(50);

  try {
    const data = await sendMessage(message);

    const routeNames: Record<string, string> = {
      knowledge_base: "Wissensbasis",
      llm: "KI-Modell",
    };

    const routeName =
      routeNames[data.route] ?? data.route;

    setProgress(75);

    setLoading(false);  

    const assistantMessage: Message = {
      text: data.response,
      sender: "assistant",
      route: data.route,
    };

    setMessages((prev) => [...prev, assistantMessage]);
   
        setProgress(100);

        setTimeout(() => {
          eventSource.close();
        }, 1000);

        eventSource.close();

  } catch (error: any) {

      console.log(error);

      setLoading(false);

      let errorMessage =
        "Es ist ein Fehler aufgetreten.";

      let traceMessage =
        "Fehler aufgetreten";

      // Backend nicht erreichbar
      if (error.message === "HTTP_502") {

        errorMessage =
          "Backend derzeit nicht erreichbar. Bitte später erneut versuchen.";

        traceMessage =
          "Backend nicht erreichbar";

      }

      // Timeout
      else if (error.message === "TIMEOUT") {

        errorMessage =
          "Anfrage dauert zu lange. Bitte erneut versuchen.";

        traceMessage =
          "Timeout";
      }

      // LLM nicht verfügbar
      else if (error.message === "LLM_UNAVAILABLE") {

        errorMessage =
          "Sprachmodell aktuell nicht verfügbar.";

        traceMessage =
          "LLM nicht verfügbar";
      }

       // Ungültige Antwort 1
      else if (error.message === "EMPTY_RESPONSE") {

        errorMessage =
          "Antwort konnte nicht verarbeitet werden.";

        traceMessage =
          "Ungültige Antwort";
      } 

      // Ungültige Antwort 2
      else if (error.message === "INVALID_RESPONSE") {

        errorMessage =
          "Antwort konnte nicht verarbeitet werden.";

        traceMessage =
          "Ungültige Antwort";
      }
      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          sender: "assistant",
        },
      ]);

      setProgress(0);

      eventSource.close();
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

  <div ref={messagesEndRef} />

  {showToast && (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",

        backgroundColor: "#dcfce7",
        color: "#000000",

        padding: "8px 14px",

        borderRadius: "10px",

        fontSize: "14px",

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