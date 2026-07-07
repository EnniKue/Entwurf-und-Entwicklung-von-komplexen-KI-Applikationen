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

import type { TraceEvent } from "./services/api";

import TracePanel from "./components/TracePanel";
import LoadingIndicator from "./components/LoadingIndicator";
import ProgressBar from "./components/ProgressBar";
import ContextMenu from "./components/ContextMenu";

type Message = {
  text: string;
  sender: "user" | "assistant";
  route?: string;
  streaming?: boolean;
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
  const eventSourceRef = 
    useRef<EventSource | null>(null);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, [messages]);

   useEffect(() => {
    connectToTraceStream((payload: TraceEvent) => {
      if (payload.event === "token") {
 
        setMessages((prev) => {

          if (prev.length === 0) {
            return prev;
          }

          const copy = [...prev];

          const last = copy[copy.length - 1];

          if (
            last &&
            last.sender === "assistant" &&
            last.streaming
          ) {

            copy[copy.length - 1] = {
              ...last,
              text: last.text + (payload.data ?? ""),
            };

          }

          return copy;

        });

        return;
      }

     if (payload.event) {
      setTraces((prev) => [
        ...prev,
        payload.event,
      ]);
    }

      switch (payload.event) {
        case "Nachricht empfangen":
          setProgress(10);
          break;

        case "Wissensbasis durchsuchen":
          setProgress(30);
          break;

        case "Wissensbasis gefunden":
          setProgress(60);
          break;

        case "LLM gestartet":
          setProgress(60);
          break;

        case "Antwort erzeugt":
          setProgress(90);
          break;

        case "finished":

          setMessages((prev) => {

            if (prev.length === 0) {
              return prev;
            }

            const copy = [...prev];

            const last = copy[copy.length - 1];

            copy[copy.length - 1] = {
              ...last,
              text: payload.data.response,
              route: payload.data.route,
              streaming: false,
            };

            return copy;
          });

          setLoading(false);

          break;

        case "Antwort zurück":
          
          setProgress(100);

          break;
                  
                default:
                  break;
              }
            }).then((source) => {
              eventSourceRef.current = source;
            });

            return () => {
              eventSourceRef.current?.close();
            };
          }, []);

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

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        text: "",
        sender: "assistant",
        streaming: true,
      },
    ]);

    setLoading(true);

    try {
      await sendMessage(message);
      
    } catch (error: any) {
      console.log(error);

      setLoading(false);

      let errorMessage = "Es ist ein Fehler aufgetreten.";

      // Backend nicht erreichbar
      if (error.message === "HTTP_502") {
        errorMessage =
          "Backend derzeit nicht erreichbar. Bitte später erneut versuchen.";
      }

      // Timeout
      else if (error.message === "TIMEOUT") {
        errorMessage =
          "Anfrage dauert zu lange. Bitte erneut versuchen.";
      }

      // LLM nicht verfügbar
      else if (error.message === "LLM_UNAVAILABLE") {
        errorMessage =
          "Sprachmodell aktuell nicht verfügbar.";
      }

      // Ungültige Antwort 1
      else if (error.message === "EMPTY_RESPONSE") {
        errorMessage =
          "Antwort konnte nicht verarbeitet werden.";
      }

      // Ungültige Antwort 2
      else if (error.message === "INVALID_RESPONSE") {
        errorMessage =
          "Antwort konnte nicht verarbeitet werden.";
      }

      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
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
      fontSize: "22px",
      fontWeight: 600,
      color: "#1f2937",
    }}
  >
    Onboarding-Assistent
  </h1>

  <div
    style={{
      display: "flex",
      gap: "20px",
      height: "600px",
    }}
  >
    <div
      onContextMenu={handleContextMenu}
      style={{
        flex: 3,
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
        width: "280px",
        flexShrink: 0,
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
  
   
  <div
    style={{
      marginTop: "18px",
      padding: "0 30px 24px 30px",
    }}
  >
    <ChatInput
      onSend={handleSend}
      loading={loading}
    />
  </div>
</>
  );
}

export default App;